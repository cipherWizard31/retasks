import 'server-only'
import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'

const dataDir = path.join(process.cwd(), 'data')
const dbPath = path.join(dataDir, 'retasks.db')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const globalForDb = globalThis as unknown as {
  __retasksDb?: DatabaseSync
}

function createDatabase() {
  const database = new DatabaseSync(dbPath)

  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      repeatType TEXT NOT NULL,
      repeatInterval INTEGER,
      reminderTime TEXT,
      startDate TEXT NOT NULL,
      completionLogic TEXT NOT NULL,
      completionRate REAL NOT NULL DEFAULT 0,
      streak INTEGER NOT NULL DEFAULT 0,
      totalCompleted INTEGER NOT NULL DEFAULT 0,
      totalMissed INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS daily_logs (
      date TEXT PRIMARY KEY NOT NULL,
      tasks_completed INTEGER NOT NULL DEFAULT 0,
      tasks_due INTEGER NOT NULL DEFAULT 0,
      met_goal INTEGER NOT NULL DEFAULT 0
    );
  `)

  return database
}

export const db = globalForDb.__retasksDb ?? createDatabase()

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    repeatType TEXT NOT NULL,
    repeatInterval INTEGER,
    reminderTime TEXT,
    startDate TEXT NOT NULL,
    completionLogic TEXT NOT NULL,
    completionRate REAL NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    totalCompleted INTEGER NOT NULL DEFAULT 0,
    totalMissed INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS daily_logs (
    date TEXT PRIMARY KEY NOT NULL,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    tasks_due INTEGER NOT NULL DEFAULT 0,
    met_goal INTEGER NOT NULL DEFAULT 0
  );
`)

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__retasksDb = db
}

export type UserRow = {
  id: string
  name: string
  email: string
  password_hash: string
  created_at: string
}

export type SessionRow = {
  id: string
  user_id: string
  expires_at: string
}

export function getUserByEmail(email: string): UserRow | undefined {
  return db
    .prepare('SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?')
    .get(email.toLowerCase()) as UserRow | undefined
}

export function getUserById(id: string): UserRow | undefined {
  return db
    .prepare('SELECT id, name, email, password_hash, created_at FROM users WHERE id = ?')
    .get(id) as UserRow | undefined
}

export function createUser(input: {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}) {
  db.prepare(
    'INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(input.id, input.name, input.email.toLowerCase(), input.passwordHash, input.createdAt)
}

export function createSessionRow(input: {
  id: string
  userId: string
  expiresAt: string
}) {
  db.prepare(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
  ).run(input.id, input.userId, input.expiresAt)
}

export function getSessionRow(id: string): SessionRow | undefined {
  return db
    .prepare('SELECT id, user_id, expires_at FROM sessions WHERE id = ?')
    .get(id) as SessionRow | undefined
}

export function deleteSessionRow(id: string) {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id)
}

export function deleteExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(new Date().toISOString())
}

import type { Task } from './data'

export function getTasks(): Task[] {
  const rows = db.prepare('SELECT * FROM tasks').all() as Task[]
  return rows.map(row => ({ ...row }))
}

export function completeTaskDb(id: string) {
  db.prepare('UPDATE tasks SET status = ?, totalCompleted = totalCompleted + 1 WHERE id = ?').run('completed', id)
}

export function uncheckTaskDb(id: string) {
  db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run('due', id)
}

export function deleteTaskDb(id: string) {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
}

export function createTaskDb(input: Task) {
  db.prepare(`
    INSERT INTO tasks (
      id, title, description, category, priority, status, repeatType, 
      repeatInterval, reminderTime, startDate, completionLogic, 
      completionRate, streak, totalCompleted, totalMissed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.id, input.title, input.description || null, input.category, input.priority, input.status, input.repeatType,
    input.repeatInterval || null, input.reminderTime || null, input.startDate, input.completionLogic,
    input.completionRate || 0, input.streak || 0, input.totalCompleted || 0, input.totalMissed || 0
  )
}

export function editTaskDb(input: Task) {
  db.prepare(`
    UPDATE tasks SET
      title = ?, description = ?, category = ?, priority = ?,
      repeatType = ?, repeatInterval = ?, reminderTime = ?,
      startDate = ?, completionLogic = ?, status = ?
    WHERE id = ?
  `).run(
    input.title, input.description || null, input.category, input.priority,
    input.repeatType, input.repeatInterval || null, input.reminderTime || null,
    input.startDate, input.completionLogic, input.status,
    input.id
  )
}

export type DailyLog = {
  date: string
  tasks_completed: number
  tasks_due: number
  met_goal: number
}

export function getDailyLogs(): DailyLog[] {
  return db.prepare('SELECT * FROM daily_logs ORDER BY date DESC').all() as DailyLog[]
}

export function upsertDailyLog(date: string, tasksCompleted: number, tasksDue: number, metGoal: boolean) {
  db.prepare(`
    INSERT INTO daily_logs (date, tasks_completed, tasks_due, met_goal)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      tasks_completed = excluded.tasks_completed,
      tasks_due = excluded.tasks_due,
      met_goal = excluded.met_goal
  `).run(date, tasksCompleted, tasksDue, metGoal ? 1 : 0)
}
