import { Router } from 'express';
import * as recurringController from '../controllers/recurring.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { createRecurringSchema, updateRecurringSchema } from '../validation/recurring.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', recurringController.list);
router.post('/', validate({ body: createRecurringSchema }), recurringController.create);
router.post('/process-due', recurringController.processDue);
router.get('/:id', recurringController.getOne);
router.patch('/:id', validate({ body: updateRecurringSchema }), recurringController.update);
router.post('/:id/run', recurringController.runNow);
router.delete('/:id', recurringController.remove);

export default router;
