import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/responses.js';
import * as accountService from '../services/account.service.js';

export const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await accountService.listAccounts(req.user.id);
  success(res, { data: accounts });
});

export const getAccount = asyncHandler(async (req, res) => {
  const account = await accountService.getAccount(req.user.id, req.validatedParams.id);
  success(res, { data: account });
});

export const getAccountStats = asyncHandler(async (req, res) => {
  const stats = await accountService.getAccountStats(req.user.id, req.validatedParams.id);
  success(res, { data: stats });
});

export const createAccount = asyncHandler(async (req, res) => {
  const account = await accountService.createAccount(req.user.id, req.body);
  success(res, { status: 201, message: 'Account created', data: account });
});

export const updateAccount = asyncHandler(async (req, res) => {
  const account = await accountService.updateAccount(req.user.id, req.validatedParams.id, req.body);
  success(res, { message: 'Account updated', data: account });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await accountService.deleteAccount(req.user.id, req.validatedParams.id);
  success(res, { message: 'Account deleted' });
});
