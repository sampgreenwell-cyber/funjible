import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { WalletService } from '../services/walletService';
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
      const { amount, paymentMethodId } = req.body;
      const userId = req.userId!;

      const result = await WalletService.addFunds(userId, amount, paymentMethodId);

      res.json({
        success: true,
        data: result
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