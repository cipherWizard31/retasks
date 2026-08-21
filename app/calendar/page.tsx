'use client';

import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCard from '../components/TaskCard';
import { TASKS, Task } from '../../lib/data';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type DayStatus = 'completed' | 'due' | 'missed' | 'future' | null;

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  completed: { bg: 'color-mix(in srgb, #10b981 12%, var(--surface))', text: '#059669', dot: '#10b981' },
  due: { bg: 'color-mix(in srgb, #f59e0b 12%, var(--surface))', text: '#d97706', dot: '#f59e0b' },
  missed: { bg: 'color-mix(in srgb, #ef4444 12%, var(--surface))', text: '#dc2626', dot: '#ef4444' },
  future: { bg: 'transparent', text: 'var(--muted)', dot: '#d1d5db' },
};

export default function CalendarPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const calDays: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (calDays.length % 7 !== 0) calDays.push(null);

  // Helper to format date string YYYY-MM-DD
  const getDateStr = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${viewYear}-${m}-${d}`;
  };

  // Get tasks for a given day
  const getTasksForDay = (day: number): Task[] => {
    const dateStr = getDateStr(day);
    return TASKS.filter(t => t.startDate === dateStr || (day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear()));
  };

  // Determine indicator status for a day
  const getDayStatus = (day: number): DayStatus => {
    const dateStr = getDateStr(day);
    const todayStr = now.toISOString().split('T')[0];

    const dayTasks = TASKS.filter(t => t.startDate === dateStr);
    if (dayTasks.length === 0) {
      if (dateStr > todayStr) return 'future';
      return null;
    }

    if (dayTasks.every(t => t.status === 'completed')) return 'completed';
    if (dayTasks.some(t => t.status === 'overdue')) return 'missed';
    if (dayTasks.some(t => t.status === 'due')) return 'due';
    return dateStr > todayStr ? 'future' : 'due';
  };

  // Build summary counters
  const dayStatuses = calDays.filter((d): d is number => d !== null).map(d => getDayStatus(d));
  const summary = dayStatuses.reduce((acc, s) => { if (s) acc[s] = (acc[s] || 0) + 1; return acc; }, {} as Record<string, number>);

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  return (
    <>
      <AppShell onAddTask={() => setModalOpen(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>🗓️ Calendar</h1>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>Monthly overview of your scheduled tasks and completion history</p>
            </div>
            <button id="cal-add-btn" className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add Task</button>
          </div>

          {/* Summary pills */}
          <div className="animate-fade-in delay-100" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { key: 'completed', label: 'Completed Days', icon: '✓' },
              { key: 'due', label: 'Due Days', icon: '●' },
              { key: 'missed', label: 'Missed Days', icon: '✗' },
              { key: 'future', label: 'Upcoming Days', icon: '○' },
            ].map(({ key, label, icon }) => (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 99,
                background: STATUS_COLORS[key].bg || 'var(--surface-muted)',
                border: `1px solid ${STATUS_COLORS[key].dot}33`,
              }}>
                <span style={{ color: STATUS_COLORS[key].dot, fontWeight: 700 }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: STATUS_COLORS[key].text }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: STATUS_COLORS[key].text }}>{summary[key] || 0}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="animate-fade-in delay-200 card" style={{ padding: '24px' }}>
            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <button id="prev-month-btn" onClick={prevMonth} className="btn btn-secondary btn-sm">← Prev</button>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>
                {MONTHS[viewMonth]} {viewYear}
              </h2>
              <button id="next-month-btn" onClick={nextMonth} className="btn btn-secondary btn-sm">Next →</button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
              {DAYS_OF_WEEK.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {calDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const status = getDayStatus(day);
                const isToday = day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
                const isSelected = day === selectedDay;
                const colors = status ? STATUS_COLORS[status] : null;

                return (
                  <div
                    key={day}
                    id={`cal-day-${day}`}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      aspectRatio: '1', borderRadius: 10, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      background: isSelected ? 'var(--accent-color)' : isToday ? 'color-mix(in srgb, var(--accent-color) 15%, var(--surface))' : (colors?.bg || 'transparent'),
                      border: isSelected ? 'none' : isToday ? '2px solid var(--accent-color)' : `1.5px solid ${status ? STATUS_COLORS[status].dot + '44' : 'var(--border)'}`,
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <span style={{ fontSize: 13, fontWeight: isToday || isSelected ? 700 : 500, color: isSelected ? 'white' : isToday ? 'var(--accent-color)' : (colors?.text || 'var(--muted)') }}>
                      {day}
                    </span>
                    {status && status !== 'future' && (
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? 'white' : STATUS_COLORS[status].dot, marginTop: 2 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected day detail */}
          {selectedDay && (
            <div className="animate-fade-in card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>
                  {MONTHS[viewMonth]} {selectedDay}, {viewYear}
                </h3>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {selectedDayTasks.length} task{selectedDayTasks.length !== 1 ? 's' : ''}
                </span>
              </div>

              {selectedDayTasks.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>No tasks scheduled or recorded for this date.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedDayTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </AppShell>
      {modalOpen && <CreateTaskModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
