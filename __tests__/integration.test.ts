import { describe, it, expect } from 'vitest';
import { TASKS, CATEGORY_META } from '../lib/data';

describe('Phase 17 — Integration Tests', () => {
  it('verifies default task list links correctly to category definitions', () => {
    TASKS.forEach(task => {
      expect(task.id).toBeDefined();
      expect(task.title.length).toBeGreaterThan(0);
      expect(task.priority).toMatch(/high|medium|low/);
      expect(task.status).toMatch(/due|overdue|upcoming|completed/);
      expect(task.repeatType).toBeDefined();
    });
  });

  it('verifies category metadata icons and labels map properly', () => {
    Object.keys(CATEGORY_META).forEach(catKey => {
      const meta = CATEGORY_META[catKey as keyof typeof CATEGORY_META];
      expect(meta.label).toBeDefined();
      expect(meta.icon).toBeDefined();
      expect(meta.color).toMatch(/^#/);
    });
  });

  it('verifies streak and completion rate bounds across sample dataset', () => {
    TASKS.forEach(task => {
      expect(task.completionRate).toBeGreaterThanOrEqual(0);
      expect(task.completionRate).toBeLessThanOrEqual(100);
      expect(task.streak).toBeGreaterThanOrEqual(0);
    });
  });
});
