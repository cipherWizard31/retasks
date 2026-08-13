'use client';

import { useState } from 'react';
import { Category, Priority, RepeatType, CompletionLogic, CATEGORY_META } from '../../lib/data';

interface CreateTaskModalProps {
  onClose: () => void;
  onSave?: (task: Record<string, unknown>) => void;
}

export default function CreateTaskModal({ onClose, onSave }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('personal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [repeatType, setRepeatType] = useState<RepeatType>('daily');
  const [repeatInterval, setRepeatInterval] = useState(3);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [completionLogic, setCompletionLogic] = useState<CompletionLogic>('fixed');
  const [step, setStep] = useState(1);

  const showIntervalInput = ['every_x_days', 'every_x_weeks', 'every_x_months'].includes(repeatType);
  const intervalUnit = repeatType === 'every_x_days' ? 'Days' : repeatType === 'every_x_weeks' ? 'Weeks' : 'Months';

  const handleSave = () => {
    if (!title.trim()) return;
    const isToday = startDate === new Date().toISOString().split('T')[0];
    const status = isToday ? 'due' : 'upcoming';
    const task = { id: Date.now().toString(), title, description, category, priority, repeatType, repeatInterval: showIntervalInput ? repeatInterval : undefined, startDate, reminderTime, completionLogic, status, completionRate: 0, streak: 0, totalCompleted: 0, totalMissed: 0 };
    onSave?.(task);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" id="create-task-modal">
        {/* Header */}
        <div style={{ padding: '24px 28px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827' }}>Create Task</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af' }}>Add a new recurring task to your schedule</p>
            </div>
            <button
              id="close-modal-btn"
              onClick={onClose}
              style={{ width: 36, height: 36, border: 'none', background: '#f1f5f9', borderRadius: '10px', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >×</button>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                onClick={() => setStep(s)}
                style={{
                  flex: 1, height: 4, borderRadius: 99,
                  background: s <= step ? 'linear-gradient(90deg, #10b981, #059669)' : '#f1f5f9',
                  cursor: 'pointer', transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>Details</span>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>Schedule</span>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>Settings</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px' }}>
          {step === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Task Name *</label>
                <input
                  id="task-name-input"
                  className="input"
                  placeholder="e.g. Read Bible, Morning Run…"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea
                  id="task-desc-input"
                  className="input"
                  placeholder="Optional description…"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Category</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {(Object.keys(CATEGORY_META) as Category[]).map((cat) => (
                    <button
                      key={cat}
                      id={`cat-${cat}`}
                      onClick={() => setCategory(cat)}
                      style={{
                        padding: '8px 4px',
                        border: `1.5px solid ${category === cat ? '#10b981' : '#e5e7eb'}`,
                        borderRadius: 10, cursor: 'pointer',
                        background: category === cat ? '#ecfdf5' : 'white',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{CATEGORY_META[cat].icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: category === cat ? '#059669' : '#6b7280' }}>{CATEGORY_META[cat].label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Priority</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      id={`priority-${p}`}
                      onClick={() => setPriority(p)}
                      className={`radio-option ${priority === p ? 'selected' : ''}`}
                    >
                      <span>{p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '🟢'}</span>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Repeat Type</label>
                <select id="repeat-type-select" className="input" value={repeatType} onChange={e => setRepeatType(e.target.value as RepeatType)}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="every_x_days">Every X Days</option>
                  <option value="every_x_weeks">Every X Weeks</option>
                  <option value="every_x_months">Every X Months</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {showIntervalInput && (
                <div className="animate-fade-in">
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Interval</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, color: '#6b7280' }}>Every</span>
                    <input
                      id="repeat-interval-input"
                      type="number"
                      className="input"
                      value={repeatInterval}
                      onChange={e => setRepeatInterval(Number(e.target.value))}
                      min={1}
                      style={{ width: 80 }}
                    />
                    <span style={{ fontSize: 14, color: '#6b7280' }}>{intervalUnit}</span>
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Start Date</label>
                <input
                  id="start-date-input"
                  type="date"
                  className="input"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Reminder Time</label>
                <input
                  id="reminder-time-input"
                  type="time"
                  className="input"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Completion Logic</label>
                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>How should the next occurrence be calculated?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { value: 'fixed', label: 'Fixed Schedule', desc: 'Tasks repeat on a fixed calendar interval regardless of completion.' },
                    { value: 'last_completion', label: 'Based on Last Completion', desc: 'The next occurrence is calculated from when you last completed it.' },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      id={`completion-logic-${opt.value}`}
                      onClick={() => setCompletionLogic(opt.value as CompletionLogic)}
                      style={{
                        padding: 14, border: `1.5px solid ${completionLogic === opt.value ? '#10b981' : '#e5e7eb'}`,
                        borderRadius: 12, cursor: 'pointer',
                        background: completionLogic === opt.value ? '#ecfdf5' : 'white',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%',
                          border: `2px solid ${completionLogic === opt.value ? '#10b981' : '#d1d5db'}`,
                          background: completionLogic === opt.value ? '#10b981' : 'white',
                          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {completionLogic === opt.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: completionLogic === opt.value ? '#059669' : '#374151' }}>{opt.label}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{opt.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {title && (
                <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Task Summary</div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {[
                      { label: 'Name', value: title },
                      { label: 'Category', value: `${CATEGORY_META[category].icon} ${CATEGORY_META[category].label}` },
                      { label: 'Priority', value: priority.charAt(0).toUpperCase() + priority.slice(1) },
                      { label: 'Schedule', value: repeatType === 'daily' ? 'Every Day' : `Every ${repeatInterval} ${intervalUnit}` },
                      { label: 'Start', value: startDate },
                      { label: 'Reminder', value: reminderTime },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#6b7280', width: 70, flexShrink: 0 }}>{label}:</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <button id="modal-cancel-btn" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 1 && (
              <button id="modal-back-btn" className="btn btn-secondary" onClick={() => setStep(step - 1)}>← Back</button>
            )}
            {step < 3 ? (
              <button id="modal-next-btn" className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={step === 1 && !title.trim()}>
                Next →
              </button>
            ) : (
              <button id="modal-create-btn" className="btn btn-primary" onClick={handleSave} disabled={!title.trim()}>
                ✓ Create Task
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
