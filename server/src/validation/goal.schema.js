import { z } from 'zod';

const money = z.coerce
  .number()
  .positive('Amount must be greater than zero')
  .finite()
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(String(v)), 'Max 2 decimal places');

export const createGoalSchema = z.object({
  name: z.string().trim().min(1, 'Goal name is required').max(60),
  targetAmount: money,
  savedAmount: z.coerce.number().min(0).default(0),
  targetDate: z.coerce.date().optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#00d492'),
});

export const updateGoalSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  targetAmount: money.optional(),
  targetDate: z.coerce.date().optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  isArchived: z.boolean().optional(),
});

export const contributeGoalSchema = z.object({
  amount: money,
});

export const goalIdSchema = z.object({ id: z.string().min(1) });
