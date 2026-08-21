import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsQuerySchema,
  transactionIdSchema,
} from '../validation/transaction.schema.js';

const router = Router();

router.use(authenticate);
router.get(
  '/',
  validate({ query: listTransactionsQuerySchema }),
  transactionController.getTransactions
);
router.post('/', validate({ body: createTransactionSchema }), transactionController.createTransaction);
router.get('/:id', validate({ params: transactionIdSchema }), transactionController.getTransaction);
router.patch(
  '/:id',
  validate({ params: transactionIdSchema, body: updateTransactionSchema }),
  transactionController.updateTransaction
);
router.delete('/:id', validate({ params: transactionIdSchema }), transactionController.deleteTransaction);

export default router;
