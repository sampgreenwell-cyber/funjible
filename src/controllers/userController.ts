import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserService } from '../services/userService';
import { logger } from '../utils/logger';

export class UserController {
  static async getPurchasedArticles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { page = 1, limit = 20 } = req.query;

      const articles = await UserService.getPurchasedArticles(
        userId,
        Number(page),
        Number(limit)
      );

      res.json({
        success: true,
        data: articles
      });
    } catch (error: any) {
      logger.error('Get purchased articles error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get purchased articles'
      });
    }
  }

  static async getReadingHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const history = await UserService.getReadingHistory(userId);

      res.json({
        success: true,
        data: history
      });
    } catch (error: any) {
      logger.error('Get reading history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get reading history'
      });
    }
  }

  static async getSpendingAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { timeframe = 'month' } = req.query;

      const analytics = await UserService.getSpendingAnalytics(userId, timeframe as string);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      logger.error('Get spending analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get spending analytics'
      });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const updates = req.body;

      const user = await UserService.updateProfile(userId, updates);

      res.json({
        success: true,
        data: { user }
      });
    } catch (error: any) {
      logger.error('Update profile error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  static async getSubscriptions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const subscriptions = await UserService.getSubscriptions(userId);

      res.json({
        success: true,
        data: subscriptions
      });
    } catch (error: any) {
      logger.error('Get subscriptions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subscriptions'
      });
    }
  }
}
