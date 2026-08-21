'use client'

import { useActionState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { resetPassword } from '@/app/actions/auth'
import type { FormState } from '@/lib/definitions'

const initialState: FormState = undefined

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [state, formAction, pending] = useActionState(resetPassword, initialState)

  return (
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
          🔒
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--foreground)' }}>ReTasks</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Set New Password</div>
        </div>
      </div>

      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: 'var(--foreground)' }}>
        New Password
      </h1>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--muted)' }}>
        Enter your new password below.
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

          <Link
            href="/login"
            className="btn btn-primary"
            style={{ textDecoration: 'none', textAlign: 'center' }}
          >
            Sign In Now
          </Link>
        </div>
      ) : (
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="hidden" name="token" value={token} />

          <div>
            <label
              htmlFor="password"
              style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}
            >
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="At least 8 characters"
              required
            />
            {state?.errors?.password && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444' }}>{state.errors.password[0]}</p>
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
            disabled={pending || !token}
            style={{ width: '100%', opacity: pending || !token ? 0.7 : 1 }}
          >
            {pending ? 'Updating Password…' : 'Save New Password'}
          </button>

          <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
            Back to{' '}
            <Link href="/login" style={{ color: 'var(--accent-color)', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
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
      <Suspense fallback={<div style={{ color: 'var(--muted)' }}>Loading…</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  )
}
