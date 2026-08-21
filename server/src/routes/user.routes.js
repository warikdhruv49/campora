import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateProfileSchema, changePasswordSchema } from '../validation/auth.schema.js';

const router = Router();

router.use(authenticate);
router.get('/me', userController.getProfile);
router.patch('/me', validate({ body: updateProfileSchema }), userController.patchProfile);
router.patch('/password', validate({ body: changePasswordSchema }), userController.patchPassword);

export default router;
