import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const TOKEN_TTL_MS = {
  VERIFY_EMAIL: 24 * 60 * 60 * 1000,
  PASSWORD_RESET: 60 * 60 * 1000,
};

export async function issueAuthToken(userId, kind) {
  const raw = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  await prisma.authToken.create({
    data: {
      userId,
      kind,
      tokenHash,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS[kind]),
    },
  });
  return raw;
}

export async function consumeAuthToken(raw, kind) {
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  const token = await prisma.authToken.findUnique({ where: { tokenHash } });
  if (!token || token.kind !== kind) throw ApiError.badRequest('This link is invalid');
  if (token.usedAt) throw ApiError.badRequest('This link has already been used');
  if (token.expiresAt < new Date()) throw ApiError.badRequest('This link has expired. Please request a new one.');

  await prisma.authToken.update({ where: { id: token.id }, data: { usedAt: new Date() } });
  return token;
}
