import { z } from 'zod';
import { objectId } from './common.js';

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  description: z.string().trim().max(2000).optional(),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  stock: z.coerce.number().int('Stock must be a whole number').min(0),
  image: z.string().trim().url('Image must be a valid URL').or(z.literal('')).optional(),
  category: objectId,
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();
