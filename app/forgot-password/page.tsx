'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/app/actions/auth'
import type { FormState } from '@/lib/definitions'

const initialState: FormState = undefined

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState)

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--background)',
      }}
    >
      <div className="card animate-scale-in" style={{ width: '100%', maxWidth: 420, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
            }}
          >
            🔑
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--foreground)' }}>ReTasks</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Account Recovery</div>
          </div>
        </div>

        <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: 'var(--foreground)' }}>
          Reset Password
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--muted)' }}>
          Enter your registered email to receive a password reset link.
        </p>

        {state?.success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: 'color-mix(in srgb, #10b981 12%, var(--surface))',
                border: '1px solid color-mix(in srgb, #10b981 28%, var(--border))',
                color: '#059669',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ✓ {state.message}
            </div>

            {state.resetUrl && (
              <div style={{ background: 'var(--surface-muted)', padding: 16, borderRadius: 12 }}>
                <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 600 }}>
                  Demo Reset Link Generated:
                </p>
                <Link
                  href={state.resetUrl}
                  style={{
                    display: 'block',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'var(--accent-color)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 13,
                    textAlign: 'center',
                    textDecoration: 'none',
                  }}
                >
                  Proceed to Reset Password →
                </Link>
              </div>
            )}

            <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
              Back to{' '}
              <Link href="/login" style={{ color: 'var(--accent-color)', fontWeight: 700, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label
                htmlFor="email"
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                required
              />
              {state?.errors?.email && (
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444' }}>{state.errors.email[0]}</p>
              )}
            </div>

            {state?.message && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'color-mix(in srgb, #ef4444 12%, var(--surface))',
                  border: '1px solid color-mix(in srgb, #ef4444 28%, var(--border))',
                  color: '#ef4444',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {state.message}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={pending}
              style={{ width: '100%', opacity: pending ? 0.7 : 1 }}
            >
              {pending ? 'Generating Link…' : 'Send Reset Link'}
            </button>

            <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
              Remembered your password?{' '}
              <Link href="/login" style={{ color: 'var(--accent-color)', fontWeight: 700, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
