import { describe, it, expect, beforeEach } from 'vitest';
import { calculateFirstDueDate, recalculateTaskStatus, calculateNextDueDate, clearRecurrenceCache } from '../lib/recurrence';
import type { Task } from '../lib/data';

describe('Phase 17 — Recurrence Engine Tests', () => {
  beforeEach(() => {
    clearRecurrenceCache();
  });

  const baseTask: Task = {
    id: 'test-task-1',
    title: 'Daily Exercise',
    category: 'personal',
    priority: 'high',
    status: 'due',
    repeatType: 'daily',
    repeatInterval: 1,
    completionLogic: 'fixed',
    startDate: '2026-08-20',
    completionRate: 85,
    streak: 5,
    totalCompleted: 20,
    totalMissed: 3,
  };

  it('correctly calculates initial status based on start date', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    expect(calculateFirstDueDate(yesterday)).toBe('overdue');
    expect(calculateFirstDueDate(today)).toBe('due');
    expect(calculateFirstDueDate(tomorrow)).toBe('upcoming');
  });

  it('correctly recalculates task status for active and completed tasks', () => {
    expect(recalculateTaskStatus({ status: 'completed' })).toBe('completed');
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    expect(recalculateTaskStatus({ startDate: yesterday, status: 'due' })).toBe('overdue');
  });

  it('calculates next due date for daily tasks', () => {
    const nextDate = calculateNextDueDate(baseTask, '2026-08-20');
    expect(nextDate).toBe('2026-08-21');
  });

  it('calculates next due date for weekly tasks', () => {
    const weeklyTask = { ...baseTask, repeatType: 'weekly' as const };
    const nextDate = calculateNextDueDate(weeklyTask, '2026-08-20');
    expect(nextDate).toBe('2026-08-27');
  });

  it('calculates next due date for monthly tasks', () => {
    const monthlyTask = { ...baseTask, repeatType: 'monthly' as const };
    const nextDate = calculateNextDueDate(monthlyTask, '2026-08-20');
    expect(nextDate).toBe('2026-09-20');
  });

  it('calculates custom interval repeat types (every X days)', () => {
    const customTask = { ...baseTask, repeatType: 'every_x_days' as const, repeatInterval: 3 };
    const nextDate = calculateNextDueDate(customTask, '2026-08-20');
    expect(nextDate).toBe('2026-08-23');
  });

  it('uses memoized cache for identical calculation queries', () => {
    const date1 = calculateNextDueDate(baseTask, '2026-08-20');
    const date2 = calculateNextDueDate(baseTask, '2026-08-20');
    expect(date1).toBe(date2);
  });
});
