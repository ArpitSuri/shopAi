import Otp from '../models/Otp.js';
import { OTP_MAX_ATTEMPTS } from '../config/constants.js';
import { generateOtp, hashOtp } from '../utils/otp.js';
import { ApiError } from '../utils/ApiError.js';

// Creates a new OTP and returns it. No email is sent: the code is printed in the
// server console and the controllers return it to the client (demo mode).
export const sendOtp = async (email, purpose = 'signup') => {
  const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES) || 10;

  await Otp.deleteMany({ email, purpose });

  const otp = generateOtp();
  await Otp.create({
    email,
    purpose,
    otpHash: hashOtp(otp),
    expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
  });

  console.log(`[OTP] ${email} -> ${otp} (valid ${expiryMinutes} min)`);
  return otp;
};

// Throws if the OTP is wrong / expired; deletes it on success (single use)
export const checkOtp = async (email, otp, purpose = 'signup') => {
  const record = await Otp.findOne({ email, purpose });
  if (!record) throw new ApiError(400, 'OTP expired or not found. Please request a new one.');

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await record.deleteOne();
    throw new ApiError(429, 'Too many wrong attempts. Please request a new OTP.');
  }

  if (record.otpHash !== hashOtp(otp)) {
    record.attempts += 1;
    await record.save();
    throw new ApiError(400, 'Incorrect OTP');
  }

  await record.deleteOne();
};
