'use client';

import { useState } from 'react';
import AppShell from '../components/AppShell';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCard from '../components/TaskCard';
import { Task } from '../../lib/data';

export default function TodayClient({ initialTasks }: { initialTasks: Task[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<'all' | 'due' | 'overdue' | 'completed'>('all');

  const todayTasks = tasks.filter(t =>
    t.status === 'due' || t.status === 'overdue' || t.status === 'completed'
  );

  const filteredTasks = filter === 'all' ? todayTasks : todayTasks.filter(t => t.status === filter);

  const handleComplete = (id: string) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' as const } : t));
  const handleDelete = (id: string) =>
    setTasks(prev => prev.filter(t => t.id !== id));

  const due = todayTasks.filter(t => t.status === 'due').length;
  const overdue = todayTasks.filter(t => t.status === 'overdue').length;
  const completed = todayTasks.filter(t => t.status === 'completed').length;
  const total = due + overdue + completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <>
      <AppShell onAddTask={() => setModalOpen(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Header */}
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                ☀️ Today
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <button id="today-add-btn" className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add Task</button>
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

          {/* Filter tabs */}
          <div className="animate-fade-in delay-200" style={{ display: 'flex', gap: 6, padding: '4px', background: 'var(--surface-muted)', borderRadius: 12, width: 'fit-content' }}>
            {(['all', 'due', 'overdue', 'completed'] as const).map(f => (
              <button
                key={f}
                id={`filter-${f}`}
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 16px', border: 'none', borderRadius: 10, cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                  background: filter === f ? 'var(--surface)' : 'transparent',
                  color: filter === f ? 'var(--foreground)' : 'var(--muted)',
                  boxShadow: filter === f ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700 }}>
                  {f === 'due' ? due : f === 'overdue' ? overdue : completed}
                </span>}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div className="animate-fade-in delay-300" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="animate-float" style={{ fontSize: 64 }}>🎉</div>
                <h3 style={{ margin: '16px 0 0', fontSize: 18, fontWeight: 700, color: 'var(--foreground)' }}>All clear!</h3>
                <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 14 }}>No tasks in this category.</p>
              </div>
            ) : filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onComplete={handleComplete} onEdit={() => {}} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      </AppShell>
      {modalOpen && <CreateTaskModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
