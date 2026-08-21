'use server'

import { redirect } from 'next/navigation'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import {
  createPasswordResetRow,
  createUser,
  deletePasswordResetRow,
  getPasswordResetByToken,
  getUserByEmail,
  getUserById,
  updateUserPassword,
  updateUserProfileDb,
} from '@/lib/db'
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  LoginFormSchema,
  ProfileUpdateSchema,
  ResetPasswordSchema,
  SignupFormSchema,
  type FormState,
} from '@/lib/definitions'
import { createSession, deleteSession, getCurrentUser } from '@/lib/session'
import { revalidatePath } from 'next/cache'

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

export async function requestPasswordReset(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = ForgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { email } = validated.data
  const user = getUserByEmail(email)

  if (!user) {
    return {
      message: 'No account found with that email address.',
    }
  }

  const token = randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  const resetId = randomUUID()

  try {
    createPasswordResetRow({
      id: resetId,
      email: user.email,
      token,
      expiresAt,
      createdAt: new Date().toISOString(),
    })
  } catch {
    return {
      message: 'Failed to generate reset link. Please try again.',
    }
  }

  return {
    success: true,
    message: 'Password reset link has been generated!',
    resetUrl: `/reset-password?token=${token}`,
  }
}

export async function resetPassword(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = ResetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { token, password } = validated.data
  const resetRow = getPasswordResetByToken(token)

  if (!resetRow) {
    return {
      message: 'Invalid or expired password reset token.',
    }
  }

  if (new Date(resetRow.expires_at) < new Date()) {
    deletePasswordResetRow(token)
    return {
      message: 'This password reset link has expired. Please request a new one.',
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  try {
    updateUserPassword(resetRow.email, passwordHash)
    deletePasswordResetRow(token)
  } catch {
    return {
      message: 'Failed to reset password. Please try again.',
    }
  }

  return {
    success: true,
    message: 'Your password has been successfully reset! You can now sign in with your new password.',
  }
}

export async function updateProfile(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { message: 'Unauthorized. Please sign in.' }
  }

  const validated = ProfileUpdateSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    bio: formData.get('bio'),
    timezone: formData.get('timezone'),
  })

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { name, email, bio, timezone } = validated.data

  const existing = getUserByEmail(email)
  if (existing && existing.id !== currentUser.id) {
    return {
      message: 'This email is already in use by another account.',
    }
  }

  try {
    updateUserProfileDb(currentUser.id, {
      name,
      email,
      bio: bio || null,
      timezone: timezone || 'UTC',
    })
  } catch {
    return {
      message: 'Failed to update profile.',
    }
  }

  revalidatePath('/profile')
  revalidatePath('/settings')

  return {
    success: true,
    message: 'Profile updated successfully!',
  }
}

export async function changePassword(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { message: 'Unauthorized. Please sign in.' }
  }

  const validated = ChangePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
  })

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { currentPassword, newPassword } = validated.data

  const userRow = getUserById(currentUser.id)
  if (!userRow) {
    return { message: 'User not found.' }
  }

  const matches = await bcrypt.compare(currentPassword, userRow.password_hash)
  if (!matches) {
    return {
      message: 'Incorrect current password.',
    }
  }

  const newHash = await bcrypt.hash(newPassword, 10)
  updateUserPassword(userRow.email, newHash)

  return {
    success: true,
    message: 'Password changed successfully!',
  }
}
