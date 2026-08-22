'use client';

import React from 'react';
import AppShell from '../components/AppShell';
import { TASKS, WEEKLY_DATA, MONTHLY_DATA, CATEGORY_META, Category } from '../../lib/data';

export default function StatisticsPage() {
  const totalCompleted = TASKS.reduce((a, t) => a + t.totalCompleted, 0);
  const totalMissed = TASKS.reduce((a, t) => a + t.totalMissed, 0);
  const avgRate = Math.round(TASKS.reduce((a, t) => a + t.completionRate, 0) / TASKS.length);
  const longestStreak = Math.max(...TASKS.map(t => t.streak));
  const bestTask = TASKS.reduce((a, b) => a.completionRate > b.completionRate ? a : b);

  const maxBar = Math.max(...WEEKLY_DATA.map(d => d.total));

  // Donut data
  const catData = (Object.keys(CATEGORY_META) as Category[]).map(cat => ({
    cat,
    count: TASKS.filter(t => t.category === cat).length,
    color: CATEGORY_META[cat].color,
    label: CATEGORY_META[cat].label,
    icon: CATEGORY_META[cat].icon,
  })).filter(d => d.count > 0);
  const totalCatTasks = catData.reduce((a, d) => a + d.count, 0);

  // Generate interactive heatmap cells for the last 16 weeks (112 days)
  const heatCells = Array.from({ length: 112 }, (_, i) => {
    const seed = (i * 7919 + 19) % 10;
    const level = seed < 3 ? 0 : seed < 5 ? 1 : seed < 7 ? 2 : seed < 9 ? 3 : 4;
    const d = new Date();
    d.setDate(d.getDate() - (111 - i));
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { level, dateStr, count: level * 2 };
  });
  const heatLabels = ['16w ago', '12w ago', '8w ago', '4w ago', 'Now'];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Header */}
        <div className="animate-fade-in">
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>📊 Statistics</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>Deep analytics and activity tracking for your task performance</p>
        </div>

        {/* KPI cards */}
        <div className="animate-fade-in delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Avg Completion Rate', value: `${avgRate}%`, icon: '📈', color: '#10b981', bg: 'color-mix(in srgb, #10b981 12%, var(--surface))', sub: 'across all active tasks' },
            { label: 'Tasks Completed', value: totalCompleted, icon: '✅', color: '#0ea5e9', bg: 'color-mix(in srgb, #0ea5e9 12%, var(--surface))', sub: 'total all-time completed' },
            { label: 'Tasks Missed', value: totalMissed, icon: '❌', color: '#ef4444', bg: 'color-mix(in srgb, #ef4444 12%, var(--surface))', sub: 'total all-time missed' },
            { label: 'Longest Streak', value: `${longestStreak} days`, icon: '🔥', color: '#f59e0b', bg: 'color-mix(in srgb, #f59e0b 12%, var(--surface))', sub: 'personal record streak' },
            { label: 'Current Streak', value: '14 days', icon: '⚡', color: '#8b5cf6', bg: 'color-mix(in srgb, #8b5cf6 12%, var(--surface))', sub: 'active daily streak' },
            { label: 'Most Consistent', value: bestTask.title, icon: '🏆', color: '#059669', bg: 'color-mix(in srgb, #059669 12%, var(--surface))', sub: `${bestTask.completionRate}% completion rate` },
          ].map((kpi, i) => (
            <div key={kpi.label} className={`stat-card delay-${(i + 1) * 100}`} style={{ background: kpi.bg, border: `1px solid color-mix(in srgb, ${kpi.color} 30%, var(--border))` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{kpi.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: kpi.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kpi.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{kpi.sub}</div>
                </div>
                <span style={{ fontSize: 28 }}>{kpi.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Heatmap Card */}
        <div className="animate-fade-in delay-200 card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--foreground)' }}>🔥 Completion Activity Heatmap</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>Daily task completion frequency over the last 16 weeks</p>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--muted)' }}>
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(l => (
                <div key={l} className={`heatmap-cell heatmap-${l}`} style={{ display: 'inline-block' }} />
              ))}
              <span>More</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {heatCells.map((cell, i) => (
              <div
                key={i}
                className={`heatmap-cell heatmap-${cell.level}`}
                title={`${cell.dateStr}: ${cell.count} task completions`}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--muted)' }}>
            {heatLabels.map(l => <span key={l}>{l}</span>)}
          </div>
        </div>

        {/* Charts row */}
        <div className="animate-fade-in delay-300" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Weekly Bar Chart */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>Weekly Completion Rate</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
              {WEEKLY_DATA.map((d) => {
                const heightPct = (d.completed / maxBar) * 100;
                return (
                  <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>{d.completed}</span>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'flex-end', height: 110 }}>
                      <div
                        className="chart-bar"
                        style={{ width: '100%', height: `${heightPct}%`, minHeight: 8 }}
                        title={`${d.completed}/${d.total} completed`}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>Category Distribution</h3>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div className="donut-ring" style={{ flexShrink: 0 }}>
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--foreground)' }}>{totalCatTasks}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>tasks</div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {catData.slice(0, 5).map(d => (
                  <div key={d.cat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13 }}>{d.icon}</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--surface-muted)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${(d.count / totalCatTasks) * 100}%`, height: '100%', background: d.color, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--foreground)', width: 20, textAlign: 'right' }}>{d.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly trend */}
        <div className="animate-fade-in delay-400 card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>Monthly Performance Trend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 120 }}>
            {MONTHLY_DATA.map((d) => (
              <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>{d.rate}%</span>
                <div style={{ width: '100%', borderRadius: '8px 8px 0 0', background: 'linear-gradient(180deg, #6ee7b7, #10b981)', height: `${d.rate}%` }} />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Per-task table */}
        <div className="animate-fade-in delay-500 card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>Task Consistency Leaderboard</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px', gap: 12, padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Task</span><span>Completed</span><span>Missed</span><span>Streak</span><span>Rate</span>
            </div>
            {[...TASKS].sort((a, b) => b.completionRate - a.completionRate).map((task, i) => (
              <div key={task.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px', gap: 12,
                padding: '10px 12px', borderRadius: 10, background: i % 2 === 0 ? 'var(--surface-muted)' : 'var(--surface)',
                alignItems: 'center',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {i === 0 && <span>🥇</span>}
                  {i === 1 && <span>🥈</span>}
                  {i === 2 && <span>🥉</span>}
                  {task.title}
                </div>
                <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>{task.totalCompleted}</span>
                <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>{task.totalMissed}</span>
                <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>🔥 {task.streak}d</span>
                <div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${task.completionRate}%` }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginTop: 2 }}>{task.completionRate}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
