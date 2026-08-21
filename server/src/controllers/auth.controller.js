import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/responses.js';
import {
  registerUser,
  loginUser,
  loginOrRegisterGoogleUser,
  requestPasswordReset,
  resetPassword,
  verifyEmailToken,
  resendVerification,
} from '../services/user.service.js';
import { verifyGoogleCredential } from '../services/google.service.js';
import { publicUser, signToken } from '../services/token.service.js';
import { seedDefaultCategories } from '../services/category.service.js';

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);
  await seedDefaultCategories(user.id);
  success(res, {
    status: 201,
    message: 'Account created successfully',
    data: { user, token: signToken(user) },
  });
});

export const login = asyncHandler(async (req, res) => {
  const user = await loginUser(req.body);
  success(res, { message: 'Signed in successfully', data: { user, token: signToken(user) } });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const profile = await verifyGoogleCredential(req.body.credential);
  const { user, isNew } = await loginOrRegisterGoogleUser(profile);
  success(res, {
    message: isNew ? 'Account created with Google' : 'Signed in with Google',
    data: { user, token: signToken(user), isNew },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await requestPasswordReset(req.body.email);
  success(res, { message: 'If that email exists, a reset link has been generated', data: result });
});

export const resetPasswordConfirm = asyncHandler(async (req, res) => {
  await resetPassword(req.body.token, req.body.newPassword);
  success(res, { message: 'Password updated. You can now sign in.' });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await verifyEmailToken(req.body.token);
  success(res, { message: 'Email verified successfully', data: { user } });
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const result = await resendVerification(req.user.id);
  success(res, { message: 'Verification link generated', data: result });
});

export const logout = asyncHandler(async (req, res) => {
  success(res, { message: 'Signed out successfully' });
});

export const me = asyncHandler(async (req, res) => {
  success(res, { data: { user: publicUser(req.user) } });
});
