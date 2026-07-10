'use client';

import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCard from '../components/TaskCard';
import { TASKS, Task } from '../../lib/data';

const GROUPS = [
  { label: 'Today', emoji: '☀️', color: '#10b981', bg: '#ecfdf5', tasks: TASKS.filter(t => t.status === 'due' || t.status === 'overdue') },
  { label: 'Tomorrow', emoji: '🌤️', color: '#f59e0b', bg: '#fffbeb', tasks: TASKS.slice(0, 3) },
  { label: 'In 2 Days', emoji: '📅', color: '#0ea5e9', bg: '#f0f9ff', tasks: TASKS.slice(3, 5) },
  { label: 'In 3 Days', emoji: '📆', color: '#8b5cf6', bg: '#faf5ff', tasks: TASKS.slice(5, 7) },
  { label: 'In 1 Week', emoji: '🗓️', color: '#6b7280', bg: '#f9fafb', tasks: TASKS.slice(7, 10) },
];

export default function UpcomingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['Today', 'Tomorrow']));

  const toggle = (label: string) => {
    const next = new Set(expanded);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    setExpanded(next);
  };

  return (
    <>
      <AppShell onAddTask={() => setModalOpen(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>📅 Upcoming</h1>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#9ca3af' }}>Timeline view — tasks organized by when they&apos;re due</p>
            </div>
            <button id="upcoming-add-btn" className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add Task</button>
          </div>

          {/* Mini stat bar */}
          <div className="animate-fade-in delay-100" style={{ display: 'flex', gap: 12 }}>
            {GROUPS.map(g => (
              <div key={g.label} style={{ background: g.bg, border: `1px solid ${g.color}33`, borderRadius: 10, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 16 }}>{g.emoji}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: g.color, marginTop: 2 }}>{g.tasks.length}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{g.label}</div>
              </div>
            ))}
          </div>

          {/* Timeline groups */}
          <div className="animate-fade-in delay-200" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {GROUPS.map((group, gi) => (
              <div key={group.label} className={`delay-${(gi + 1) * 100}`}>
                {/* Group header */}
                <button
                  id={`group-${group.label.toLowerCase().replace(/\s/g, '-')}`}
                  onClick={() => toggle(group.label)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 12,
                    background: expanded.has(group.label) ? group.bg : 'white',
                    border: `1.5px solid ${expanded.has(group.label) ? group.color + '44' : '#e5e7eb'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{group.emoji}</span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#111827' }}>{group.label}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '2px 10px',
                    borderRadius: 99, background: group.color + '22', color: group.color,
                  }}>{group.tasks.length} tasks</span>
                  <span style={{ color: '#9ca3af', transition: 'transform 0.2s', transform: expanded.has(group.label) ? 'rotate(180deg)' : 'none' }}>▼</span>
                </button>

                {/* Tasks */}
                {expanded.has(group.label) && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, paddingLeft: 12, borderLeft: `3px solid ${group.color}44` }}>
                    {group.tasks.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No tasks in this period</div>
                    ) : group.tasks.map(task => (
                      <TaskCard key={task.id} task={{ ...task, status: group.label === 'Today' ? task.status : 'upcoming' }} compact onComplete={() => {}} onEdit={() => {}} onDelete={() => {}} onDuplicate={() => {}} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </AppShell>
      {modalOpen && <CreateTaskModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
