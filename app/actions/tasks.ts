'use server'

import {
  completeTaskDb,
  deleteTaskDb,
  softDeleteTaskDb,
  restoreTaskDb,
  createTaskDb,
  uncheckTaskDb,
  editTaskDb,
  archiveTaskDb,
  recordTaskCompletionDb,
  createCustomCategoryDb,
  skipTaskDb,
} from '@/lib/db'
import type { Task } from '@/lib/data'
import { revalidatePath } from 'next/cache'

export async function completeTaskAction(id: string) {
  completeTaskDb(id)
  revalidatePath('/')
}

export async function skipTaskAction(id: string) {
  skipTaskDb(id)
  revalidatePath('/')
}

export async function deleteTaskAction(id: string) {
  deleteTaskDb(id)
  revalidatePath('/')
}

export async function softDeleteTaskAction(id: string) {
  softDeleteTaskDb(id)
  revalidatePath('/')
}

export async function restoreTaskAction(id: string) {
  restoreTaskDb(id)
  revalidatePath('/')
}

export async function createTaskAction(task: Task) {
  createTaskDb(task)
  revalidatePath('/')
}

export async function uncheckTaskAction(id: string) {
  uncheckTaskDb(id)
  revalidatePath('/')
}

export async function editTaskAction(task: Task) {
  editTaskDb(task)
  revalidatePath('/')
}

export async function archiveTaskAction(id: string, isArchived: boolean = true) {
  archiveTaskDb(id, isArchived)
  revalidatePath('/')
}

export async function recordTaskCompletionAction(input: { taskId: string; notes?: string; completionDate?: string }) {
  recordTaskCompletionDb(input)
  revalidatePath('/')
  revalidatePath('/history')
}

export async function createCustomCategoryAction(input: { label: string; icon: string; color: string }) {
  const result = createCustomCategoryDb(input)
  revalidatePath('/categories')
  return result
}
