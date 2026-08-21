import { z } from 'zod';
import { TRANSACTION_TYPES } from './transaction.schema.js';

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a hex value like #4d8dff');

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(40),
  type: z.enum(TRANSACTION_TYPES),
  color: hexColor.default('#4d8dff'),
  icon: z.string().trim().max(40).optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryIdSchema = z.object({ id: z.string().min(1) });
