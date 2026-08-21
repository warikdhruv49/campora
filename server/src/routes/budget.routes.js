import { Router } from 'express';
import * as budgetController from '../controllers/budget.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upsertBudgetSchema, updateBudgetSchema, overallBudgetSchema } from '../validation/budget.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', budgetController.overview);
router.put('/overall', validate({ body: overallBudgetSchema }), budgetController.setOverall);
router.post('/', validate({ body: upsertBudgetSchema }), budgetController.upsert);
router.patch('/:id', validate({ body: updateBudgetSchema }), budgetController.update);
router.delete('/:id', budgetController.remove);

export default router;
