import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72)
    .regex(/[a-zA-Z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const googleSchema = z.object({
  credential: z.string().min(50, 'Invalid Google credential'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Invalid reset token'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(72)
    .regex(/[a-zA-Z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(10, 'Invalid verification token'),
});

export const STUDENT_TYPES = ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'WORKING_STUDENT', 'OTHER'];
export const MAIN_GOALS = ['SAVE_MONEY', 'CONTROL_SPENDING', 'TRACK_EXPENSES', 'EMERGENCY_FUND', 'SAVE_FOR_SOMETHING'];

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60).optional(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
  avatar: z.string().trim().url('Avatar must be a valid URL').max(500).optional().nullable(),
  studentType: z.enum(STUDENT_TYPES).optional().nullable(),
  monthlyMoney: z.coerce.number().min(0).max(10000000).optional().nullable(),
  mainGoal: z.enum(MAIN_GOALS).optional().nullable(),
  onboarded: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(72)
    .regex(/[a-zA-Z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});
