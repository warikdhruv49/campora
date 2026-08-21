import { Router } from 'express';
import * as goalController from '../controllers/goal.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { createGoalSchema, updateGoalSchema, contributeGoalSchema } from '../validation/goal.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', goalController.list);
router.post('/', validate({ body: createGoalSchema }), goalController.create);
router.get('/:id', goalController.getOne);
router.patch('/:id', validate({ body: updateGoalSchema }), goalController.update);
router.post('/:id/contribute', validate({ body: contributeGoalSchema }), goalController.contribute);
router.post('/:id/withdraw', validate({ body: contributeGoalSchema }), goalController.withdraw);
router.delete('/:id', goalController.remove);

export default router;
