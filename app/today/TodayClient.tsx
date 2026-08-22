'use client';

import { useState, useTransition, useOptimistic } from 'react';
import AppShell from '../components/AppShell';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCard from '../components/TaskCard';
import { Task } from '../../lib/data';
import { completeTaskAction, deleteTaskAction, skipTaskAction, uncheckTaskAction, editTaskAction } from '../actions/tasks';

const ONE_DAY = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 5;

function getDateStr(daysFromNow: number) {
  const d = new Date(Date.now() + daysFromNow * ONE_DAY);
  return d.toISOString().split('T')[0];
}

type SortOption = 'dueDate' | 'priority' | 'recentlyCreated' | 'alphabetical';

function sortTasks(tasks: Task[], sortBy: SortOption): Task[] {
  const sorted = [...tasks];
  if (sortBy === 'priority') {
    const pRank: Record<string, number> = { high: 1, medium: 2, low: 3 };
    return sorted.sort((a, b) => (pRank[a.priority] || 4) - (pRank[b.priority] || 4));
  }
  if (sortBy === 'recentlyCreated') {
    return sorted.sort((a, b) => (b.createdAt || b.startDate).localeCompare(a.createdAt || a.startDate));
  }
  if (sortBy === 'alphabetical') {
    return sorted.sort((a, b) => a.title.localeCompare(b.title));
  }
  return sorted.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function groupTasks(tasks: Task[], sortBy: SortOption) {
  const today = getDateStr(0);
  const tomorrow = getDateStr(1);
  const in2 = getDateStr(2);
  const in3 = getDateStr(3);
  const in7 = getDateStr(7);

  const filterAndSort = (fn: (t: Task) => boolean) => sortTasks(tasks.filter(fn), sortBy);

  const groups: { label: string; emoji: string; tasks: Task[]; color: string }[] = [
    { label: 'Overdue', emoji: '🚨', tasks: filterAndSort(t => t.status === 'overdue'), color: '#ef4444' },
    { label: 'Today', emoji: '☀️', tasks: filterAndSort(t => t.status === 'due' || (t.startDate === today && t.status !== 'overdue')), color: '#f59e0b' },
    { label: 'Tomorrow', emoji: '🌅', tasks: filterAndSort(t => t.startDate === tomorrow && t.status === 'upcoming'), color: '#0ea5e9' },
    { label: 'In 2 Days', emoji: '📆', tasks: filterAndSort(t => t.startDate === in2 && t.status === 'upcoming'), color: '#8b5cf6' },
    { label: 'In 3 Days', emoji: '🗓️', tasks: filterAndSort(t => t.startDate === in3 && t.status === 'upcoming'), color: '#6366f1' },
    { label: 'Within 1 Week', emoji: '📅', tasks: filterAndSort(t => t.startDate > in3 && t.startDate <= in7 && t.status === 'upcoming'), color: '#10b981' },
  ];

  return groups.filter(g => g.tasks.length > 0);
}

export default function TodayClient({ initialTasks }: { initialTasks: Task[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [pageMap, setPageMap] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  // Optimistic UI updates for high performance
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (current, action: { type: 'complete' | 'uncheck' | 'delete' | 'skip'; id: string }) => {
      if (action.type === 'complete') {
        return current.map(t => t.id === action.id ? { ...t, status: 'completed' as const } : t);
      }
      if (action.type === 'uncheck') {
        return current.map(t => t.id === action.id ? { ...t, status: 'due' as const } : t);
      }
      if (action.type === 'delete' || action.type === 'skip') {
        return current.filter(t => t.id !== action.id);
      }
      return current;
    }
  );

  const groups = groupTasks(optimisticTasks, sortBy);
  const todayLike = optimisticTasks.filter(t => t.status === 'due' || t.status === 'overdue' || t.status === 'completed');
  const due = todayLike.filter(t => t.status === 'due').length;
  const overdue = todayLike.filter(t => t.status === 'overdue').length;
  const completed = todayLike.filter(t => t.status === 'completed').length;
  const total = due + overdue + completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleComplete = (id: string) => {
    startTransition(() => {
      setOptimisticTasks({ type: 'complete', id });
      completeTaskAction(id);
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' as const } : t));
  };

  const handleUncheck = (id: string) => {
    startTransition(() => {
      setOptimisticTasks({ type: 'uncheck', id });
      uncheckTaskAction(id);
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'due' as const } : t));
  };

  const handleSkip = (id: string) => {
    startTransition(() => {
      setOptimisticTasks({ type: 'skip', id });
      skipTaskAction(id);
    });
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleDelete = (id: string) => {
    startTransition(() => {
      setOptimisticTasks({ type: 'delete', id });
      deleteTaskAction(id);
    });
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveEdit = (updated: Record<string, unknown>) => {
    startTransition(() => { editTaskAction(updated as unknown as Task); });
    setTasks(prev => prev.map(t => t.id === (updated as unknown as Task).id ? (updated as unknown as Task) : t));
    setEditingTask(null);
  };

  const getGroupPage = (groupLabel: string) => pageMap[groupLabel] || 1;
  const setGroupPage = (groupLabel: string, p: number) => setPageMap(prev => ({ ...prev, [groupLabel]: p }));

  return (
    <>
      <AppShell onAddTask={() => setModalOpen(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, opacity: isPending ? 0.85 : 1 }}>

          {/* Header */}
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                ☀️ Today & Timeline View
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Controls: Sorting & Add */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Sort:</span>
                <select
                  id="task-sort-select"
                  className="input"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  style={{ width: 160, padding: '6px 12px' }}
                >
                  <option value="dueDate">📅 Due Date</option>
                  <option value="priority">🔴 Priority</option>
                  <option value="recentlyCreated">⚡ Recently Created</option>
                  <option value="alphabetical">🔤 Alphabetical</option>
                </select>
              </div>
              <button id="today-add-btn" className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add Task</button>
            </div>
          </div>

          {/* Progress ring area */}
          <div className="animate-fade-in delay-100 card" style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 28 }}>
            <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent-color)" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - rate / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--foreground)' }}>{rate}%</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>done</div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { label: 'Due', value: due, color: '#f59e0b', icon: '📅' },
                { label: 'Overdue', value: overdue, color: '#ef4444', icon: '🚨' },
                { label: 'Completed', value: completed, color: '#10b981', icon: '✅' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center', padding: '12px', background: 'var(--surface-muted)', borderRadius: 12 }}>
                  <div style={{ fontSize: 20 }}>{stat.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, marginTop: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Grouped Timeline with Pagination */}
          {groups.length === 0 ? (
            <div className="empty-state">
              <div className="animate-float" style={{ fontSize: 64 }}>🎉</div>
              <h3 style={{ margin: '16px 0 0', fontSize: 18, fontWeight: 700, color: 'var(--foreground)' }}>All clear!</h3>
              <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 14 }}>No upcoming tasks in the next week.</p>
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setModalOpen(true)}>Create Task</button>
            </div>
          ) : (
            groups.map(group => {
              const currentPage = getGroupPage(group.label);
              const totalPages = Math.ceil(group.tasks.length / PAGE_SIZE);
              const paginatedTasks = group.tasks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

              return (
                <section key={group.label} className="animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{group.emoji}</span>
                      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: group.color }}>
                        {group.label}
                      </h2>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99,
                        background: `${group.color}22`, color: group.color,
                      }}>
                        {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          className="btn btn-secondary btn-xs"
                          disabled={currentPage === 1}
                          onClick={() => setGroupPage(group.label, currentPage - 1)}
                        >
                          ‹ Prev
                        </button>
                        <button
                          className="btn btn-secondary btn-xs"
                          disabled={currentPage === totalPages}
                          onClick={() => setGroupPage(group.label, currentPage + 1)}
                        >
                          Next ›
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{
                    borderLeft: `3px solid ${group.color}44`,
                    paddingLeft: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}>
                    {paginatedTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={handleComplete}
                        onUncheck={handleUncheck}
                        onSkip={handleSkip}
                        onEdit={() => setEditingTask(task)}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </AppShell>
      {(modalOpen || editingTask) && (
        <CreateTaskModal
          initialTask={editingTask}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
          onSave={editingTask ? handleSaveEdit : undefined}
        />
      )}
    </>
  );
}
