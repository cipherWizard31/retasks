import { describe, it, expect } from 'vitest';
import { parseImportTasks } from '../lib/data-management';
import type { Task } from '../lib/data';

describe('Phase 17 — Data Management & API Tests', () => {
  const sampleTasks: Task[] = [
    {
      id: 'task-101',
      title: 'Morning Workout',
      description: '30 min cardio session',
      category: 'health',
      priority: 'high',
      status: 'due',
      repeatType: 'daily',
      repeatInterval: 1,
      completionLogic: 'fixed',
      startDate: '2026-08-22',
      completionRate: 90,
      streak: 10,
      totalCompleted: 30,
      totalMissed: 3,
    },
  ];

  it('parses imported JSON task payload correctly', () => {
    const jsonStr = JSON.stringify(sampleTasks);
    const imported = parseImportTasks(jsonStr, false);
    expect(imported).toHaveLength(1);
    expect(imported[0].title).toBe('Morning Workout');
    expect(imported[0].category).toBe('health');
  });

  it('parses nested backup JSON payload correctly', () => {
    const backupPayload = {
      version: '1.0.0',
      timestamp: '2026-08-22T00:00:00.000Z',
      tasks: sampleTasks,
    };
    const jsonStr = JSON.stringify(backupPayload);
    const imported = parseImportTasks(jsonStr, false);
    expect(imported).toHaveLength(1);
    expect(imported[0].id).toBe('task-101');
  });

  it('parses CSV tasks formatted payload correctly', () => {
    const csvContent = `id,title,description,category,priority,status,repeatType,repeatInterval,reminderTime,startDate,completionRate,streak,totalCompleted,totalMissed
"task-102","Read Book","Chapter 4","learning","medium","due","daily","1","09:00","2026-08-22",75,5,15,5`;

    const imported = parseImportTasks(csvContent, true);
    expect(imported).toHaveLength(1);
    expect(imported[0].title).toBe('Read Book');
    expect(imported[0].category).toBe('learning');
    expect(imported[0].priority).toBe('medium');
  });

  it('handles empty or malformed import strings gracefully', () => {
    const emptyJson = parseImportTasks('[]', false);
    expect(emptyJson).toHaveLength(0);

    const malformedCsv = parseImportTasks('header\n', true);
    expect(malformedCsv).toHaveLength(0);
  });
});
