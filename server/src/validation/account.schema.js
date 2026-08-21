import { z } from 'zod';

export const ACCOUNT_TYPES = [
  'CHECKING',
  'SAVINGS',
  'CASH',
  'CREDIT_CARD',
  'INVESTMENT',
  'DIGITAL_WALLET',
  'OTHER',
];

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a hex value like #00d492');

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, 'Account name is required').max(50),
  type: z.enum(ACCOUNT_TYPES),
  institution: z.string().trim().max(80).optional().nullable(),
  balance: z.coerce
    .number()
    .finite('Balance must be a number')
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(String(v)), 'Max 2 decimal places'),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR'),
  color: hexColor.default('#00d492'),
  isActive: z.boolean().default(true),
});

export const updateAccountSchema = createAccountSchema.partial();

export const accountIdSchema = z.object({ id: z.string().min(1) });
