'use client';

import { useState, useTransition } from 'react';
import AppShell from './components/AppShell';
import CreateTaskModal from './components/CreateTaskModal';
import TaskCard from './components/TaskCard';
import { Task, CATEGORY_META } from '../lib/data';
import { completeTaskAction, deleteTaskAction, createTaskAction } from './actions/tasks';

const SUMMARY_CARDS = [
  { label: 'Due Today', value: 4, icon: '📅', color: '#f59e0b' },
  { label: 'Completed', value: 6, icon: '✅', color: '#10b981' },
  { label: 'Remaining', value: 4, icon: '⏳', color: '#94a3b8' },
  { label: 'Completion Rate', value: '60%', icon: '📈', color: '#0ea5e9' },
];

export default function DashboardClient({ tasks }: { tasks: Task[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const todayTasks = tasks.filter(t => t.status === 'due' || t.status === 'overdue' || t.status === 'completed');

  const UPCOMING_GROUPS = [
    { label: 'Tomorrow', tasks: tasks.filter(t => t.status === 'upcoming') }
  ];

  const handleComplete = (id: string) => {
    startTransition(() => {
      completeTaskAction(id);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(() => {
      deleteTaskAction(id);
    });
  };

  const handleCreate = (task: Record<string, unknown>) => {
    startTransition(() => {
      createTaskAction(task as unknown as Task);
    });
  };

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  };

  return (
    <>
      <AppShell onAddTask={() => setModalOpen(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, opacity: isPending ? 0.7 : 1 }}>

          {/* Hero Greeting */}
          <div className="animate-fade-in" style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
            borderRadius: 20, padding: '28px 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 10px 40px rgba(6,78,59,0.2)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ position: 'absolute', right: 60, bottom: -60, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
            <div>
              <div style={{ fontSize: 13, color: '#6ee7b7', fontWeight: 600, marginBottom: 4 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                Good {getHour()}, Nate 👋
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: '#a7f3d0' }}>
                You have <strong style={{ color: 'white' }}>{todayTasks.filter(t => t.status !== 'completed').length} tasks</strong> due today. Let's get them done!
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 16px', backdropFilter: 'blur(8px)' }}>
                <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 600, marginBottom: 2 }}>TODAY'S STREAK</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>🔥 14 days</div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="animate-fade-in delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {SUMMARY_CARDS.map((card, i) => (
              <div
                key={card.label}
                className="stat-card"
                style={{
                  border: `1px solid color-mix(in srgb, ${card.color} 28%, var(--border))`,
                  background: `color-mix(in srgb, ${card.color} 12%, var(--surface))`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{card.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>
                      {card.label === 'Due Today' ? todayTasks.filter(t => t.status !== 'completed').length : 
                       card.label === 'Completed' ? todayTasks.filter(t => t.status === 'completed').length : 
                       card.value}
                    </div>
                  </div>
                  <div style={{ fontSize: 24 }}>{card.icon}</div>
                </div>
                {i === 3 && (
                  <div style={{ marginTop: 10 }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '60%', background: `linear-gradient(90deg, ${card.color}, ${card.color}cc)` }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Today's Tasks */}
          <section className="animate-fade-in delay-200">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>Today's Tasks</h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>{todayTasks.length} tasks scheduled for today</p>
              </div>
              <button id="add-task-btn" className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
                + Add Task
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="empty-state">
                <div className="animate-float" style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--foreground)' }}>No tasks due today!</h3>
                <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 14 }}>Enjoy your free time or create a new recurring task.</p>
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setModalOpen(true)}>Create Task</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {todayTasks.map((task, i) => (
                  <div key={task.id} className={`delay-${(i + 1) * 100}`}>
                    <TaskCard
                      task={task}
                      onComplete={handleComplete}
                      onEdit={() => {}}
                      onDelete={handleDelete}
                      onDuplicate={() => {}}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Section */}
          <section className="animate-fade-in delay-300">
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>Upcoming</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {UPCOMING_GROUPS.map((group) => (
                <div key={group.label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ height: 1, flex: 0, width: 20, background: 'var(--border-strong)' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      {group.label}
                    </span>
                    <div style={{ height: 1, flex: 1, background: 'var(--border-strong)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {group.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={{ ...task, status: 'upcoming' }}
                        onComplete={handleComplete}
                        onEdit={() => {}}
                        onDelete={handleDelete}
                        onDuplicate={() => {}}
                        compact
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Category Overview */}
          <section className="animate-fade-in delay-400">
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>Category Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {(Object.entries(CATEGORY_META) as [string, typeof CATEGORY_META[keyof typeof CATEGORY_META]][]).map(([key, meta]) => {
                const count = tasks.filter(t => t.category === key).length;
                const rate = count > 0 ? Math.round(tasks.filter(t => t.category === key).reduce((a, t) => a + t.completionRate, 0) / count) : 0;
                return (
                  <div key={key} className="card" style={{ padding: '14px 16px', cursor: 'pointer' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{meta.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{meta.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>{count} tasks</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${rate}%`, background: `linear-gradient(90deg, ${meta.color}99, ${meta.color})` }} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: meta.color, marginTop: 4 }}>{rate}%</div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </AppShell>

      {modalOpen && (
        <CreateTaskModal onClose={() => setModalOpen(false)} onSave={handleCreate} />
      )}
    </>
  );
}
