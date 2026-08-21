import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/responses.js';
import * as categoryService from '../services/category.service.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories(req.user.id);
  success(res, { data: categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.user.id, req.body);
  success(res, { status: 201, message: 'Category created', data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.user.id, req.validatedParams.id, req.body);
  success(res, { message: 'Category updated', data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.user.id, req.validatedParams.id);
  success(res, { message: 'Category deleted' });
});
