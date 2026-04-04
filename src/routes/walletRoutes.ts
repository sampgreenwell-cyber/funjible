import express from 'express';
import { WalletController } from '../controllers/walletController';
import { authenticate } from '../middleware/auth';
import { validate, addFundsSchema } from '../middleware/validation';

const router = express.Router();

// GET /api/wallet - Get wallet info (balance, stats)
router.get('/', authenticate, WalletController.getBalance);

// POST /api/wallet/add-funds - Add funds to wallet
router.post('/add-funds', authenticate, validate(addFundsSchema), WalletController.addFunds);

// GET /api/wallet/transactions - Get transaction history
router.get('/transactions', authenticate, WalletController.getTransactions);

// GET /api/wallet/analytics - Get spending analytics
router.get('/analytics', authenticate, WalletController.getAnalytics);

export default router;