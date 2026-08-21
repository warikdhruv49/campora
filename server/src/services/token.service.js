import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

export const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || null,
  googleId: user.googleId || null,
  emailVerified: !!user.emailVerified,
  currency: user.currency,
  studentType: user.studentType || null,
  monthlyMoney: user.monthlyMoney !== undefined && user.monthlyMoney !== null ? Number(user.monthlyMoney) : null,
  mainGoal: user.mainGoal || null,
  onboarded: !!user.onboarded,
  createdAt: user.createdAt,
});
