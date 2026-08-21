import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} from '../validation/category.schema.js';

const router = Router();

router.use(authenticate);
router.get('/', categoryController.getCategories);
router.post('/', validate({ body: createCategorySchema }), categoryController.createCategory);
router.patch('/:id', validate({ params: categoryIdSchema, body: updateCategorySchema }), categoryController.updateCategory);
router.delete('/:id', validate({ params: categoryIdSchema }), categoryController.deleteCategory);

export default router;
