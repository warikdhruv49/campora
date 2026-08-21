import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/responses.js';
import * as dashboardService from '../services/dashboard.service.js';
import { buildNetWorthTimeline } from '../services/transaction.service.js';

const RANGES = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

export const getDashboard = asyncHandler(async (req, res) => {
  const range = RANGES.includes(req.query.range) ? req.query.range : '1M';
  const data = await dashboardService.getDashboard(req.user.id, range);
  success(res, { data });
});

export const getSummaryEndpoint = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardSummary(req.user.id);
  success(res, { data });
});

export const getTimeline = asyncHandler(async (req, res) => {
  const range = RANGES.includes(req.query.range) ? req.query.range : '1M';
  const days = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 182, '1Y': 365, ALL: 730 }[range];
  const timeline = await buildNetWorthTimeline(req.user.id, days);
  success(res, { data: timeline.points });
});

export const getHealth = asyncHandler(async (req, res) => {
  const health = await dashboardService.getHealth(req.user.id);
  success(res, { data: health });
});
