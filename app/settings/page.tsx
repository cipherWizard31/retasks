'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import AppShell from '../components/AppShell';
import { applyAccentColor, ACCENT_COLORS } from '../components/theme-provider';
import { useAuth } from '../components/auth-provider';
import { logout } from '@/app/actions/auth';

const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'schedule', label: 'Schedule & Time', icon: '⏰' },
  { id: 'data', label: 'Data & Privacy', icon: '🔒' },
];

const THEME_OPTIONS = [
  { id: 'light', label: 'Light', icon: '☀️', preview: '#f8fafc', accent: '#e5e7eb' },
  { id: 'dark', label: 'Dark', icon: '🌙', preview: '#0f172a', accent: '#334155' },
  { id: 'system', label: 'System', icon: '🖥️', preview: 'linear-gradient(135deg, #f8fafc 50%, #0f172a 50%)', accent: '#94a3b8' },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('appearance');
  const user = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [timezone, setTimezone] = useState('America/New_York');
  const [defaultRepeat, setDefaultRepeat] = useState('daily');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [reminderBefore, setReminderBefore] = useState('15');
  const [weekStart, setWeekStart] = useState('Sunday');
  const [saved, setSaved] = useState(false);
  const [accentColor, setAccentColor] = useState('#10b981');

  useEffect(() => {
    setMounted(true);
    const savedAccent = localStorage.getItem('app-accent-color') || '#10b981';
    setAccentColor(savedAccent);
    applyAccentColor(savedAccent);
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleAccentChange = (hexColor: string) => {
    setAccentColor(hexColor);
    localStorage.setItem('app-accent-color', hexColor);
    applyAccentColor(hexColor);
  };

  const handleThemeChange = (themeId: (typeof THEME_OPTIONS)[number]['id']) => {
    setTheme(themeId);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selectedTheme = mounted ? theme : undefined;

  const Toggle = ({ enabled, onChange, id }: { enabled: boolean; onChange: () => void; id: string }) => (
    <button
      id={id}
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: enabled ? 'var(--accent-color, #10b981)' : 'var(--border-strong)',
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
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>⚙️ Settings</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>Manage your account and preferences</p>
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
                  background: activeSection === sec.id ? 'var(--accent-color-light)' : 'transparent',
                  color: activeSection === sec.id ? 'var(--accent-color-dark)' : 'var(--muted-foreground)',
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
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>Profile</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: `linear-gradient(135deg, var(--accent-color), #0ea5e9)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: 28,
                    boxShadow: '0 4px 16px color-mix(in srgb, var(--accent-color) 30%, transparent)',
                  }}>{(name || 'U').charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>{name || 'User'}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{email || 'Free Plan'}</div>
                    <form action={logout}>
                      <button type="submit" className="btn btn-secondary btn-sm">Log out</button>
                    </form>
                  </div>
                </div>
                <div className="divider" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Display Name</label>
                    <input id="settings-name" className="input" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Email Address</label>
                    <input id="settings-email" className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Bio</label>
                  <textarea id="settings-bio" className="input" placeholder="A short bio…" rows={3} style={{ fontFamily: 'inherit', resize: 'vertical' }} />
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>Appearance</h2>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 12 }}>Theme</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {THEME_OPTIONS.map(option => {
                      const isActive = selectedTheme === option.id;
                      return (
                        <button
                          key={option.id}
                          id={`theme-${option.id}`}
                          type="button"
                          onClick={() => handleThemeChange(option.id)}
                          aria-pressed={isActive}
                          style={{
                            padding: 12,
                            border: `2px solid ${isActive ? 'var(--accent-color)' : 'var(--border-strong)'}`,
                            borderRadius: 12,
                            cursor: 'pointer',
                            background: isActive ? 'var(--accent-color-light)' : 'var(--surface)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            gap: 10,
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{
                            height: 56,
                            borderRadius: 8,
                            background: option.preview,
                            border: `1px solid ${option.accent}`,
                            position: 'relative',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              position: 'absolute', left: 8, top: 8, bottom: 8, width: 14,
                              borderRadius: 4,
                              background: option.id === 'light' ? '#ffffff' : option.id === 'dark' ? '#1e293b' : 'linear-gradient(180deg, #ffffff 50%, #1e293b 50%)',
                              border: `1px solid ${option.accent}`,
                            }} />
                            <div style={{
                              position: 'absolute', left: 28, top: 12, right: 8, height: 8,
                              borderRadius: 4,
                              background: option.id === 'dark' ? '#334155' : option.id === 'light' ? '#e5e7eb' : '#94a3b8',
                            }} />
                            <div style={{
                              position: 'absolute', left: 28, top: 26, right: 18, height: 6,
                              borderRadius: 4,
                              background: option.id === 'dark' ? '#475569' : option.id === 'light' ? '#f1f5f9' : '#64748b',
                            }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <span style={{ fontSize: 16 }}>{option.icon}</span>
                            <span style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: isActive ? 'var(--accent-color-dark)' : 'var(--muted-foreground)',
                            }}>
                              {option.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="divider" />
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 12 }}>Accent Color</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {ACCENT_COLORS.map(color => (
                      <button
                        key={color.hex}
                        type="button"
                        aria-label={`Accent ${color.name}`}
                        onClick={() => handleAccentChange(color.hex)}
                        style={{
                          width: 36, height: 36, borderRadius: '50%', background: color.hex, cursor: 'pointer',
                          border: color.hex === accentColor ? '3px solid var(--foreground)' : '3px solid transparent',
                          transition: 'transform 0.15s',
                          padding: 0,
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
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>Notifications</h2>
                {[
                  { id: 'notif-enable', label: 'Enable Notifications', desc: 'Receive reminders for due tasks', state: notifEnabled, toggle: () => setNotifEnabled(!notifEnabled) },
                  { id: 'notif-sound', label: 'Sound Alerts', desc: 'Play sound when notification fires', state: true, toggle: () => {} },
                  { id: 'notif-badge', label: 'Badge Count', desc: 'Show unread count on app icon', state: true, toggle: () => {} },
                  { id: 'notif-overdue', label: 'Overdue Alerts', desc: 'Get notified when tasks are overdue', state: true, toggle: () => {} },
                ].map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--surface-muted)', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{item.desc}</div>
                    </div>
                    <Toggle id={item.id} enabled={item.state} onChange={item.toggle} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Reminder Before Due</label>
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
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>Schedule & Time</h2>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Time Zone</label>
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
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Default Repeat Type</label>
                  <select id="default-repeat-select" className="input" value={defaultRepeat} onChange={e => setDefaultRepeat(e.target.value)} style={{ maxWidth: 200 }}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="every_x_days">Every X Days</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Week Starts On</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['Sunday', 'Monday'].map(day => (
                      <button
                        key={day}
                        id={`week-start-${day.toLowerCase()}`}
                        type="button"
                        onClick={() => setWeekStart(day)}
                        style={{
                          padding: '8px 20px',
                          border: `1.5px solid ${weekStart === day ? 'var(--accent-color)' : 'var(--border-strong)'}`,
                          borderRadius: 10,
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: 13,
                          background: weekStart === day ? 'var(--accent-color-light)' : 'var(--surface)',
                          color: weekStart === day ? 'var(--accent-color-dark)' : 'var(--muted-foreground)',
                        }}
                      >{day}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>Data & Privacy</h2>
                <div style={{ background: 'color-mix(in srgb, #0ea5e9 12%, var(--surface))', border: '1px solid color-mix(in srgb, #0ea5e9 30%, var(--border))', borderRadius: 12, padding: '16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', marginBottom: 4 }}>📦 Export Data</div>
                  <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 12 }}>Download all your tasks and history as JSON or CSV.</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button id="export-json-btn" className="btn btn-secondary btn-sm">Export JSON</button>
                    <button id="export-csv-btn" className="btn btn-secondary btn-sm">Export CSV</button>
                  </div>
                </div>
                <div style={{ background: 'color-mix(in srgb, #ef4444 12%, var(--surface))', border: '1px solid color-mix(in srgb, #ef4444 30%, var(--border))', borderRadius: 12, padding: '16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>⚠️ Danger Zone</div>
                  <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 12 }}>These actions are irreversible. Please proceed with caution.</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button id="clear-history-btn" className="btn btn-danger btn-sm">Clear All History</button>
                    <button id="delete-account-btn" className="btn btn-danger btn-sm">Delete Account</button>
                  </div>
                </div>
              </div>
            )}

            {activeSection !== 'data' && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn-secondary">Cancel</button>
                <button
                  id="save-settings-btn"
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  style={saved ? { background: 'var(--accent-color-light)', color: 'var(--accent-color-dark)', boxShadow: 'none' } : undefined}
                >
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
