import { z } from 'zod'

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .trim(),
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long.' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .trim(),
})

export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z.string().min(1, { message: 'Password is required.' }),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }).trim(),
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required.' }),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long.' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .trim(),
})

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }).trim(),
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  bio: z.string().optional(),
  timezone: z.string().optional(),
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required.' }),
  newPassword: z
    .string()
    .min(8, { message: 'Be at least 8 characters long.' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .trim(),
})

export type FormState =
  | {
      errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
        currentPassword?: string[]
        newPassword?: string[]
        token?: string[]
      }
      message?: string
      resetUrl?: string
      success?: boolean
    }
  | undefined

export type SessionPayload = {
  sessionId: string
  userId: string
  expiresAt: string
}

export type AuthUser = {
  id: string
  name: string
  email: string
  bio?: string | null
  timezone?: string | null
  created_at?: string
}
