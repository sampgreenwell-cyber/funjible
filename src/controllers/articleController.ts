import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ArticleService } from '../services/articleService';
import { logger } from '../utils/logger';

export class ArticleController {
  static async purchaseArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { articleId, publisherId, amount } = req.body;
      const userId = req.userId!;

      const result = await ArticleService.purchaseArticle(
        userId,
        articleId,
        publisherId,
        amount
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Purchase article error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to purchase article'
      });
    }
  }

  static async getArticleAccess(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { articleId } = req.params;
      const userId = req.userId!;

      const access = await ArticleService.getArticleAccess(userId, articleId);

      if (!access) {
        res.status(404).json({
          success: false,
          error: 'Article not purchased or access expired'
        });
        return;
      }

      res.json({
        success: true,
        data: access
      });
    } catch (error: any) {
      logger.error('Get article access error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get article access'
      });
    }
  }

  static async getArticleMetadata(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { articleId } = req.params;

      const metadata = await ArticleService.getArticleMetadata(articleId);

      res.json({
        success: true,
        data: metadata
      });
    } catch (error: any) {
      logger.error('Get article metadata error:', error);
      res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }
  }

  static async verifyArticleAccess(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { articleId } = req.params;
      const userId = req.userId!;

      const hasAccess = await ArticleService.verifyArticleAccess(userId, articleId);

      res.json({
        success: true,
        data: { hasAccess }
      });
    } catch (error: any) {
      logger.error('Verify article access error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify article access'
      });
    }
  }
}