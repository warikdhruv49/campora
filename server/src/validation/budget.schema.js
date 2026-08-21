import { z } from 'zod';

const money = z.coerce
  .number()
  .positive('Amount must be greater than zero')
  .finite()
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(String(v)), 'Max 2 decimal places');

export const upsertBudgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: money,
});

export const updateBudgetSchema = z.object({
  amount: money,
});

export const overallBudgetSchema = z.object({
  amount: z.coerce.number().min(0, 'Amount must be zero or more').max(10000000).refine(
    (v) => /^\d+(\.\d{1,2})?$/.test(String(v)),
    'Max 2 decimal places'
  ),
});

export const budgetIdSchema = z.object({ id: z.string().min(1) });
