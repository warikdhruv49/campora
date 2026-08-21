import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export async function verifyGoogleCredential(credential) {
  if (!env.googleClientId) {
    throw ApiError.badRequest('Google sign-in is not configured on this server');
  }

  let payload;
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`tokeninfo responded ${res.status}`);
    payload = await res.json();
  } catch (err) {
    throw ApiError.unauthorized('Could not verify the Google credential. Please try again.');
  }

  if (payload.aud !== env.googleClientId) {
    throw ApiError.unauthorized('Google credential was issued for a different application');
  }
  if (!payload.exp || Number(payload.exp) * 1000 < Date.now()) {
    throw ApiError.unauthorized('Google credential has expired');
  }
  if (payload.email_verified !== 'true' && payload.email_verified !== true) {
    throw ApiError.unauthorized('Your Google account email is not verified. Verify it with Google first.');
  }
  if (!payload.sub || !payload.email) {
    throw ApiError.unauthorized('Google credential is missing required claims');
  }

  return {
    googleId: payload.sub,
    email: String(payload.email).toLowerCase(),
    name: payload.name || payload.email.split('@')[0],
    avatar: payload.picture || null,
    emailVerified: true,
  };
}
