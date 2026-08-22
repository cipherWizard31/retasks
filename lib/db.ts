import 'server-only'
import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
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
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      bio TEXT,
      timezone TEXT DEFAULT 'UTC',
      preferences TEXT
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS password_resets_token_idx ON password_resets(token);

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      repeatType TEXT NOT NULL,
      repeatInterval INTEGER,
      repeatUnit TEXT,
      reminderTime TEXT,
      startDate TEXT NOT NULL,
      completionLogic TEXT NOT NULL,
      completionRate REAL NOT NULL DEFAULT 0,
      streak INTEGER NOT NULL DEFAULT 0,
      totalCompleted INTEGER NOT NULL DEFAULT 0,
      totalMissed INTEGER NOT NULL DEFAULT 0,
      isArchived INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE TABLE IF NOT EXISTS daily_logs (
      date TEXT PRIMARY KEY NOT NULL,
      tasks_completed INTEGER NOT NULL DEFAULT 0,
      tasks_due INTEGER NOT NULL DEFAULT 0,
      met_goal INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS task_completions (
      id TEXT PRIMARY KEY NOT NULL,
      task_id TEXT NOT NULL,
      completion_date TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS task_completions_task_id_idx ON task_completions(task_id);

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      is_custom INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `)

  try { database.exec(`ALTER TABLE users ADD COLUMN bio TEXT;`) } catch {}
  try { database.exec(`ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC';`) } catch {}
  try { database.exec(`ALTER TABLE users ADD COLUMN preferences TEXT;`) } catch {}
  try { database.exec(`ALTER TABLE tasks ADD COLUMN repeatUnit TEXT;`) } catch {}
  try { database.exec(`ALTER TABLE tasks ADD COLUMN isArchived INTEGER NOT NULL DEFAULT 0;`) } catch {}
  try { database.exec(`ALTER TABLE tasks ADD COLUMN createdAt TEXT;`) } catch {}
  try { database.exec(`ALTER TABLE tasks ADD COLUMN updatedAt TEXT;`) } catch {}

  return database
}

export const db = globalForDb.__retasksDb ?? createDatabase()

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    bio TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferences TEXT
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    repeatType TEXT NOT NULL,
    repeatInterval INTEGER,
    repeatUnit TEXT,
    reminderTime TEXT,
    startDate TEXT NOT NULL,
    completionLogic TEXT NOT NULL,
    completionRate REAL NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    totalCompleted INTEGER NOT NULL DEFAULT 0,
    totalMissed INTEGER NOT NULL DEFAULT 0,
    isArchived INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS daily_logs (
    date TEXT PRIMARY KEY NOT NULL,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    tasks_due INTEGER NOT NULL DEFAULT 0,
    met_goal INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS task_completions (
    id TEXT PRIMARY KEY NOT NULL,
    task_id TEXT NOT NULL,
    completion_date TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS task_completions_task_id_idx ON task_completions(task_id);

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    is_custom INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`)

try { db.exec(`ALTER TABLE users ADD COLUMN bio TEXT;`) } catch {}
try { db.exec(`ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC';`) } catch {}
try { db.exec(`ALTER TABLE users ADD COLUMN preferences TEXT;`) } catch {}
try { db.exec(`ALTER TABLE tasks ADD COLUMN repeatUnit TEXT;`) } catch {}
try { db.exec(`ALTER TABLE tasks ADD COLUMN isArchived INTEGER NOT NULL DEFAULT 0;`) } catch {}
try { db.exec(`ALTER TABLE tasks ADD COLUMN createdAt TEXT;`) } catch {}
try { db.exec(`ALTER TABLE tasks ADD COLUMN updatedAt TEXT;`) } catch {}

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__retasksDb = db
}

export type UserRow = {
  id: string
  name: string
  email: string
  password_hash: string
  created_at: string
  bio?: string | null
  timezone?: string | null
  preferences?: string | null
}

export type PasswordResetRow = {
  id: string
  email: string
  token: string
  expires_at: string
  created_at: string
}

export function getUserByEmail(email: string): UserRow | undefined {
  return db
    .prepare('SELECT id, name, email, password_hash, created_at, bio, timezone, preferences FROM users WHERE email = ?')
    .get(email.toLowerCase()) as unknown as UserRow | undefined
}

export function getUserById(id: string): UserRow | undefined {
  return db
    .prepare('SELECT id, name, email, password_hash, created_at, bio, timezone, preferences FROM users WHERE id = ?')
    .get(id) as unknown as UserRow | undefined
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

export function updateUserProfileDb(id: string, input: {
  name: string
  email: string
  bio?: string | null
  timezone?: string | null
  preferences?: string | null
}) {
  db.prepare(`
    UPDATE users SET
      name = ?,
      email = ?,
      bio = ?,
      timezone = ?,
      preferences = ?
    WHERE id = ?
  `).run(input.name, input.email.toLowerCase(), input.bio || null, input.timezone || 'UTC', input.preferences || null, id)
}

export function updateUserPassword(email: string, passwordHash: string) {
  db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, email.toLowerCase())
}

export function createPasswordResetRow(input: {
  id: string
  email: string
  token: string
  expiresAt: string
  createdAt: string
}) {
  db.prepare(
    'INSERT INTO password_resets (id, email, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(input.id, input.email.toLowerCase(), input.token, input.expiresAt, input.createdAt)
}

export function getPasswordResetByToken(token: string): PasswordResetRow | undefined {
  return db
    .prepare('SELECT id, email, token, expires_at, created_at FROM password_resets WHERE token = ?')
    .get(token) as unknown as PasswordResetRow | undefined
}

export function deletePasswordResetRow(token: string) {
  db.prepare('DELETE FROM password_resets WHERE token = ?').run(token)
}

export type SessionRow = {
  id: string
  user_id: string
  expires_at: string
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
    .get(id) as unknown as SessionRow | undefined
}

export function deleteSessionRow(id: string) {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id)
}

export function deleteExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(new Date().toISOString())
}

import type { Task } from './data'
import { calculateFirstDueDate, recalculateTaskStatus, calculateNextDueDate } from './recurrence'

export function getTasks(includeArchived: boolean = false): Task[] {
  const query = includeArchived ? 'SELECT * FROM tasks' : 'SELECT * FROM tasks WHERE isArchived = 0'
  const rows = db.prepare(query).all() as unknown as Task[]
  return rows.map(row => ({ ...row }))
}

export function getArchivedTasks(): Task[] {
  const rows = db.prepare('SELECT * FROM tasks WHERE isArchived = 1').all() as unknown as Task[]
  return rows.map(row => ({ ...row }))
}

export function completeTaskDb(id: string) {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as unknown as Task | undefined
  const now = new Date().toISOString()
  if (!task) {
    db.prepare('UPDATE tasks SET status = ?, totalCompleted = totalCompleted + 1, updatedAt = ? WHERE id = ?').run(
      'completed',
      now,
      id
    )
    return
  }

  const nextDueDate = calculateNextDueDate(task)
  db.prepare(`
    UPDATE tasks SET 
      status = 'completed', 
      totalCompleted = totalCompleted + 1, 
      updatedAt = ? 
    WHERE id = ?
  `).run(now, id)
}

export function skipTaskDb(id: string) {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as unknown as Task | undefined
  if (!task) return

  const nextDueDate = calculateNextDueDate(task)
  const todayStr = new Date().toISOString().split('T')[0]
  const newStatus = nextDueDate <= todayStr ? 'due' : 'upcoming'

  db.prepare('UPDATE tasks SET startDate = ?, status = ?, totalMissed = totalMissed + 1, updatedAt = ? WHERE id = ?').run(
    nextDueDate,
    newStatus,
    new Date().toISOString(),
    id
  )
}

export function uncheckTaskDb(id: string) {
  db.prepare('UPDATE tasks SET status = ?, updatedAt = ? WHERE id = ?').run('due', new Date().toISOString(), id)
}

export function deleteTaskDb(id: string) {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
}

export function softDeleteTaskDb(id: string) {
  db.prepare('UPDATE tasks SET isArchived = 1, updatedAt = ? WHERE id = ?').run(new Date().toISOString(), id)
}

export function restoreTaskDb(id: string) {
  db.prepare('UPDATE tasks SET isArchived = 0, updatedAt = ? WHERE id = ?').run(new Date().toISOString(), id)
}

export function createTaskDb(input: Task) {
  const now = new Date().toISOString()
  const initialStatus = input.status || calculateFirstDueDate(input.startDate)

  db.prepare(`
    INSERT INTO tasks (
      id, title, description, category, priority, status, repeatType, 
      repeatInterval, repeatUnit, reminderTime, startDate, completionLogic, 
      completionRate, streak, totalCompleted, totalMissed, isArchived, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.id,
    input.title,
    input.description || null,
    input.category,
    input.priority,
    initialStatus,
    input.repeatType,
    input.repeatInterval || null,
    input.repeatUnit || null,
    input.reminderTime || null,
    input.startDate,
    input.completionLogic,
    input.completionRate || 0,
    input.streak || 0,
    input.totalCompleted || 0,
    input.totalMissed || 0,
    input.isArchived ? 1 : 0,
    input.createdAt || now,
    input.updatedAt || now
  )
}

export function editTaskDb(input: Task) {
  const now = new Date().toISOString()
  const updatedStatus = recalculateTaskStatus(input)

  db.prepare(`
    UPDATE tasks SET
      title = ?, description = ?, category = ?, priority = ?,
      repeatType = ?, repeatInterval = ?, repeatUnit = ?, reminderTime = ?,
      startDate = ?, completionLogic = ?, status = ?, isArchived = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    input.title,
    input.description || null,
    input.category,
    input.priority,
    input.repeatType,
    input.repeatInterval || null,
    input.repeatUnit || null,
    input.reminderTime || null,
    input.startDate,
    input.completionLogic,
    updatedStatus,
    input.isArchived ? 1 : 0,
    now,
    input.id
  )
}

export function archiveTaskDb(id: string, isArchived: boolean) {
  db.prepare('UPDATE tasks SET isArchived = ?, updatedAt = ? WHERE id = ?').run(
    isArchived ? 1 : 0,
    new Date().toISOString(),
    id
  )
}

export type DailyLog = {
  date: string
  tasks_completed: number
  tasks_due: number
  met_goal: number
}

export function getDailyLogs(): DailyLog[] {
  return db.prepare('SELECT * FROM daily_logs ORDER BY date DESC').all() as unknown as DailyLog[]
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

export type TaskCompletionRow = {
  id: string
  task_id: string
  completion_date: string
  completed_at: string
  notes?: string | null
}

export function recordTaskCompletionDb(input: {
  id?: string
  taskId: string
  completionDate?: string
  completedAt?: string
  notes?: string | null
}) {
  const completionId = input.id || randomUUID()
  const now = new Date().toISOString()
  const completionDate = input.completionDate || now.split('T')[0]
  const completedAt = input.completedAt || now

  db.prepare(`
    INSERT INTO task_completions (id, task_id, completion_date, completed_at, notes)
    VALUES (?, ?, ?, ?, ?)
  `).run(completionId, input.taskId, completionDate, completedAt, input.notes || null)

  completeTaskDb(input.taskId)
  return completionId
}

export function getTaskCompletionsDb(taskId?: string): TaskCompletionRow[] {
  if (taskId) {
    return db
      .prepare('SELECT id, task_id, completion_date, completed_at, notes FROM task_completions WHERE task_id = ? ORDER BY completed_at DESC')
      .all(taskId) as unknown as TaskCompletionRow[]
  }
  return db
    .prepare('SELECT id, task_id, completion_date, completed_at, notes FROM task_completions ORDER BY completed_at DESC')
    .all() as unknown as TaskCompletionRow[]
}

export function deleteTaskCompletionDb(id: string) {
  db.prepare('DELETE FROM task_completions WHERE id = ?').run(id)
}

export function clearAllTaskCompletionsDb() {
  db.prepare('DELETE FROM task_completions').run()
}

export type CategoryRow = {
  id: string
  slug: string
  label: string
  icon: string
  color: string
  is_custom: number
  created_at: string
}

export function createCustomCategoryDb(input: {
  label: string
  icon: string
  color: string
}) {
  const id = randomUUID()
  const slug = input.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || id
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO categories (id, slug, label, icon, color, is_custom, created_at)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `).run(id, slug, input.label, input.icon, input.color, now)

  return { id, slug, label: input.label, icon: input.icon, color: input.color, is_custom: 1, created_at: now }
}

export function editCustomCategoryDb(id: string, input: {
  label: string
  icon: string
  color: string
}) {
  const slug = input.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || id
  db.prepare(`
    UPDATE categories
    SET label = ?, icon = ?, color = ?, slug = ?
    WHERE id = ?
  `).run(input.label, input.icon, input.color, slug, id)
}

export function deleteCustomCategoryDb(id: string) {
  db.prepare('DELETE FROM categories WHERE id = ?').run(id)
}

export function getCategoriesDb(): CategoryRow[] {
  return db.prepare('SELECT id, slug, label, icon, color, is_custom, created_at FROM categories ORDER BY is_custom ASC, label ASC').all() as unknown as CategoryRow[]
}

