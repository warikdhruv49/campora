import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/responses.js';
import * as transactionService from '../services/transaction.service.js';

export const getTransactions = asyncHandler(async (req, res) => {
  const { items, meta } = await transactionService.listTransactions(req.user.id, req.validatedQuery);
  success(res, { data: items, meta, message: 'Transactions retrieved' });
});

export const getTransaction = asyncHandler(async (req, res) => {
  const txn = await transactionService.getTransaction(req.user.id, req.validatedParams.id);
  success(res, { data: txn });
});

export const createTransaction = asyncHandler(async (req, res) => {
  const txn = await transactionService.createTransaction(req.user.id, req.body);
  success(res, { status: 201, message: 'Transaction recorded', data: txn });
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const txn = await transactionService.updateTransaction(req.user.id, req.validatedParams.id, req.body);
  success(res, { message: 'Transaction updated', data: txn });
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  await transactionService.deleteTransaction(req.user.id, req.validatedParams.id);
  success(res, { message: 'Transaction deleted' });
});
