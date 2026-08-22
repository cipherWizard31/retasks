import type { Task, Status } from './data';

// Memoization cache for recurrence calculations
const recurrenceCache = new Map<string, string>();

/**
 * Calculates the initial status for a newly created task based on its start date.
 */
export function calculateFirstDueDate(startDateStr: string): Status {
  const todayStr = new Date().toISOString().split('T')[0];
  if (startDateStr < todayStr) {
    return 'overdue';
  } else if (startDateStr === todayStr) {
    return 'due';
  } else {
    return 'upcoming';
  }
}

/**
 * Recalculates due date and status for an edited or recurring task.
 */
export function recalculateTaskStatus(task: Partial<Task>): Status {
  const startDateStr = task.startDate || new Date().toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  if (task.status === 'completed') {
    return 'completed';
  }

  if (startDateStr < todayStr) {
    return 'overdue';
  } else if (startDateStr === todayStr) {
    return 'due';
  } else {
    return 'upcoming';
  }
}

/**
 * Efficiently calculates the next due date string (YYYY-MM-DD) with memoization.
 */
export function calculateNextDueDate(task: Task, fromDateStr?: string): string {
  const cacheKey = `${task.id}-${task.repeatType}-${task.repeatInterval || 1}-${fromDateStr || 'now'}`;
  if (recurrenceCache.has(cacheKey)) {
    return recurrenceCache.get(cacheKey)!;
  }

  const baseDate = fromDateStr ? new Date(fromDateStr) : new Date();
  const interval = task.repeatInterval || 1;
  const resultDate = new Date(baseDate);

  switch (task.repeatType) {
    case 'daily':
      resultDate.setDate(resultDate.getDate() + 1);
      break;
    case 'weekly':
      resultDate.setDate(resultDate.getDate() + 7);
      break;
    case 'monthly':
      resultDate.setMonth(resultDate.getMonth() + 1);
      break;
    case 'every_x_days':
      resultDate.setDate(resultDate.getDate() + interval);
      break;
    case 'every_x_weeks':
      resultDate.setDate(resultDate.getDate() + (interval * 7));
      break;
    case 'every_x_months':
      resultDate.setMonth(resultDate.getMonth() + interval);
      break;
    case 'custom':
    default:
      if (task.repeatUnit === 'weeks') {
        resultDate.setDate(resultDate.getDate() + (interval * 7));
      } else if (task.repeatUnit === 'months') {
        resultDate.setMonth(resultDate.getMonth() + interval);
      } else {
        resultDate.setDate(resultDate.getDate() + interval);
      }
      break;
  }

  const resultStr = resultDate.toISOString().split('T')[0];
  recurrenceCache.set(cacheKey, resultStr);
  return resultStr;
}

/**
 * Clears the recurrence calculation cache when tasks are modified.
 */
export function clearRecurrenceCache() {
  recurrenceCache.clear();
}
