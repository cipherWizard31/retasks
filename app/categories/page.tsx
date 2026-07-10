'use client';

import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import CreateTaskModal from '../components/CreateTaskModal';
import { TASKS, CATEGORY_META, Category } from '../../lib/data';

export default function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);

  const cats = (Object.keys(CATEGORY_META) as Category[]).map(cat => {
    const catTasks = TASKS.filter(t => t.category === cat);
    const rate = catTasks.length > 0 ? Math.round(catTasks.reduce((a, t) => a + t.completionRate, 0) / catTasks.length) : 0;
    return { key: cat, meta: CATEGORY_META[cat], tasks: catTasks, rate };
  });

  const filteredTasks = selected ? TASKS.filter(t => t.category === selected) : [];

  return (
    <>
      <AppShell onAddTask={() => setModalOpen(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>🏷️ Categories</h1>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#9ca3af' }}>Organize your tasks by life area</p>
            </div>
            <button id="categories-add-btn" className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add Task</button>
          </div>

          {/* Category grid */}
          <div className="animate-fade-in delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {cats.map(({ key, meta, tasks, rate }, i) => (
              <div
                key={key}
                id={`cat-card-${key}`}
                className={`card delay-${(i + 1) * 100}`}
                onClick={() => setSelected(selected === key ? null : key)}
                style={{
                  padding: '20px', cursor: 'pointer',
                  border: selected === key ? `2px solid ${meta.color}` : '1px solid #f1f5f9',
                  background: selected === key ? `${meta.color}08` : 'white',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{meta.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{meta.label}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${rate}%`, background: `linear-gradient(90deg, ${meta.color}99, ${meta.color})` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Completion</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{rate}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected category detail */}
          {selected && (
            <div className="animate-fade-in card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 28 }}>{CATEGORY_META[selected].icon}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>{CATEGORY_META[selected].label}</h2>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#9ca3af' }}>{filteredTasks.length} tasks in this category</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredTasks.map(task => (
                  <div key={task.id} style={{
                    padding: '14px 16px', background: '#f9fafb', borderRadius: 12,
                    display: 'flex', alignItems: 'center', gap: 14,
                    border: '1px solid #f1f5f9',
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: task.status === 'completed' ? '#10b981' : task.status === 'overdue' ? '#ef4444' : task.status === 'due' ? '#f59e0b' : '#d1d5db',
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{task.title}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>🔁 {task.repeatType === 'daily' ? 'Every Day' : task.repeatType === 'weekly' ? 'Every Week' : `Every ${task.repeatInterval} days`} · 🕐 {task.reminderTime}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{task.completionRate}%</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>streak {task.streak}d</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AppShell>
      {modalOpen && <CreateTaskModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
