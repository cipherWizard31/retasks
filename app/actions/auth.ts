'use server'

import { redirect } from 'next/navigation'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import {
  createUser,
  getUserByEmail,
} from '@/lib/db'
import {
  LoginFormSchema,
  SignupFormSchema,
  type FormState,
} from '@/lib/definitions'
import { createSession, deleteSession } from '@/lib/session'

export async function signup(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = validatedFields.data

  if (getUserByEmail(email)) {
    return {
      message: 'An account with this email already exists. Try logging in.',
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const userId = randomUUID()

  try {
    createUser({
      id: userId,
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    })
  } catch {
    return {
      message: 'An error occurred while creating your account.',
    }
  }

  await createSession(userId)
  redirect('/')
}

export async function login(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data
  const user = getUserByEmail(email)

  if (!user) {
    return {
      message: 'Invalid email or password.',
    }
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash)
  if (!passwordMatches) {
    return {
      message: 'Invalid email or password.',
    }
  }

  await createSession(user.id)
  redirect('/')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
