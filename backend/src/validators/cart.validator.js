import { z } from 'zod';
import { objectId } from './common.js';

export const addToCartSchema = z.object({
  productId: objectId,
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(99),
});
