import rateLimit from 'express-rate-limit';

const createLimiter = ({ windowMs, limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

const MIN = 60 * 1000;

// Applied to every /api request
export const apiLimiter = createLimiter({
  windowMs: 15 * MIN,
  limit: 300,
  message: 'Too many requests. Please try again in a few minutes.',
});

// Login / signup (brute-force protection)
export const authLimiter = createLimiter({
  windowMs: 15 * MIN,
  limit: 20,
  message: 'Too many attempts. Please try again in 15 minutes.',
});

// OTP verification
export const otpLimiter = createLimiter({
  windowMs: 10 * MIN,
  limit: 10,
  message: 'Too many OTP attempts. Please wait 10 minutes.',
});

// Requesting a new OTP email
export const resendOtpLimiter = createLimiter({
  windowMs: 10 * MIN,
  limit: 3,
  message: 'You can request a new OTP only 3 times every 10 minutes.',
});
