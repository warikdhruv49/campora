import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/', dashboardController.getDashboard);
router.get('/summary', dashboardController.getSummaryEndpoint);
router.get('/timeline', dashboardController.getTimeline);
router.get('/health', dashboardController.getHealth);

export default router;
