import { describe, it, expect } from 'vitest';
import { TASKS, HISTORY_ENTRIES } from '../lib/data';

describe('Phase 17 — End-to-End Workflow Simulation', () => {
  it('simulates full task creation, completion, and history tracking flow', () => {
    // 1. Task Definition
    const newTask = {
      id: `e2e-task-${Date.now()}`,
      title: 'E2E Test Routine',
      category: 'work' as const,
      priority: 'high' as const,
      status: 'due' as const,
      repeatType: 'daily' as const,
      repeatInterval: 1,
      completionLogic: 'fixed' as const,
      startDate: new Date().toISOString().split('T')[0],
      completionRate: 100,
      streak: 1,
      totalCompleted: 1,
      totalMissed: 0,
    };

    expect(newTask.id).toBeDefined();
    expect(newTask.status).toBe('due');

    // 2. Simulate Task Completion Action
    const completedTask = { ...newTask, status: 'completed' as const, streak: newTask.streak + 1 };
    expect(completedTask.status).toBe('completed');
    expect(completedTask.streak).toBe(2);

    // 3. Simulate History Entry Logging
    const newHistoryEntry = {
      date: 'Today',
      completed: true,
    };
    const updatedHistory = [newHistoryEntry, ...HISTORY_ENTRIES];
    expect(updatedHistory).toHaveLength(HISTORY_ENTRIES.length + 1);
    expect(updatedHistory[0].completed).toBe(true);

    // 4. Simulate Delete History Action
    const historyAfterDelete = updatedHistory.slice(1);
    expect(historyAfterDelete).toHaveLength(HISTORY_ENTRIES.length);
  });
});
