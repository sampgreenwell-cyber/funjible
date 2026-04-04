import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { WalletService } from '../services/walletService';
import { User } from '../models/UserModel';
import { logger } from '../utils/logger';

export class WalletController {
  static async getBalance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const balance = await WalletService.getBalance(userId);

      res.json({
        success: true,
        data: balance
      });
    } catch (error: any) {
      logger.error('Get balance error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get wallet balance'
      });
    }
  }

static async addFunds(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { amount } = req.body;
    const userId = req.userId!;

    // Validate amount
    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
      return;
    }

    if (amount < 5) {
      res.status(400).json({
        success: false,
        error: 'Minimum amount is $5.00'
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // For demo: just add funds directly without payment processing
    user.wallet.balance += amount;
    user.wallet.transactions.push({
      type: 'DEPOSIT',
      amount,
      timestamp: new Date(),
      status: 'COMPLETED',
      description: `Added $${amount} to wallet`
    });

    await user.save();

    logger.info(`Funds added to wallet: $${amount} for user ${userId}`);

    res.json({
      success: true,
      data: {
        balance: user.wallet.balance,
        amount,
        timestamp: new Date()
      }
    });
  } catch (error: any) {
    logger.error('Add funds error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to add funds'
    });
  }
}

  static async getTransactions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { page = 1, limit = 20 } = req.query;

      const transactions = await WalletService.getTransactions(
        userId,
        Number(page),
        Number(limit)
      );

      res.json({
        success: true,
        data: transactions
      });
    } catch (error: any) {
      logger.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get transactions'
      });
    }
  }

  static async getAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { timeframe = 'month' } = req.query;

      const analytics = await WalletService.getAnalytics(userId, timeframe as string);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      logger.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get wallet analytics'
      });
    }
  }
}
