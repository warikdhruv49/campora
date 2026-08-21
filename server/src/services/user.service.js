import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { publicUser } from './token.service.js';
import { issueAuthToken, consumeAuthToken } from './email-token.service.js';
import { env } from '../config/env.js';

const SALT_ROUNDS = 12;

export const registerUser = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  return publicUser(user);
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw ApiError.unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  return publicUser(user);
};

export const loginOrRegisterGoogleUser = async (profile) => {
  let user = await prisma.user.findUnique({ where: { googleId: profile.googleId } });

  if (!user) {
    user = await prisma.user.findUnique({ where: { email: profile.email } });
    if (user) {
      if (user.passwordHash === null || user.googleId === null) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.googleId, avatar: profile.avatar, emailVerified: true },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          googleId: profile.googleId,
          avatar: profile.avatar,
          emailVerified: true,
        },
      });
      await seedCategoriesForNewUser(user.id);
      return { user: publicUser(user), isNew: true };
    }
  }

  if (user.avatar !== profile.avatar && profile.avatar) {
    user = await prisma.user.update({ where: { id: user.id }, data: { avatar: profile.avatar } });
  }
  return { user: publicUser(user), isNew: false };
};

async function seedCategoriesForNewUser(userId) {
  const { seedDefaultCategories } = await import('./category.service.js');
  await seedDefaultCategories(userId);
}

export const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return { sent: false };
  }
  const raw = await issueAuthToken(user.id, 'PASSWORD_RESET');
  const resetUrl = `${env.appUrl}/reset-password?token=${raw}`;
  if (env.isProd) {
    console.log(`[email] Password reset for ${email}: ${resetUrl}`);
    return { sent: true };
  }
  return { sent: true, devResetUrl: resetUrl };
};

export const resetPassword = async (rawToken, newPassword) => {
  const token = await consumeAuthToken(rawToken, 'PASSWORD_RESET');
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: token.userId }, data: { passwordHash } });
};

export const verifyEmailToken = async (rawToken) => {
  const token = await consumeAuthToken(rawToken, 'VERIFY_EMAIL');
  const user = await prisma.user.update({ where: { id: token.userId }, data: { emailVerified: true } });
  return publicUser(user);
};

export const resendVerification = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('Account not found');
  if (user.emailVerified) return { alreadyVerified: true };
  const raw = await issueAuthToken(user.id, 'VERIFY_EMAIL');
  const verifyUrl = `${env.appUrl}/verify-email?token=${raw}`;
  if (env.isProd) {
    console.log(`[email] Verification for ${user.email}: ${verifyUrl}`);
    return { sent: true };
  }
  return { sent: true, devVerifyUrl: verifyUrl };
};

export const updateProfile = async (userId, data) => {
  const payload = { ...data };
  if ('monthlyMoney' in payload && payload.monthlyMoney !== null) {
    payload.monthlyMoney = payload.monthlyMoney === undefined ? undefined : Number(payload.monthlyMoney.toFixed(2));
  }
  const user = await prisma.user.update({ where: { id: userId }, data: payload });
  return publicUser(user);
};

export const changePassword = async (user, currentPassword, newPassword) => {
  const full = await prisma.user.findUnique({ where: { id: user.id } });
  if (!full.passwordHash) throw ApiError.badRequest('This account uses Google sign-in and has no password set');
  const valid = await bcrypt.compare(currentPassword, full.passwordHash);
  if (!valid) throw ApiError.badRequest('Current password is incorrect');

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
};
