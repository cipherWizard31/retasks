'use client';

import React, { useState } from 'react';
import AppShell from '../components/AppShell';

const NOTIFS = [
  { id: '1', icon: '🌱', title: 'Water Plants', desc: 'This task is 1 day overdue', time: 'Now', type: 'overdue', color: '#ef4444', bg: '#fef2f2' },
  { id: '2', icon: '✝️', title: 'Read Bible', desc: 'Reminder for today\'s task', time: '8:00 AM', type: 'due', color: '#f59e0b', bg: '#fffbeb' },
  { id: '3', icon: '🏃', title: 'Morning Run', desc: 'Don\'t forget your daily run', time: '6:30 AM', type: 'due', color: '#f59e0b', bg: '#fffbeb' },
  { id: '4', icon: '💰', title: 'Budget Review', desc: 'Weekly review due tomorrow', time: 'Tomorrow 10:00 AM', type: 'upcoming', color: '#0ea5e9', bg: '#f0f9ff' },
  { id: '5', icon: '📚', title: 'Review Flashcards', desc: 'Your daily study session', time: '7:00 PM', type: 'upcoming', color: '#8b5cf6', bg: '#faf5ff' },
  { id: '6', icon: '💻', title: 'Deep Work Block', desc: '2-hour focused work session', time: '9:00 AM', type: 'due', color: '#f59e0b', bg: '#fffbeb' },
];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(NOTIFS);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [snoozed, setSnoozed] = useState<Set<string>>(new Set());

  const dismiss = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));
  const complete = (id: string) => { setCompleted(prev => new Set([...prev, id])); setTimeout(() => dismiss(id), 1000); };
  const snooze = (id: string) => setSnoozed(prev => new Set([...prev, id]));

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>🔔 Notifications</h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#9ca3af' }}>{notifs.length} pending reminders</p>
          </div>
          <button id="dismiss-all-btn" className="btn btn-secondary btn-sm" onClick={() => setNotifs([])}>Dismiss All</button>
        </div>

        {notifs.length === 0 ? (
          <div className="empty-state">
            <div className="animate-float" style={{ fontSize: 64 }}>🔕</div>
            <h3 style={{ margin: '16px 0 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>All caught up!</h3>
            <p style={{ margin: '8px 0 0', color: '#9ca3af', fontSize: 14 }}>No pending notifications right now.</p>
          </div>
        ) : (
          <div className="animate-fade-in delay-100" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifs.map((notif, i) => {
              const isDone = completed.has(notif.id);
              const isSnoozed = snoozed.has(notif.id);

              return (
                <div
                  key={notif.id}
                  id={`notif-${notif.id}`}
                  className={`notif-card delay-${(i + 1) * 100}`}
                  style={{
                    opacity: isDone || isSnoozed ? 0.5 : 1,
                    transform: isDone ? 'translateX(40px)' : 'none',
                    transition: 'all 0.3s ease',
                    borderLeft: `4px solid ${notif.color}`,
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: notif.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {notif.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{notif.title}</div>
                      <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>{notif.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{notif.desc}</div>
                    {isSnoozed && <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4, fontWeight: 600 }}>⏰ Snoozed for 1 hour</div>}
                    {!isDone && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        <button id={`complete-notif-${notif.id}`} className="btn btn-primary btn-xs" onClick={() => complete(notif.id)}>✓ Complete</button>
                        {!isSnoozed && <button id={`snooze-notif-${notif.id}`} className="btn btn-secondary btn-xs" onClick={() => snooze(notif.id)}>⏰ Snooze</button>}
                        <button id={`dismiss-notif-${notif.id}`} className="btn btn-ghost btn-xs" onClick={() => dismiss(notif.id)}>✕ Dismiss</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
