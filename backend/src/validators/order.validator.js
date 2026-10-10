import { z } from 'zod';
import { ORDER_STATUS } from '../config/constants.js';

const required = (label) => z.string().trim().min(1, `${label} is required`).max(200);

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: required('Full name'),
    phone: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, 'Enter a valid phone number'),
    address: required('Address'),
    city: required('City'),
    postalCode: required('Postal code'),
  }),
  paymentMethod: z.enum(['COD']).default('COD'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(Object.values(ORDER_STATUS)),
});
