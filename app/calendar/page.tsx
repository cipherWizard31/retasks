'use client';

import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import CreateTaskModal from '../components/CreateTaskModal';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type DayStatus = 'completed' | 'due' | 'missed' | 'future' | null;

const DAY_MOCK: Record<number, DayStatus> = {
  1: 'completed', 2: 'completed', 3: 'missed', 4: 'completed', 5: 'completed',
  6: 'completed', 7: 'completed', 8: 'missed', 9: 'completed', 10: 'missed',
  11: 'completed', 12: 'completed', 13: 'completed', 14: 'completed', 15: 'due',
  16: 'due', 17: 'future', 18: 'future', 19: 'future', 20: 'future',
  21: 'future', 22: 'future', 23: 'future', 24: 'future', 25: 'future',
  26: 'future', 27: 'future', 28: 'future', 29: 'future', 30: 'future', 31: 'future',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  completed: { bg: '#ecfdf5', text: '#059669', dot: '#10b981' },
  due: { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
  missed: { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
  future: { bg: 'transparent', text: '#9ca3af', dot: '#d1d5db' },
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

  const summary = Object.values(DAY_MOCK).reduce((acc, s) => { if (s) acc[s] = (acc[s] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <>
      <AppShell onAddTask={() => setModalOpen(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>🗓️ Calendar</h1>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#9ca3af' }}>Monthly view of your task completion</p>
            </div>
            <button id="cal-add-btn" className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add Task</button>
          </div>

          {/* Summary pills */}
          <div className="animate-fade-in delay-100" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { key: 'completed', label: 'Completed', icon: '✓' },
              { key: 'due', label: 'Due', icon: '●' },
              { key: 'missed', label: 'Missed', icon: '✗' },
              { key: 'future', label: 'Future', icon: '○' },
            ].map(({ key, label, icon }) => (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 99,
                background: STATUS_COLORS[key].bg || '#f9fafb',
                border: `1px solid ${STATUS_COLORS[key].dot}33`,
              }}>
                <span style={{ color: STATUS_COLORS[key].dot, fontWeight: 700 }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: STATUS_COLORS[key].text }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: STATUS_COLORS[key].text }}>{summary[key] || 0}</span>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="animate-fade-in delay-200 card" style={{ padding: '24px' }}>
            {/* Nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <button id="prev-month-btn" onClick={prevMonth} className="btn btn-secondary btn-sm">← Prev</button>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>
                {MONTHS[viewMonth]} {viewYear}
              </h2>
              <button id="next-month-btn" onClick={nextMonth} className="btn btn-secondary btn-sm">Next →</button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
              {DAYS_OF_WEEK.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {calDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const status = DAY_MOCK[day];
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
                      background: isSelected ? '#10b981' : isToday ? '#ecfdf5' : (colors?.bg || 'transparent'),
                      border: isSelected ? 'none' : isToday ? '2px solid #10b981' : `1.5px solid ${status ? STATUS_COLORS[status].dot + '33' : '#f1f5f9'}`,
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <span style={{ fontSize: 13, fontWeight: isToday || isSelected ? 700 : 500, color: isSelected ? 'white' : isToday ? '#059669' : (colors?.text || '#9ca3af') }}>
                      {day}
                    </span>
                    {status && status !== 'future' && (
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.7)' : STATUS_COLORS[status].dot, marginTop: 2 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected day detail */}
          {selectedDay && (
            <div className="animate-fade-in card" style={{ padding: '20px 24px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#111827' }}>
                {MONTHS[viewMonth]} {selectedDay}
              </h3>
              {(() => {
                const status = DAY_MOCK[selectedDay];
                if (!status || status === 'future') return <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>No task data for this day.</p>;
                const colors = STATUS_COLORS[status];
                return (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ background: colors.bg, border: `1px solid ${colors.dot}44`, borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.dot }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </div>
                    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>
                      3 tasks were due on this day
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </AppShell>
      {modalOpen && <CreateTaskModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
