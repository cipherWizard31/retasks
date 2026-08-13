'use server'

import { completeTaskDb, deleteTaskDb, createTaskDb } from '@/lib/db'
import type { Task } from '@/lib/data'
import { revalidatePath } from 'next/cache'

export async function completeTaskAction(id: string) {
  completeTaskDb(id)
  revalidatePath('/')
}

export async function deleteTaskAction(id: string) {
  deleteTaskDb(id)
  revalidatePath('/')
}

export async function createTaskAction(task: Task) {
  createTaskDb(task)
  revalidatePath('/')
}
