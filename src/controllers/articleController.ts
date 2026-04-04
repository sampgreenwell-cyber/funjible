import { Article } from '../models/Article';
import { User } from '../models/UserModel';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ArticleService } from '../services/articleService';
import { logger } from '../utils/logger';

export class ArticleController {
static async purchaseArticle(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Get article ID from URL params OR body (support both routes)
    const articleId = req.params.id || req.body.articleId;
    const userId = req.userId!;

    if (!articleId) {
      res.status(400).json({
        success: false,
        error: 'Article ID is required'
      });
      return;
    }

    // Fetch the article to get publisher and price
    const article = await Article.findById(articleId);
    if (!article) {
      res.status(404).json({
        success: false,
        error: 'Article not found'
      });
      return;
    }

    // Use article's publisher and price
    const publisherId = article.publisher.toString();
    const amount = article.price;

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

  static async getArticles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { limit = 50, publisher, search } = req.query;
    
    const query: any = { active: true };
    
    if (publisher) {
      query.publisher = publisher;
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    const articles = await Article.find(query)
      .populate('publisher', 'name logoUrl')
      .sort({ publishedAt: -1 })
      .limit(Number(limit));
    
    res.json({
      success: true,
      data: articles
    });
  } catch (error: any) {
    logger.error('Get articles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get articles'
    });
  }
}

static async getArticle(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    const article = await Article.findById(id).populate('publisher', 'name logoUrl');
    
    if (!article) {
      res.status(404).json({
        success: false,
        error: 'Article not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: article
    });
  } catch (error: any) {
    logger.error('Get article error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get article'
    });
  }
}

static async getPurchasedArticles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }
    
    const purchasedArticleIds = user.purchasedArticles.map(a => a.articleId);
    
    const articles = await Article.find({
      _id: { $in: purchasedArticleIds }
    }).populate('publisher', 'name logoUrl');
    
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
}
