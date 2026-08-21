import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/responses.js';
import { changePassword, updateProfile } from '../services/user.service.js';

export const getProfile = asyncHandler(async (req, res) => {
  success(res, { data: { user: req.user } });
});

export const patchProfile = asyncHandler(async (req, res) => {
  const user = await updateProfile(req.user.id, req.body);
  success(res, { message: 'Profile updated', data: { user } });
});

export const patchPassword = asyncHandler(async (req, res) => {
  await changePassword(req.user, req.body.currentPassword, req.body.newPassword);
  success(res, { message: 'Password changed successfully' });
});
