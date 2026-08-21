'use client';

import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import { HISTORY_ENTRIES, HistoryEntry } from '../../lib/data';

export default function HistoryPage() {
  const [selectedTask, setSelectedTask] = useState('Read Bible');
  const [entries, setEntries] = useState<HistoryEntry[]>(HISTORY_ENTRIES);
  const [confirmClear, setConfirmClear] = useState(false);

  const TASKS_LIST = ['Read Bible', 'Morning Run', 'Review Flashcards', 'Water Plants', 'Budget Review', 'Deep Work'];

  const completed = entries.filter(e => e.completed).length;
  const missed = entries.filter(e => !e.completed && !e.skipped).length;
  const skipped = entries.filter(e => e.skipped).length;
  const rate = entries.length > 0 ? Math.round((completed / entries.length) * 100) : 0;

  const deleteEntry = (index: number) => setEntries(prev => prev.filter((_, i) => i !== index));
  const clearAll = () => { setEntries([]); setConfirmClear(false); };

  // Build a heatmap-like grid for the last 12 weeks
  const heatCells: number[] = Array.from({ length: 84 }, (_, i) => {
    const seed = (i * 7 + 13) % 5;
    return seed < 1 ? 0 : seed < 2 ? 1 : seed < 3 ? 2 : seed < 4 ? 3 : 4;
  });

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Header */}
        <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>📋 History</h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#9ca3af' }}>Track your completion timeline over time</p>
          </div>
          <select id="history-task-select" className="input" value={selectedTask} onChange={e => setSelectedTask(e.target.value)} style={{ width: 200 }}>
            {TASKS_LIST.map(t => <option key={t}>{t}</option>)}
          </select>
          {entries.length > 0 && (
            confirmClear ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Delete all history?</span>
                <button className="btn btn-primary btn-sm" style={{ background: '#ef4444', borderColor: '#ef4444' }} onClick={clearAll}>Yes, delete</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setConfirmClear(false)}>Cancel</button>
              </div>
            ) : (
              <button id="clear-history-btn" className="btn btn-secondary btn-sm" onClick={() => setConfirmClear(true)}>🗑️ Clear History</button>
            )
          )}
        </div>

        {/* Stats */}
        <div className="animate-fade-in delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Total Entries', value: HISTORY_ENTRIES.length, icon: '📊', color: '#0ea5e9', bg: '#f0f9ff' },
            { label: 'Completed', value: completed, icon: '✅', color: '#10b981', bg: '#ecfdf5' },
            { label: 'Missed', value: missed, icon: '❌', color: '#ef4444', bg: '#fef2f2' },
            { label: 'Completion Rate', value: `${rate}%`, icon: '📈', color: '#8b5cf6', bg: '#faf5ff' },
          ].map(stat => (
            <div key={stat.label} className="stat-card" style={{ background: stat.bg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{stat.label}</div>
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
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Consistency Heatmap</h2>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#9ca3af' }}>
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
                title={`${level > 0 ? level : 0} tasks`}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#9ca3af' }}>
            <span>12 weeks ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="animate-fade-in delay-300 card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>Completion Timeline</h2>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{entries.length} entries</span>
          </div>
          {entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 14 }}>
              No history entries yet.
            </div>
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {entries.map((entry, i) => (
              <div key={i} className="timeline-item">
                <div style={{
                  position: 'absolute', left: 0, top: 8,
                  width: 20, height: 20, borderRadius: '50%',
                  background: entry.completed ? '#10b981' : entry.skipped ? '#f59e0b' : '#ef4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 0 3px ${entry.completed ? '#d1fae5' : entry.skipped ? '#fef3c7' : '#fee2e2'}`,
                }}>
                  <span style={{ fontSize: 10, color: 'white', fontWeight: 700 }}>
                    {entry.completed ? '✓' : entry.skipped ? '−' : '✗'}
                  </span>
                </div>
                <div style={{
                  marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  background: entry.completed ? 'color-mix(in srgb, #10b981 8%, var(--surface))' : entry.skipped ? 'color-mix(in srgb, #f59e0b 8%, var(--surface))' : 'color-mix(in srgb, #ef4444 8%, var(--surface))',
                  borderRadius: 10,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>{entry.date}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{selectedTask}</div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                    background: entry.completed ? '#d1fae5' : entry.skipped ? '#fef3c7' : '#fee2e2',
                    color: entry.completed ? '#059669' : entry.skipped ? '#d97706' : '#dc2626',
                  }}>
                    {entry.completed ? 'Completed' : entry.skipped ? 'Skipped' : 'Missed'}
                  </span>
                  <button
                    onClick={() => deleteEntry(i)}
                    title="Delete this history entry"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, padding: '4px 6px', borderRadius: 6 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
