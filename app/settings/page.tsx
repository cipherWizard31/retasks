'use client';

import React, { useState } from 'react';
import AppShell from '../components/AppShell';

const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'schedule', label: 'Schedule & Time', icon: '⏰' },
  { id: 'data', label: 'Data & Privacy', icon: '🔒' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [name, setName] = useState('Nate');
  const [email, setEmail] = useState('nate@example.com');
  const [timezone, setTimezone] = useState('America/New_York');
  const [defaultRepeat, setDefaultRepeat] = useState('daily');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [reminderBefore, setReminderBefore] = useState('15');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ enabled, onChange, id }: { enabled: boolean; onChange: () => void; id: string }) => (
    <button
      id={id}
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: enabled ? '#10b981' : '#d1d5db',
        position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 3, left: enabled ? 23 : 3,
        transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div className="animate-fade-in">
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>⚙️ Settings</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#9ca3af' }}>Manage your account and preferences</p>
        </div>

        <div className="animate-fade-in delay-100" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>

          {/* Sidebar */}
          <div className="card" style={{ padding: '12px', height: 'fit-content' }}>
            {SETTINGS_SECTIONS.map(sec => (
              <button
                key={sec.id}
                id={`settings-${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', border: 'none', borderRadius: 10,
                  background: activeSection === sec.id ? '#ecfdf5' : 'transparent',
                  color: activeSection === sec.id ? '#059669' : '#6b7280',
                  fontWeight: activeSection === sec.id ? 700 : 500, fontSize: 14,
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', marginBottom: 2,
                }}
              >
                <span style={{ fontSize: 18 }}>{sec.icon}</span>
                {sec.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="card animate-scale-in" style={{ padding: '28px' }}>

            {activeSection === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Profile</h2>
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: 28,
                    boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                  }}>N</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Nate</div>
                    <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>Free Plan</div>
                    <button className="btn btn-secondary btn-sm">Change Photo</button>
                  </div>
                </div>
                <div className="divider" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Display Name</label>
                    <input id="settings-name" className="input" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address</label>
                    <input id="settings-email" className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Bio</label>
                  <textarea id="settings-bio" className="input" placeholder="A short bio…" rows={3} style={{ fontFamily: 'inherit', resize: 'vertical' }} />
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Appearance</h2>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 12 }}>Theme</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {['Light', 'Dark', 'System'].map(theme => (
                      <button
                        key={theme}
                        id={`theme-${theme.toLowerCase()}`}
                        style={{
                          padding: '16px', border: `2px solid ${theme === 'Light' ? '#10b981' : '#e5e7eb'}`,
                          borderRadius: 12, cursor: 'pointer', background: theme === 'Light' ? '#ecfdf5' : 'white',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{theme === 'Light' ? '☀️' : theme === 'Dark' ? '🌙' : '🖥️'}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: theme === 'Light' ? '#059669' : '#6b7280' }}>{theme}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="divider" />
                <div>
                  <label className='' style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 12 }}>Accent Color</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['#10b981', '#0ea5e9', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899'].map(color => (
                      <div
                        key={color}
                        style={{
                          width: 36, height: 36, borderRadius: '50%', background: color, cursor: 'pointer',
                          border: color === '#10b981' ? '3px solid #111827' : '3px solid transparent',
                          transition: 'transform 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Notifications</h2>
                {[
                  { id: 'notif-enable', label: 'Enable Notifications', desc: 'Receive reminders for due tasks', state: notifEnabled, toggle: () => setNotifEnabled(!notifEnabled) },
                  { id: 'notif-sound', label: 'Sound Alerts', desc: 'Play sound when notification fires', state: true, toggle: () => {} },
                  { id: 'notif-badge', label: 'Badge Count', desc: 'Show unread count on app icon', state: true, toggle: () => {} },
                  { id: 'notif-overdue', label: 'Overdue Alerts', desc: 'Get notified when tasks are overdue', state: true, toggle: () => {} },
                ].map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f9fafb', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{item.desc}</div>
                    </div>
                    <Toggle id={item.id} enabled={item.state} onChange={item.toggle} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Reminder Before Due</label>
                  <select id="reminder-before-select" className="input" value={reminderBefore} onChange={e => setReminderBefore(e.target.value)} style={{ maxWidth: 200 }}>
                    <option value="5">5 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="1440">1 day</option>
                  </select>
                </div>
              </div>
            )}

            {activeSection === 'schedule' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Schedule & Time</h2>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Time Zone</label>
                  <select id="timezone-select" className="input" value={timezone} onChange={e => setTimezone(e.target.value)}>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">GMT/UTC</option>
                    <option value="Europe/Berlin">Central European Time</option>
                    <option value="Asia/Tokyo">Japan Standard Time</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Default Repeat Type</label>
                  <select id="default-repeat-select" className="input" value={defaultRepeat} onChange={e => setDefaultRepeat(e.target.value)} style={{ maxWidth: 200 }}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="every_x_days">Every X Days</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Week Starts On</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['Sunday', 'Monday'].map(day => (
                      <button
                        key={day}
                        id={`week-start-${day.toLowerCase()}`}
                        style={{
                          padding: '8px 20px', border: `1.5px solid ${day === 'Sunday' ? '#10b981' : '#e5e7eb'}`,
                          borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                          background: day === 'Sunday' ? '#ecfdf5' : 'white',
                          color: day === 'Sunday' ? '#059669' : '#6b7280',
                        }}
                      >{day}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Data & Privacy</h2>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: '16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', marginBottom: 4 }}>📦 Export Data</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Download all your tasks and history as JSON or CSV.</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button id="export-json-btn" className="btn btn-secondary btn-sm">Export JSON</button>
                    <button id="export-csv-btn" className="btn btn-secondary btn-sm">Export CSV</button>
                  </div>
                </div>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>⚠️ Danger Zone</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>These actions are irreversible. Please proceed with caution.</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button id="clear-history-btn" className="btn btn-danger btn-sm">Clear All History</button>
                    <button id="delete-account-btn" className="btn btn-danger btn-sm">Delete Account</button>
                  </div>
                </div>
              </div>
            )}

            {/* Save button */}
            {activeSection !== 'data' && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn btn-secondary">Cancel</button>
                <button id="save-settings-btn" className="btn btn-primary" onClick={handleSave}
                  style={{ background: saved ? '#d1fae5' : undefined, color: saved ? '#059669' : undefined, boxShadow: saved ? 'none' : undefined }}>
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
