'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login, signup } from '@/app/actions/auth'
import type { FormState } from '@/lib/definitions'

type AuthFormProps = {
  mode: 'login' | 'register'
}

const initialState: FormState = undefined

export default function AuthForm({ mode }: AuthFormProps) {
  const action = mode === 'login' ? login : signup
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {mode === 'register' && (
        <div>
          <label
            htmlFor="name"
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            className="input"
            placeholder="Your name"
            autoComplete="name"
            required
          />
          {state?.errors?.name && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444' }}>{state.errors.name[0]}</p>
          )}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        {state?.errors?.email && (
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444' }}>{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label
            htmlFor="password"
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)' }}
          >
            Password
          </label>
          {mode === 'login' && (
            <Link
              href="/forgot-password"
              style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-color)', textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          )}
        </div>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
        />
        {state?.errors?.password && (
          <div style={{ marginTop: 6 }}>
            {mode === 'register' ? (
              <>
                <p style={{ margin: 0, fontSize: 12, color: '#ef4444' }}>Password must:</p>
                <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 12, color: '#ef4444' }}>
                  {state.errors.password.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: '#ef4444' }}>{state.errors.password[0]}</p>
            )}
          </div>
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
        {pending
          ? mode === 'login'
            ? 'Signing in…'
            : 'Creating account…'
          : mode === 'login'
            ? 'Sign In'
            : 'Create Account'}
      </button>

      <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
        {mode === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--accent-color)', fontWeight: 700, textDecoration: 'none' }}>
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent-color)', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
