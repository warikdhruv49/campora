import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  googleSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validation/auth.schema.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/google', validate({ body: googleSchema }), authController.googleLogin);
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', validate({ body: resetPasswordSchema }), authController.resetPasswordConfirm);
router.post('/verify-email', validate({ body: verifyEmailSchema }), authController.verifyEmail);
router.post('/resend-verification', authenticate, authController.resendVerificationEmail);
router.post('/logout', authController.logout);

export default router;
