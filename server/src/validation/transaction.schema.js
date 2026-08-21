import { z } from 'zod';

export const TRANSACTION_TYPES = ['INCOME', 'EXPENSE', 'TRANSFER'];
export const TRANSACTION_STATUSES = ['PENDING', 'COMPLETED', 'CANCELLED'];

const twoDecimals = (value) => /^\d+(\.\d{1,2})?$/.test(String(value));

const amount = z.coerce
  .number()
  .positive('Amount must be greater than zero')
  .finite('Amount must be a number')
  .refine(twoDecimals, 'Amount supports max 2 decimal places');

export const createTransactionSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES),
    amount,
    accountId: z.string().min(1, 'Account is required'),
    transferAccountId: z.string().min(1).optional().nullable(),
    categoryId: z.string().min(1).optional().nullable(),
    merchant: z.string().trim().max(80).optional().nullable(),
    description: z.string().trim().max(255).optional().nullable(),
    reference: z.string().trim().max(60).optional().nullable(),
    status: z.enum(TRANSACTION_STATUSES).default('COMPLETED'),
    transactionDate: z.coerce.date({ invalid_type_error: 'Enter a valid date' }),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'TRANSFER') {
      if (!data.transferAccountId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['transferAccountId'], message: 'Destination account is required for transfers' });
      } else if (data.transferAccountId === data.accountId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['transferAccountId'], message: 'Destination account must differ from source account' });
      }
      if (data.categoryId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['categoryId'], message: 'Transfers cannot have a category' });
      }
    } else if (!data.categoryId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['categoryId'], message: 'Category is required' });
    }
  });

export const updateTransactionSchema = createTransactionSchema.innerType().partial();

export const listTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  type: z.enum(TRANSACTION_TYPES).optional(),
  status: z.enum(TRANSACTION_STATUSES).optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['transactionDate', 'amount', 'merchant', 'createdAt']).default('transactionDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const transactionIdSchema = z.object({ id: z.string().min(1) });
