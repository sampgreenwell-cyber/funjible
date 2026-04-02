import express from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/articles', authenticate, UserController.getPurchasedArticles);
router.get('/history', authenticate, UserController.getReadingHistory);
router.get('/analytics', authenticate, UserController.getSpendingAnalytics);
router.put('/profile', authenticate, UserController.updateProfile);
router.get('/subscriptions', authenticate, UserController.getSubscriptions);

export default router;