import { Router } from 'express';
import * as accountController from '../controllers/account.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createAccountSchema,
  updateAccountSchema,
  accountIdSchema,
} from '../validation/account.schema.js';

const router = Router();

router.use(authenticate);
router.get('/', accountController.getAccounts);
router.post('/', validate({ body: createAccountSchema }), accountController.createAccount);
router.get('/:id', validate({ params: accountIdSchema }), accountController.getAccount);
router.get('/:id/stats', validate({ params: accountIdSchema }), accountController.getAccountStats);
router.patch('/:id', validate({ params: accountIdSchema, body: updateAccountSchema }), accountController.updateAccount);
router.delete('/:id', validate({ params: accountIdSchema }), accountController.deleteAccount);

export default router;
