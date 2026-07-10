'use client';

import React, { useState } from 'react';
import { Task, CATEGORY_META } from '../../lib/data';

interface TaskCardProps {
  task: Task;
  onComplete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (task: Task) => void;
  compact?: boolean;
}

export default function TaskCard({ task, onComplete, onEdit, onDelete, onDuplicate, compact }: TaskCardProps) {
  const [checked, setChecked] = useState(task.status === 'completed');
  const [hovered, setHovered] = useState(false);
  const meta = CATEGORY_META[task.category];

  const statusColor = {
    completed: '#10b981',
    due: '#f59e0b',
    overdue: '#ef4444',
    upcoming: '#9ca3af',
  }[task.status];

  const statusLabel = {
    completed: 'Completed',
    due: 'Due Today',
    overdue: 'Overdue',
    upcoming: 'Upcoming',
  }[task.status];

  const repeatLabel = () => {
    if (task.repeatType === 'daily') return 'Every Day';
    if (task.repeatType === 'weekly') return 'Every Week';
    if (task.repeatType === 'monthly') return 'Every Month';
    if (task.repeatType === 'every_x_days') return `Every ${task.repeatInterval} Days`;
    if (task.repeatType === 'every_x_weeks') return `Every ${task.repeatInterval} Weeks`;
    if (task.repeatType === 'every_x_months') return `Every ${task.repeatInterval} Months`;
    return 'Custom';
  };

  const handleCheck = () => {
    setChecked(!checked);
    if (!checked && onComplete) onComplete(task.id);
  };

  return (
    <div
      className="card task-card animate-fade-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: compact ? '12px 16px' : '16px 18px',
        display: 'flex',
        alignItems: compact ? 'center' : 'flex-start',
        gap: 14,
        opacity: checked ? 0.65 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Checkbox */}
      <div
        className={`checkbox-box ${checked ? 'checked' : ''}`}
        onClick={handleCheck}
        style={{ marginTop: compact ? 0 : 2 }}
      >
        {checked && (
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
            <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: '#111827',
              textDecoration: checked ? 'line-through' : 'none',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {task.title}
            </div>
            {!compact && task.description && (
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {task.description}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="task-quick-actions" style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {onEdit && (
              <button className="btn btn-ghost btn-xs" onClick={() => onEdit(task)} title="Edit" style={{ padding: '4px 6px' }}>✏️</button>
            )}
            {onDuplicate && (
              <button className="btn btn-ghost btn-xs" onClick={() => onDuplicate(task)} title="Duplicate" style={{ padding: '4px 6px' }}>📋</button>
            )}
            {onDelete && (
              <button className="btn btn-ghost btn-xs" onClick={() => onDelete(task.id)} title="Delete" style={{ padding: '4px 6px', color: '#ef4444' }}>🗑️</button>
            )}
          </div>
        </div>

        {/* Badges row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <span className={`badge ${meta.cssClass}`}>{meta.icon} {meta.label}</span>
          <span className={`badge priority-${task.priority}`}>
            {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          <span className={`badge status-${task.status}`} style={{ color: statusColor }}>
            ● {statusLabel}
          </span>
          {task.reminderTime && (
            <span className="badge" style={{ background: '#f0f9ff', color: '#0284c7' }}>
              🕐 {task.reminderTime}
            </span>
          )}
          <span className="badge" style={{ background: '#f9fafb', color: '#6b7280' }}>
            🔁 {repeatLabel()}
          </span>
        </div>

        {/* Progress bar */}
        {!compact && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Completion Rate</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>{task.completionRate}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${task.completionRate}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
