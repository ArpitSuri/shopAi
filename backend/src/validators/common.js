import { z } from 'zod';

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
export const emailField = z.string().trim().toLowerCase().email('Enter a valid email');
