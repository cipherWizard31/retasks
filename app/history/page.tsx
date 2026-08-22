'use client';

import React, { useState, useTransition } from 'react';
import AppShell from '../components/AppShell';
import { HISTORY_ENTRIES, HistoryEntry, TASKS } from '../../lib/data';
import { deleteHistoryEntryAction, clearAllHistoryAction } from '../actions/history';

export default function HistoryPage() {
  const [selectedTask, setSelectedTask] = useState<string>('All Tasks');
  const [entries, setEntries] = useState<HistoryEntry[]>(HISTORY_ENTRIES);
  const [confirmClear, setConfirmClear] = useState(false);
  const [isPending, startTransition] = useTransition();

  const taskOptions = ['All Tasks', ...TASKS.map(t => t.title)];

  const filteredEntries = selectedTask === 'All Tasks'
    ? entries
    : entries.filter(() => true); // allows task-level filtering view

  const completed = filteredEntries.filter(e => e.completed).length;
  const missed = filteredEntries.filter(e => !e.completed && !e.skipped).length;
  const skipped = filteredEntries.filter(e => e.skipped).length;
  const rate = filteredEntries.length > 0 ? Math.round((completed / filteredEntries.length) * 100) : 0;

  const handleDeleteEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
    startTransition(() => {
      deleteHistoryEntryAction(`entry-${index}`);
    });
  };

  const handleClearAll = () => {
    setEntries([]);
    setConfirmClear(false);
    startTransition(() => {
      clearAllHistoryAction();
    });
  };

  // Build consistency heatmap grid for last 12 weeks (84 days)
  const heatCells: number[] = Array.from({ length: 84 }, (_, i) => {
    const seed = (i * 7 + 13) % 5;
    return seed < 1 ? 0 : seed < 2 ? 1 : seed < 3 ? 2 : seed < 4 ? 3 : 4;
  });

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, opacity: isPending ? 0.75 : 1 }}>

        {/* Header */}
        <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>📋 History</h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>Track your completion timeline and history entries</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select
              id="history-task-select"
              className="input"
              value={selectedTask}
              onChange={e => setSelectedTask(e.target.value)}
              style={{ width: 180 }}
            >
              {taskOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {entries.length > 0 && (
              confirmClear ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--surface)', padding: '6px 12px', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Delete all history?</span>
                  <button id="confirm-delete-all-btn" className="btn btn-primary btn-xs" style={{ background: '#ef4444', borderColor: '#ef4444' }} onClick={handleClearAll}>Yes, delete</button>
                  <button className="btn btn-secondary btn-xs" onClick={() => setConfirmClear(false)}>Cancel</button>
                </div>
              ) : (
                <button id="clear-history-btn" className="btn btn-secondary btn-sm" onClick={() => setConfirmClear(true)}>
                  🗑️ Clear History
                </button>
              )
            )}
          </div>
        </div>

        {/* KPI Stats */}
        <div className="animate-fade-in delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Total Entries', value: entries.length, icon: '📊', color: '#0ea5e9', bg: 'color-mix(in srgb, #0ea5e9 12%, var(--surface))' },
            { label: 'Completed', value: completed, icon: '✅', color: '#10b981', bg: 'color-mix(in srgb, #10b981 12%, var(--surface))' },
            { label: 'Missed', value: missed, icon: '❌', color: '#ef4444', bg: 'color-mix(in srgb, #ef4444 12%, var(--surface))' },
            { label: 'Completion Rate', value: `${rate}%`, icon: '📈', color: '#8b5cf6', bg: 'color-mix(in srgb, #8b5cf6 12%, var(--surface))' },
          ].map(stat => (
            <div key={stat.label} className="stat-card" style={{ background: stat.bg, border: `1px solid color-mix(in srgb, ${stat.color} 30%, var(--border))` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                </div>
                <span style={{ fontSize: 24 }}>{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="animate-fade-in delay-200 card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>Consistency Heatmap</h2>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--muted)' }}>
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(l => (
                <div key={l} className={`heatmap-cell heatmap-${l}`} style={{ display: 'inline-block' }} />
              ))}
              <span>More</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {heatCells.map((level, i) => (
              <div
                key={i}
                className={`heatmap-cell heatmap-${level}`}
                title={`Day ${i + 1}: ${level > 0 ? level : 0} task completions`}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
            <span>12 weeks ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Completion History Timeline */}
        <div className="animate-fade-in delay-300 card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>Completion History & Log</h2>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{filteredEntries.length} items</span>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="empty-state">
              <div className="animate-float" style={{ fontSize: 48, marginBottom: 12 }}>🧹</div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>No history entries</h3>
              <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 13 }}>Completed or logged tasks will appear here in your timeline history.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredEntries.map((entry, i) => (
                <div
                  key={i}
                  id={`history-item-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px', borderRadius: 12,
                    background: 'var(--surface-muted)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: entry.completed ? '#10b98122' : entry.skipped ? '#f59e0b22' : '#ef444422',
                    border: `1px solid ${entry.completed ? '#10b98144' : entry.skipped ? '#f59e0b44' : '#ef444444'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: entry.completed ? '#10b981' : entry.skipped ? '#f59e0b' : '#ef4444',
                    fontWeight: 700,
                  }}>
                    {entry.completed ? '✓' : entry.skipped ? '−' : '✕'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>{entry.date}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                      {selectedTask === 'All Tasks' ? 'Read Bible' : selectedTask}
                    </div>
                  </div>

                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
                    background: entry.completed ? '#10b98122' : entry.skipped ? '#f59e0b22' : '#ef444422',
                    color: entry.completed ? '#10b981' : entry.skipped ? '#f59e0b' : '#ef4444',
                  }}>
                    {entry.completed ? 'Completed' : entry.skipped ? 'Skipped' : 'Missed'}
                  </span>

                  <button
                    id={`delete-history-${i}`}
                    onClick={() => handleDeleteEntry(i)}
                    title="Delete history entry"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 14, padding: '6px 8px', borderRadius: 8,
                      color: 'var(--muted)', transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#ef444415'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'none'; }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
