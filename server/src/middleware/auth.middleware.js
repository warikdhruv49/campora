import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized('Authentication required');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw ApiError.unauthorized('Session expired, please sign in again');
    throw ApiError.unauthorized('Invalid authentication token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      googleId: true,
      emailVerified: true,
      currency: true,
      studentType: true,
      monthlyMoney: true,
      mainGoal: true,
      onboarded: true,
      createdAt: true,
    },
  });
  if (!user) throw ApiError.unauthorized('Account no longer exists');

  req.user = {
    ...user,
    monthlyMoney: user.monthlyMoney !== null ? Number(user.monthlyMoney) : null,
    emailVerified: !!user.emailVerified,
    onboarded: !!user.onboarded,
  };
  next();
});
