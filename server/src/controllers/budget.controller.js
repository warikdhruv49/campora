import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/responses.js';
import {
  getBudgetOverview,
  setOverallBudget,
  upsertCategoryBudget,
  updateCategoryBudget,
  deleteCategoryBudget,
} from '../services/budget.service.js';

export const overview = asyncHandler(async (req, res) => {
  success(res, { data: await getBudgetOverview(req.user.id) });
});

export const setOverall = asyncHandler(async (req, res) => {
  success(res, { message: 'Monthly budget updated', data: await setOverallBudget(req.user.id, req.body.amount) });
});

export const upsert = asyncHandler(async (req, res) => {
  const result = await upsertCategoryBudget(req.user.id, req.body.categoryId, req.body.amount);
  success(res, { status: result.created ? 201 : 200, message: 'Budget saved', data: result });
});

export const update = asyncHandler(async (req, res) => {
  success(res, { message: 'Budget updated', data: await updateCategoryBudget(req.user.id, req.params.id, req.body.amount) });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteCategoryBudget(req.user.id, req.params.id);
  success(res, { message: 'Budget removed' });
});
