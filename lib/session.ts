import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { randomUUID } from 'node:crypto'
import {
  createSessionRow,
  deleteExpiredSessions,
  deleteSessionRow,
  getSessionRow,
  getUserById,
} from '@/lib/db'
import type { AuthUser, SessionPayload } from '@/lib/definitions'

const SESSION_COOKIE = 'session'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000

function getSecretKey() {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET is not set')
  }
  return new TextEncoder().encode(secret)
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey())
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, getSecretKey(), {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(userId: string) {
  deleteExpiredSessions()

  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  const sessionId = randomUUID()

  createSessionRow({
    id: sessionId,
    userId,
    expiresAt: expiresAt.toISOString(),
  })

  const session = await encrypt({
    sessionId,
    userId,
    expiresAt: expiresAt.toISOString(),
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const payload = await decrypt(token)

  if (payload?.sessionId) {
    deleteSessionRow(payload.sessionId)
  }

  cookieStore.delete(SESSION_COOKIE)
}

export async function verifySession(): Promise<{
  isAuth: true
  userId: string
  sessionId: string
} | {
  isAuth: false
}> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const payload = await decrypt(token)

  if (!payload?.sessionId || !payload.userId) {
    return { isAuth: false }
  }

  const session = getSessionRow(payload.sessionId)
  if (!session) {
    return { isAuth: false }
  }

  if (new Date(session.expires_at) < new Date()) {
    deleteSessionRow(session.id)
    return { isAuth: false }
  }

  return {
    isAuth: true,
    userId: session.user_id,
    sessionId: session.id,
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await verifySession()
  if (!session.isAuth) return null

  const user = getUserById(session.userId)
  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    timezone: user.timezone,
    created_at: user.created_at,
  }
}
