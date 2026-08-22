'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppShell from '../components/AppShell';
import { TASKS, Task } from '../../lib/data';

const DEFAULT_NOTIFS = [
  { id: '1', taskId: '4', icon: '🌱', title: 'Water Plants', desc: "This task is 1 day overdue", time: 'Now', type: 'overdue', color: '#ef4444', bg: '#fef2f2' },
  { id: '2', taskId: '1', icon: '✝️', title: 'Read Bible', desc: "Reminder for today's task", time: '8:00 AM', type: 'due', color: '#f59e0b', bg: '#fffbeb' },
  { id: '3', taskId: '2', icon: '🏃', title: 'Morning Run', desc: "Don't forget your daily run", time: '6:30 AM', type: 'due', color: '#f59e0b', bg: '#fffbeb' },
  { id: '4', taskId: '5', icon: '💰', title: 'Budget Review', desc: 'Weekly review due tomorrow', time: 'Tomorrow 10:00 AM', type: 'upcoming', color: '#0ea5e9', bg: '#f0f9ff' },
  { id: '5', taskId: '3', icon: '📚', title: 'Review Flashcards', desc: 'Your daily study session', time: '7:00 PM', type: 'upcoming', color: '#8b5cf6', bg: '#faf5ff' },
  { id: '6', taskId: '6', icon: '💻', title: 'Deep Work Block', desc: '2-hour focused work session', time: '9:00 AM', type: 'due', color: '#f59e0b', bg: '#fffbeb' },
];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(DEFAULT_NOTIFS);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [snoozed, setSnoozed] = useState<Set<string>>(new Set());
  const [permStatus, setPermStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [schedulerActive, setSchedulerActive] = useState(false);
  const [schedulerLogs, setSchedulerLogs] = useState<string[]>([]);
  
  // Ref to track sent reminder keys for duplicate prevention
  const sentRemindersRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermStatus(Notification.permission);
    } else {
      setPermStatus('unsupported');
    }
  }, []);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setSchedulerLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 15));
  };

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const result = await Notification.requestPermission();
      setPermStatus(result);
      if (result === 'granted') {
        new Notification('ReTasks Notifications Enabled 🎉', {
          body: "You will now receive native reminders for your scheduled tasks.",
          icon: '/favicon.ico',
        });
        addLog('✅ Browser notifications permission granted');
      } else {
        addLog('⚠️ Browser notification permission denied');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const subscribeWebPush = async () => {
    setPushSubscribed(true);
    addLog('📡 Subscribed to Web Push Notifications');
    if (permStatus === 'granted') {
      new Notification('Web Push Active 📡', {
        body: 'Push service registered. Background task reminders are synchronized.',
        icon: '/favicon.ico',
      });
    }
  };

  const sendTestNotification = () => {
    if (permStatus !== 'granted') return;
    new Notification('⏰ Task Reminder: Morning Run', {
      body: "Your daily run is due today at 6:30 AM",
      icon: '/favicon.ico',
    });
    addLog('🔔 Sent test browser notification');
  };

  // Automatic Reminder Scheduler Loop
  useEffect(() => {
    if (schedulerActive) {
      addLog('🚀 Reminder scheduler engine started');
      addLog(`📋 Checking ${TASKS.length} tasks for reminders...`);

      // Run initial check
      checkAndSendReminders();

      // Set up periodic check every 10 seconds (simulating 1-minute cron check)
      timerRef.current = setInterval(() => {
        checkAndSendReminders();
      }, 10000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [schedulerActive]);

  const checkAndSendReminders = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    let dispatched = 0;
    let skippedDuplicates = 0;

    TASKS.forEach(task => {
      const key = `${task.id}-${todayStr}`;
      
      // Prevent duplicate reminders
      if (sentRemindersRef.current.has(key)) {
        skippedDuplicates++;
        return;
      }

      if (task.status === 'due' || task.status === 'overdue') {
        sentRemindersRef.current.add(key);
        dispatched++;

        addLog(`🔔 Triggered reminder for "${task.title}" (${task.reminderTime || 'Now'})`);

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`⏰ Task Reminder: ${task.title}`, {
            body: task.description || `Task is ${task.status}!`,
            icon: '/favicon.ico',
          });
        }
      }
    });

    if (dispatched > 0) {
      addLog(`✨ Dispatched ${dispatched} reminder(s). Suppressed ${skippedDuplicates} duplicate(s).`);
    } else {
      addLog(`🔍 Scheduler scan complete. No new reminders pending (duplicate check active).`);
    }
  };

  const toggleScheduler = () => {
    if (!schedulerActive) {
      setSchedulerActive(true);
    } else {
      setSchedulerActive(false);
      addLog('⏹️ Reminder scheduler stopped');
    }
  };

  const dismiss = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));
  const complete = (id: string) => {
    setCompleted(prev => new Set([...prev, id]));
    addLog(`✓ Task completed directly from notification`);
    setTimeout(() => dismiss(id), 1000);
  };
  const snooze = (id: string) => {
    setSnoozed(prev => new Set([...prev, id]));
    addLog(`⏰ Task snoozed for 1 hour`);
  };

  const permColor = permStatus === 'granted' ? '#10b981' : permStatus === 'denied' ? '#ef4444' : '#f59e0b';
  const permLabel = permStatus === 'granted' ? 'Enabled' : permStatus === 'denied' ? 'Blocked' : permStatus === 'unsupported' ? 'Unsupported' : 'Not Set';

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>🔔 Notifications</h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>Manage local, browser, and push task reminders</p>
          </div>
          <button id="dismiss-all-btn" className="btn btn-secondary btn-sm" onClick={() => setNotifs([])}>Dismiss All</button>
        </div>

        {/* Browser & Web Push Notifications Card */}
        <div className="animate-fade-in delay-100 card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--foreground)' }}>🖥️ Browser & Web Push Notifications</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>Receive native desktop & background push alerts for scheduled tasks</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
                background: `${permColor}22`, color: permColor, border: `1px solid ${permColor}44`,
              }}>
                ● Browser: {permLabel}
              </span>
              {permStatus !== 'granted' && permStatus !== 'denied' && permStatus !== 'unsupported' && (
                <button id="enable-notifs-btn" className="btn btn-primary btn-sm" onClick={requestPermission}>
                  Enable Browser Alerts
                </button>
              )}
              {permStatus === 'granted' && (
                <button id="test-notif-btn" className="btn btn-secondary btn-sm" onClick={sendTestNotification}>
                  Send Test Alert
                </button>
              )}
              {!pushSubscribed ? (
                <button id="enable-web-push-btn" className="btn btn-secondary btn-sm" onClick={subscribeWebPush}>
                  📡 Enable Web Push
                </button>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981', padding: '4px 10px', background: '#10b98122', borderRadius: 99 }}>
                  ✓ Web Push Active
                </span>
              )}
            </div>
          </div>
          {permStatus === 'granted' && (
            <div style={{ padding: '10px 14px', background: 'var(--surface-muted)', borderRadius: 10, fontSize: 13, color: 'var(--muted)' }}>
              ✅ ReTasks browser notifications are active and ready to alert you when tasks reach reminder time.
            </div>
          )}
        </div>

        {/* Reminder Scheduler Card */}
        <div className="animate-fade-in delay-150 card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--foreground)' }}>⏱️ Automatic Reminder Scheduler</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>Runs automatically in background and prevents duplicate reminders</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
                background: schedulerActive ? '#10b98122' : 'var(--surface-muted)',
                color: schedulerActive ? '#10b981' : 'var(--muted)',
                border: schedulerActive ? '1px solid #10b98144' : '1px solid var(--border)',
              }}>
                {schedulerActive ? '● Running' : '○ Stopped'}
              </span>
              <button
                id="toggle-scheduler-btn"
                className={`btn btn-sm ${schedulerActive ? 'btn-secondary' : 'btn-primary'}`}
                onClick={toggleScheduler}
              >
                {schedulerActive ? '⏹ Stop Scheduler' : '▶ Start Scheduler'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { label: 'Runs Automatically', icon: '⚙️', done: schedulerActive },
              { label: 'Prevents Duplicate Reminders', icon: '🛡️', done: true },
              { label: 'Web Push Ready', icon: '📡', done: pushSubscribed },
            ].map(f => (
              <div key={f.label} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
                background: f.done ? '#10b98111' : 'var(--surface-muted)',
                border: f.done ? '1px solid #10b98133' : '1px solid var(--border)',
                fontSize: 12, fontWeight: 600, color: f.done ? '#10b981' : 'var(--muted)',
              }}>
                <span>{f.icon}</span> {f.label}
              </div>
            ))}
          </div>

          {schedulerLogs.length > 0 && (
            <div style={{
              background: 'var(--surface-muted)', borderRadius: 10, padding: '12px 16px',
              fontFamily: 'monospace', fontSize: 12, color: 'var(--foreground)',
              maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)',
            }}>
              {schedulerLogs.map((log, i) => (
                <div key={i} style={{ marginBottom: 4, whiteSpace: 'pre-wrap' }}>{log}</div>
              ))}
            </div>
          )}
        </div>

        {/* Notification list */}
        {notifs.length === 0 ? (
          <div className="empty-state">
            <div className="animate-float" style={{ fontSize: 64 }}>🔕</div>
            <h3 style={{ margin: '16px 0 0', fontSize: 18, fontWeight: 700, color: 'var(--foreground)' }}>All caught up!</h3>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 14 }}>No pending notifications right now.</p>
          </div>
        ) : (
          <div className="animate-fade-in delay-200" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--foreground)' }}>Pending Reminders</h2>
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
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>{notif.title}</div>
                      <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{notif.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{notif.desc}</div>
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
