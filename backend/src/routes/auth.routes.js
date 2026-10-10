import { Router } from 'express';
import { signup, verifyOtp, resendOtp, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { authLimiter, otpLimiter, resendOtpLimiter } from '../middlewares/rateLimiter.js';
import { signupSchema, verifyOtpSchema, resendOtpSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), verifyOtp);
router.post('/resend-otp', resendOtpLimiter, validate(resendOtpSchema), resendOtp);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', protect, getMe);

export default router;
