'use client'

import React, { useActionState, useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { useAuth } from '../components/auth-provider'
import { updateProfile, changePassword } from '@/app/actions/auth'
import type { FormState } from '@/lib/definitions'

const initialProfileState: FormState = undefined
const initialPasswordState: FormState = undefined

export default function ProfilePage() {
  const user = useAuth()
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, initialProfileState)
  const [passwordState, passwordAction, passwordPending] = useActionState(changePassword, initialPasswordState)

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC')

  useEffect(() => {
    if (user?.name) setName(user.name)
    if (user?.email) setEmail(user.email)
    if (user?.bio) setBio(user.bio)
    if (user?.timezone) setTimezone(user.timezone)
  }, [user])

  const initials = (name || 'User').charAt(0).toUpperCase()

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div className="animate-fade-in">
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
            👤 User Profile
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>
            Manage your personal profile details and security settings
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="card animate-scale-in" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-color, #10b981), #0ea5e9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: 32,
              boxShadow: '0 4px 16px color-mix(in srgb, var(--accent-color, #10b981) 30%, transparent)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--foreground)' }}>
              {name || 'User Profile'}
            </h2>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{email}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 99,
                  background: 'var(--accent-color-light)',
                  color: 'var(--accent-color-dark)',
                }}
              >
                🌐 Timezone: {timezone}
              </span>
              {user?.created_at && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 99,
                    background: 'var(--surface-muted)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  📅 Member since {new Date(user.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="card animate-fade-in delay-100" style={{ padding: 28 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: 'var(--foreground)' }}>
            Edit Profile Information
          </h3>

          <form action={profileAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>
                  Display Name
                </label>
                <input
                  id="profile-name"
                  name="name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {profileState?.errors?.name && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>{profileState.errors.name[0]}</p>
                )}
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {profileState?.errors?.email && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>{profileState.errors.email[0]}</p>
                )}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>
                Timezone
              </label>
              <select
                id="profile-timezone"
                name="timezone"
                className="input"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">GMT / London</option>
                <option value="Europe/Berlin">CET / Berlin</option>
                <option value="Asia/Tokyo">JST / Tokyo</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>
                Bio / Personal Note
              </label>
              <textarea
                id="profile-bio"
                name="bio"
                className="input"
                rows={3}
                placeholder="Share a short bio or notes on your task routine…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            {profileState?.message && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: profileState.success
                    ? 'color-mix(in srgb, #10b981 12%, var(--surface))'
                    : 'color-mix(in srgb, #ef4444 12%, var(--surface))',
                  border: profileState.success
                    ? '1px solid color-mix(in srgb, #10b981 28%, var(--border))'
                    : '1px solid color-mix(in srgb, #ef4444 28%, var(--border))',
                  color: profileState.success ? '#059669' : '#ef4444',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {profileState.success ? '✓ ' : '⚠️ '}{profileState.message}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                type="submit"
                id="save-profile-btn"
                className="btn btn-primary"
                disabled={profilePending}
                style={{ opacity: profilePending ? 0.7 : 1 }}
              >
                {profilePending ? 'Saving…' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card animate-fade-in delay-200" style={{ padding: 28 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: 'var(--foreground)' }}>
            Security & Password
          </h3>

          <form action={passwordAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>
                  Current Password
                </label>
                <input
                  id="current-password"
                  name="currentPassword"
                  type="password"
                  className="input"
                  placeholder="Your current password"
                  required
                />
                {passwordState?.errors?.currentPassword && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>{passwordState.errors.currentPassword[0]}</p>
                )}
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>
                  New Password
                </label>
                <input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  className="input"
                  placeholder="At least 8 characters"
                  required
                />
                {passwordState?.errors?.newPassword && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>{passwordState.errors.newPassword[0]}</p>
                )}
              </div>
            </div>

            {passwordState?.message && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: passwordState.success
                    ? 'color-mix(in srgb, #10b981 12%, var(--surface))'
                    : 'color-mix(in srgb, #ef4444 12%, var(--surface))',
                  border: passwordState.success
                    ? '1px solid color-mix(in srgb, #10b981 28%, var(--border))'
                    : '1px solid color-mix(in srgb, #ef4444 28%, var(--border))',
                  color: passwordState.success ? '#059669' : '#ef4444',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {passwordState.success ? '✓ ' : '⚠️ '}{passwordState.message}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                type="submit"
                id="change-password-btn"
                className="btn btn-secondary"
                disabled={passwordPending}
                style={{ opacity: passwordPending ? 0.7 : 1 }}
              >
                {passwordPending ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
