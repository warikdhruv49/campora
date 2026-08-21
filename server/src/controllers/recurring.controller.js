import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/responses.js';
import * as recurringService from '../services/recurring.service.js';

export const list = asyncHandler(async (req, res) => {
  success(res, { data: { rules: await recurringService.listRecurring(req.user.id) } });
});

export const getOne = asyncHandler(async (req, res) => {
  success(res, { data: await recurringService.getRecurring(req.user.id, req.params.id) });
});

export const create = asyncHandler(async (req, res) => {
  success(res, {
    status: 201,
    message: 'Recurring rule created',
    data: await recurringService.createRecurring(req.user.id, req.body),
  });
});

export const update = asyncHandler(async (req, res) => {
  success(res, {
    message: 'Recurring rule updated',
    data: await recurringService.updateRecurring(req.user.id, req.params.id, req.body),
  });
});

export const runNow = asyncHandler(async (req, res) => {
  success(res, { message: 'Transaction created', data: await recurringService.runRuleNow(req.user.id, req.params.id) });
});

export const processDue = asyncHandler(async (req, res) => {
  const created = await recurringService.processDueRules(req.user.id);
  success(res, { message: `${created} transaction(s) generated`, data: { created } });
});

export const remove = asyncHandler(async (req, res) => {
  await recurringService.deleteRecurring(req.user.id, req.params.id);
  success(res, { message: 'Recurring rule deleted' });
});
