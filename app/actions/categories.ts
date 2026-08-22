'use server';

import { createCustomCategoryDb, editCustomCategoryDb, deleteCustomCategoryDb, getCategoriesDb, CategoryRow } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function fetchCategoriesAction(): Promise<CategoryRow[]> {
  return getCategoriesDb();
}

export async function createCategoryAction(input: { label: string; icon: string; color: string }) {
  const newCat = createCustomCategoryDb(input);
  revalidatePath('/categories');
  return newCat;
}

export async function editCategoryAction(id: string, input: { label: string; icon: string; color: string }) {
  editCustomCategoryDb(id, input);
  revalidatePath('/categories');
}

export async function deleteCategoryAction(id: string) {
  deleteCustomCategoryDb(id);
  revalidatePath('/categories');
}
