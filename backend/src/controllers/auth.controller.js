import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/token.js';
import { sendOtp, checkOtp } from '../services/otp.service.js';

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

// Demo mode: with no email delivery, the OTP is returned so the UI can show it.
// Automatically disabled when NODE_ENV=production.
const exposeOtp = (otp) => (process.env.NODE_ENV === 'production' ? {} : { devOtp: otp });

// POST /api/auth/signup  -> creates (unverified) user and generates an OTP
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user?.isVerified) throw new ApiError(409, 'This email is already registered. Please log in.');

  if (user) {
    // Unverified account trying again: update details and make a new OTP
    user.name = name;
    user.password = password;
    await user.save();
  } else {
    user = await User.create({ name, email, password }); // role is always "user"
  }

  const otp = await sendOtp(email);
  res.status(201).json({ success: true, message: 'Your verification code is ready', email, ...exposeOtp(otp) });
});

// POST /api/auth/verify-otp  -> verifies the account and logs the user in
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'No account found for this email');
  if (user.isVerified) throw new ApiError(400, 'Account is already verified. Please log in.');

  await checkOtp(email, otp);

  user.isVerified = true;
  await user.save();

  res.json({ success: true, token: signToken(user._id), user: publicUser(user) });
});

// POST /api/auth/resend-otp
export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  let otp;
  if (user && !user.isVerified) otp = await sendOtp(email);

  // Same shape either way so accounts can't be probed
  res.json({ success: true, message: 'A new code has been generated', ...(otp && exposeOtp(otp)) });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Incorrect email or password');
  }

  if (!user.isVerified) {
    throw new ApiError(403, 'Please verify your account first.', 'NOT_VERIFIED');
  }

  res.json({ success: true, token: signToken(user._id), user: publicUser(user) });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});
