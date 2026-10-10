import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Verifies the JWT and attaches the user to req.user
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new ApiError(401, 'Please log in to continue');

  let decoded;
  try {
    decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Session expired. Please log in again');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isVerified) throw new ApiError(401, 'Account not found. Please log in again');

  req.user = user;
  next();
});

// Role-based access: authorize('admin') or authorize('user', 'admin')
export const authorize =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : next(new ApiError(403, 'You do not have permission to do this'));
