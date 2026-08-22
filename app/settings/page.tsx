'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useTheme } from 'next-themes';
import AppShell from '../components/AppShell';
import { applyAccentColor, ACCENT_COLORS } from '../components/theme-provider';
import { useAuth } from '../components/auth-provider';
import { logout } from '@/app/actions/auth';
import { TASKS, Task } from '@/lib/data';
import { exportTasksToJSON, exportTasksToCSV, exportFullBackup, parseImportTasks } from '@/lib/data-management';
import { createTaskAction } from '@/app/actions/tasks';
import { updateProfile } from '@/app/actions/auth';

const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile & Account', icon: '👤' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'schedule', label: 'Schedule & Defaults', icon: '⏰' },
  { id: 'data', label: 'Data Management', icon: '💾' },
  { id: 'security', label: 'Security & Privacy', icon: '🛡️' },
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
  const [isPending, startTransition] = useTransition();

  // Settings State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'America/New_York');
  const [defaultRepeat, setDefaultRepeat] = useState('daily');
  const [defaultReminder, setDefaultReminder] = useState('08:00 AM');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [overdueAlerts, setOverdueAlerts] = useState(true);
  const [reminderBefore, setReminderBefore] = useState('15');
  const [weekStart, setWeekStart] = useState('Sunday');
  const [saved, setSaved] = useState(false);
  const [accentColor, setAccentColor] = useState('#10b981');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const importFileInputRef = useRef<HTMLInputElement>(null);
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedAccent = localStorage.getItem('app-accent-color') || '#10b981';
    const savedTimezone = localStorage.getItem('app-timezone') || user?.timezone || 'America/New_York';
    const savedRepeat = localStorage.getItem('app-default-repeat') || 'daily';
    const savedReminder = localStorage.getItem('app-default-reminder') || '08:00 AM';

    setAccentColor(savedAccent);
    applyAccentColor(savedAccent);
    setTimezone(savedTimezone);
    setDefaultRepeat(savedRepeat);
    setDefaultReminder(savedReminder);

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
    localStorage.setItem('app-timezone', timezone);
    localStorage.setItem('app-default-repeat', defaultRepeat);
    localStorage.setItem('app-default-reminder', defaultReminder);

    startTransition(async () => {
      const formData = new FormData();
      formData.set('name', name);
      formData.set('email', email);
      formData.set('timezone', timezone);
      await updateProfile(undefined, formData);
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Data Management Handlers
  const handleExportJSON = () => exportTasksToJSON(TASKS);
  const handleExportCSV = () => exportTasksToCSV(TASKS);
  const handleExportBackup = () => exportFullBackup(TASKS);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>, isBackup = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const isCsv = file.name.endsWith('.csv');
        const importedTasks = parseImportTasks(text, isCsv);

        if (importedTasks.length > 0) {
          startTransition(() => {
            importedTasks.forEach(task => {
              createTaskAction(task);
            });
          });
          setImportStatus(`Successfully imported ${importedTasks.length} task(s)! 🎉`);
        } else {
          setImportStatus('No valid tasks found in file.');
        }
      } catch (err) {
        setImportStatus('Failed to parse import file.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const selectedTheme = mounted ? theme : undefined;

  const Toggle = ({ enabled, onChange, id }: { enabled: boolean; onChange: () => void; id: string }) => (
    <button
      id={id}
      type="button"
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, opacity: isPending ? 0.8 : 1 }}>

        {/* Header */}
        <div className="animate-fade-in">
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>⚙️ Settings</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>Manage account, theme, notifications, data export, and security</p>
        </div>

        <div className="animate-fade-in delay-100" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>

          {/* Sidebar Navigation */}
          <div className="card" style={{ padding: '12px', height: 'fit-content' }}>
            {SETTINGS_SECTIONS.map(sec => (
              <button
                key={sec.id}
                id={`settings-${sec.id}`}
                type="button"
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

          {/* Content Panel */}
          <div className="card animate-scale-in" style={{ padding: '28px' }}>

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>Account & Profile</h2>
                  <a href="/profile" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                    Open Full Profile 👤
                  </a>
                </div>
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
              </div>
            )}

            {/* Appearance Section */}
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
                            height: 56, borderRadius: 8, background: option.preview,
                            border: `1px solid ${option.accent}`, position: 'relative', overflow: 'hidden',
                          }}>
                            <div style={{ position: 'absolute', left: 8, top: 8, bottom: 8, width: 14, borderRadius: 4, background: option.id === 'light' ? '#ffffff' : option.id === 'dark' ? '#1e293b' : 'linear-gradient(180deg, #ffffff 50%, #1e293b 50%)', border: `1px solid ${option.accent}` }} />
                            <div style={{ position: 'absolute', left: 28, top: 12, right: 8, height: 8, borderRadius: 4, background: option.id === 'dark' ? '#334155' : option.id === 'light' ? '#e5e7eb' : '#94a3b8' }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <span style={{ fontSize: 16 }}>{option.icon}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? 'var(--accent-color-dark)' : 'var(--muted-foreground)' }}>{option.label}</span>
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
                        onClick={() => handleAccentChange(color.hex)}
                        style={{
                          width: 36, height: 36, borderRadius: '50%', background: color.hex, cursor: 'pointer',
                          border: color.hex === accentColor ? '3px solid var(--foreground)' : '3px solid transparent',
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>Notification Settings</h2>
                {[
                  { id: 'notif-enable', label: 'Enable Local Notifications', desc: 'Receive reminders for due tasks', state: notifEnabled, toggle: () => setNotifEnabled(!notifEnabled) },
                  { id: 'notif-sound', label: 'Sound Alerts', desc: 'Play audio chime when reminder fires', state: soundEnabled, toggle: () => setSoundEnabled(!soundEnabled) },
                  { id: 'notif-overdue', label: 'Overdue Alerts', desc: 'Get immediate notifications when tasks pass due date', state: overdueAlerts, toggle: () => setOverdueAlerts(!overdueAlerts) },
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
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Default Reminder Lead Time</label>
                  <select id="reminder-before-select" className="input" value={reminderBefore} onChange={e => setReminderBefore(e.target.value)} style={{ maxWidth: 220 }}>
                    <option value="5">5 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                  </select>
                </div>
              </div>
            )}

            {/* Schedule & Defaults Section */}
            {activeSection === 'schedule' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>Schedule & Defaults</h2>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Time Zone</label>
                  <select id="timezone-select" className="input" value={timezone} onChange={e => setTimezone(e.target.value)}>
                    <option value="America/New_York">Eastern Time (ET - America/New_York)</option>
                    <option value="America/Chicago">Central Time (CT - America/Chicago)</option>
                    <option value="America/Denver">Mountain Time (MT - America/Denver)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT - America/Los_Angeles)</option>
                    <option value="Europe/London">GMT / UTC (Europe/London)</option>
                    <option value="Europe/Paris">Central European Time (Europe/Paris)</option>
                    <option value="Asia/Tokyo">Japan Standard Time (Asia/Tokyo)</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Default Repeat Type</label>
                    <select id="default-repeat-select" className="input" value={defaultRepeat} onChange={e => setDefaultRepeat(e.target.value)}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="every_x_days">Every X Days</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Default Reminder Time</label>
                    <input id="default-reminder-input" className="input" type="time" value="08:00" onChange={e => setDefaultReminder(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Data Management Section */}
            {activeSection === 'data' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>Data Management</h2>

                {importStatus && (
                  <div style={{ padding: '12px 16px', background: 'color-mix(in srgb, #10b981 15%, var(--surface))', border: '1px solid #10b98144', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#10b981' }}>
                    {importStatus}
                  </div>
                )}

                {/* Export Card */}
                <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginBottom: 4 }}>📤 Export Tasks</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>Export all your active tasks and metadata into JSON or CSV format.</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button id="export-json-btn" className="btn btn-secondary btn-sm" onClick={handleExportJSON}>📄 Export JSON</button>
                    <button id="export-csv-btn" className="btn btn-secondary btn-sm" onClick={handleExportCSV}>📊 Export CSV</button>
                  </div>
                </div>

                {/* Import Card */}
                <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginBottom: 4 }}>📥 Import Tasks</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>Import tasks from a previously exported JSON or CSV file.</div>
                  <input
                    ref={importFileInputRef}
                    type="file"
                    accept=".json,.csv"
                    style={{ display: 'none' }}
                    onChange={e => handleImportFile(e)}
                  />
                  <button id="import-tasks-btn" className="btn btn-primary btn-sm" onClick={() => importFileInputRef.current?.click()}>
                    📁 Choose Import File (.json / .csv)
                  </button>
                </div>

                {/* Backup & Restore Card */}
                <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginBottom: 4 }}>📦 Backup & Restore</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>Download a full encrypted database backup or restore system state.</div>
                  <input
                    ref={restoreFileInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={e => handleImportFile(e, true)}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button id="backup-btn" className="btn btn-secondary btn-sm" onClick={handleExportBackup}>📦 Generate Backup</button>
                    <button id="restore-btn" className="btn btn-secondary btn-sm" onClick={() => restoreFileInputRef.current?.click()}>🔄 Restore Backup</button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--foreground)' }}>Security & Protection</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { title: '🔒 Authentication Middleware', desc: 'Active HTTP session middleware with JWT verification', status: 'Active' },
                    { title: '🛡️ Rate Limiting', desc: 'Sliding window rate limiting (120 req/min) active on proxy', status: 'Active' },
                    { title: '🌐 CSRF Protection', desc: 'Origin & Fetch-Site header validation enforced', status: 'Active' },
                    { title: '💉 SQL Injection Protection', desc: 'Parameterized SQLite statements via Node sqlite driver', status: 'Protected' },
                    { title: '🧼 XSS Protection', desc: 'Strict React DOM rendering with escaping & sanitized inputs', status: 'Protected' },
                  ].map(sec => (
                    <div key={sec.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--surface-muted)', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>{sec.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{sec.desc}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#10b98122', color: '#10b981', border: '1px solid #10b98144' }}>
                        ● {sec.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Save Bar */}
            {activeSection !== 'data' && activeSection !== 'security' && (
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
