import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/monthly', analyticsController.getMonthlyFlow);
router.get('/categories', analyticsController.getSpendingByCategory);
router.get('/accounts', analyticsController.getAccountDistribution);
router.get('/cash-flow', analyticsController.getCashFlowHistory);
router.get('/insights', analyticsController.getInsights);
router.get('/top-expenses', analyticsController.getTopExpenses);
router.get('/search', analyticsController.search);

export default router;
