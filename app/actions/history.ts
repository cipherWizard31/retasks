'use server';

import { deleteTaskCompletionDb, clearAllTaskCompletionsDb, getTaskCompletionsDb, TaskCompletionRow } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getHistoryAction(taskId?: string): Promise<TaskCompletionRow[]> {
  return getTaskCompletionsDb(taskId);
}

export async function deleteHistoryEntryAction(id: string) {
  deleteTaskCompletionDb(id);
  revalidatePath('/history');
}

export async function clearAllHistoryAction() {
  clearAllTaskCompletionsDb();
  revalidatePath('/history');
}
