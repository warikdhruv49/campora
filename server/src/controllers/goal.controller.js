import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/responses.js';
import * as goalService from '../services/goal.service.js';

export const list = asyncHandler(async (req, res) => {
  success(res, { data: { goals: await goalService.listGoals(req.user.id, req.query) } });
});

export const getOne = asyncHandler(async (req, res) => {
  success(res, { data: await goalService.getGoal(req.user.id, req.params.id) });
});

export const create = asyncHandler(async (req, res) => {
  success(res, { status: 201, message: 'Goal created', data: await goalService.createGoal(req.user.id, req.body) });
});

export const update = asyncHandler(async (req, res) => {
  success(res, { message: 'Goal updated', data: await goalService.updateGoal(req.user.id, req.params.id, req.body) });
});

export const contribute = asyncHandler(async (req, res) => {
  success(res, {
    message: 'Contribution added',
    data: await goalService.contributeToGoal(req.user.id, req.params.id, req.body.amount),
  });
});

export const withdraw = asyncHandler(async (req, res) => {
  success(res, { message: 'Withdrawn from goal', data: await goalService.withdrawFromGoal(req.user.id, req.params.id, req.body.amount) });
});

export const remove = asyncHandler(async (req, res) => {
  await goalService.deleteGoal(req.user.id, req.params.id);
  success(res, { message: 'Goal deleted' });
});
