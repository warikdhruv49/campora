import { z } from 'zod';
import { TRANSACTION_TYPES } from './transaction.schema.js';

const money = z.coerce
  .number()
  .positive('Amount must be greater than zero')
  .finite()
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(String(v)), 'Max 2 decimal places');

export const FREQUENCIES = ['WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'];

export const createRecurringSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES),
    amount: money,
    accountId: z.string().min(1, 'Account is required'),
    categoryId: z.string().min(1).optional().nullable(),
    merchant: z.string().trim().max(80).optional().nullable(),
    description: z.string().trim().max(255).optional().nullable(),
    frequency: z.enum(FREQUENCIES).default('MONTHLY'),
    customDays: z.coerce.number().int().min(1).max(365).optional().nullable(),
    nextDate: z.coerce.date({ invalid_type_error: 'Enter a valid date' }),
    autoCreate: z.boolean().default(true),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.frequency === 'CUSTOM' && !data.customDays) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customDays'], message: 'Custom recurrence needs an interval in days' });
    }
    if (data.type !== 'EXPENSE' && data.type !== 'INCOME') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['type'], message: 'Recurring rules support income and expenses only' });
    }
  });

export const updateRecurringSchema = createRecurringSchema.innerType().partial();

export const recurringIdSchema = z.object({ id: z.string().min(1) });
