import express from 'express';
import { AuthController } from '../controllers/authController';
import { validate, registerSchema, loginSchema } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', authenticate, AuthController.getCurrentUser);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);

export default router;