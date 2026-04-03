import express from 'express';
import { WalletController } from '../controllers/walletController';
import { authenticate } from '../middleware/auth';
import { validate, addFundsSchema } from '../middleware/validation';

const router = express.Router();

router.get('/balance', authenticate, WalletController.getBalance);
router.post('/fund', authenticate, validate(addFundsSchema), WalletController.addFunds);
router.get('/transactions', authenticate, WalletController.getTransactions);
router.get('/analytics', authenticate, WalletController.getAnalytics);

export default router;
