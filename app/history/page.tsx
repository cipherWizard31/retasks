'use client';

import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import { HISTORY_ENTRIES } from '../../lib/data';

export default function HistoryPage() {
  const [selectedTask, setSelectedTask] = useState('Read Bible');

  const TASKS_LIST = ['Read Bible', 'Morning Run', 'Review Flashcards', 'Water Plants', 'Budget Review', 'Deep Work'];

  const completed = HISTORY_ENTRIES.filter(e => e.completed).length;
  const missed = HISTORY_ENTRIES.filter(e => !e.completed && !e.skipped).length;
  const skipped = HISTORY_ENTRIES.filter(e => e.skipped).length;
  const rate = Math.round((completed / HISTORY_ENTRIES.length) * 100);

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
          <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Completion Timeline</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {HISTORY_ENTRIES.map((entry, i) => (
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
                  background: entry.completed ? '#f0fdf4' : entry.skipped ? '#fffbeb' : '#fef2f2',
                  borderRadius: 10,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{entry.date}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{selectedTask}</div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                    background: entry.completed ? '#d1fae5' : entry.skipped ? '#fef3c7' : '#fee2e2',
                    color: entry.completed ? '#059669' : entry.skipped ? '#d97706' : '#dc2626',
                  }}>
                    {entry.completed ? 'Completed' : entry.skipped ? 'Skipped' : 'Missed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
