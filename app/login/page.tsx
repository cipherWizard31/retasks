import AuthForm from '../components/AuthForm'

export default function LoginPage() {
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
            ✓
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--foreground)' }}>ReTasks</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Welcome back</div>
          </div>
        </div>

        <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: 'var(--foreground)' }}>
          Sign in
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--muted)' }}>
          Log in to manage your recurring tasks.
        </p>

        <AuthForm mode="login" />
      </div>
    </div>
  )
}
