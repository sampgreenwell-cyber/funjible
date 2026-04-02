import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PublisherService } from '../services/publisherService';
import { logger } from '../utils/logger';

export class PublisherController {
  static async getPublishers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const publishers = await PublisherService.getPublishers();

      res.json({
        success: true,
        data: publishers
      });
    } catch (error: any) {
      logger.error('Get publishers error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get publishers'
      });
    }
  }

  static async getPublisherById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { publisherId } = req.params;
      const publisher = await PublisherService.getPublisherById(publisherId);

      if (!publisher) {
        res.status(404).json({
          success: false,
          error: 'Publisher not found'
        });
        return;
      }

      res.json({
        success: true,
        data: publisher
      });
    } catch (error: any) {
      logger.error('Get publisher error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get publisher'
      });
    }
  }

  static async getPublisherArticles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { publisherId } = req.params;
      const articles = await PublisherService.getPublisherArticles(publisherId);

      res.json({
        success: true,
        data: articles
      });
    } catch (error: any) {
      logger.error('Get publisher articles error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get publisher articles'
      });
    }
  }

  static async subscribe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { publisherId } = req.params;
      const { type, paymentMethodId } = req.body;

      const subscription = await PublisherService.subscribe(
        userId,
        publisherId,
        type,
        paymentMethodId
      );

      res.status(201).json({
        success: true,
        data: subscription
      });
    } catch (error: any) {
      logger.error('Subscribe error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to subscribe'
      });
    }
  }

  static async unsubscribe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { publisherId } = req.params;

      await PublisherService.unsubscribe(userId, publisherId);

      res.json({
        success: true,
        message: 'Unsubscribed successfully'
      });
    } catch (error: any) {
      logger.error('Unsubscribe error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to unsubscribe'
      });
    }
  }
}