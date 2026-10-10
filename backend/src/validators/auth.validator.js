import { z } from 'zod';
import { emailField } from './common.js';

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  email: emailField,
  password: z.string().min(6, 'Password must be at least 6 characters').max(64),
});

export const verifyOtpSchema = z.object({
  email: emailField,
  otp: z.string().trim().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

export const resendOtpSchema = z.object({ email: emailField });

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});
