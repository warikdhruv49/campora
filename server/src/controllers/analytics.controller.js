import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/responses.js';
import { parseDateRange } from '../utils/pagination.js';
import * as analyticsService from '../services/analytics.service.js';
import { globalSearch } from '../services/transaction.service.js';

export const getMonthlyFlow = asyncHandler(async (req, res) => {
  const months = Math.min(24, Math.max(3, parseInt(req.query.months, 10) || 12));
  const data = await analyticsService.getMonthlyFlow(req.user.id, months);
  success(res, { data });
});

export const getSpendingByCategory = asyncHandler(async (req, res) => {
  const range = parseDateRange(req.query) || {};
  const data = await analyticsService.getSpendingByCategory(req.user.id, range);
  success(res, { data });
});

export const getAccountDistribution = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAccountDistribution(req.user.id);
  success(res, { data });
});

export const getCashFlowHistory = asyncHandler(async (req, res) => {
  const months = Math.min(24, Math.max(3, parseInt(req.query.months, 10) || 12));
  const data = await analyticsService.getCashFlowHistory(req.user.id, months);
  success(res, { data });
});

export const getInsights = asyncHandler(async (req, res) => {
  const data = await analyticsService.getInsights(req.user.id);
  success(res, { data: { insights: data } });
});

export const getTopExpenses = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 5));
  const data = await analyticsService.getTopExpenses(req.user.id, limit);
  success(res, { data: { expenses: data } });
});

export const search = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').slice(0, 100);
  const data = await globalSearch(req.user.id, q);
  success(res, { data });
});
