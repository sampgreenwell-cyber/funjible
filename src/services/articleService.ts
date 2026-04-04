import { User } from '../models/UserModel';
import { Publisher } from '../models/Publisher';
import { Transaction } from '../models/Transaction';
import { PublisherIntegration } from './publisherIntegration';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export class ArticleService {
static async purchaseArticle(
  userId: string,
  articleId: string,
  publisherId: string,
  amount: number
): Promise<any> {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    const publisher = await Publisher.findById(publisherId);
    if (!publisher || !publisher.active) {
      throw new Error('Publisher not found or inactive');
    }

    const alreadyPurchased = user.purchasedArticles.some(
      article => article.articleId === articleId
    );

    if (alreadyPurchased) {
      throw new Error('Article already purchased');
    }

    // Deduct from wallet
    user.wallet.balance -= amount;
    // Track total spent
if (!user.wallet.totalSpent) {
  user.wallet.totalSpent = 0;
}
user.wallet.totalSpent += amount;

// Track articles purchased count
if (!user.wallet.articlesPurchased) {
  user.wallet.articlesPurchased = 0;
}
user.wallet.articlesPurchased += 1;

    // Add transaction
    user.wallet.transactions.push({
      type: 'PURCHASE',
      amount: -amount,
      timestamp: new Date(),
      status: 'COMPLETED',
      description: `Article purchase: ${articleId}`
    });

    // Add to purchased articles
    user.purchasedArticles.push({
      articleId,
      publisherId,
      title: 'Article Title',
      price: amount,
      purchaseDate: new Date(),
      accessToken: `access_${Date.now()}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await user.save();

    logger.info(`Article purchased: ${articleId} by user ${userId}`);

    return {
      success: true,
      accessToken: `access_${Date.now()}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      balance: user.wallet.balance
    };
  } catch (error: any) {
    logger.error('Purchase article error:', error);
    throw error;
  }
}

  static async getArticleAccess(userId: string, articleId: string): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const purchasedArticle = user.purchasedArticles.find(
        article => article.articleId === articleId
      );

      if (!purchasedArticle) {
        return null;
      }

      if (new Date() > purchasedArticle.expiresAt) {
        return null;
      }

      return {
        articleId: purchasedArticle.articleId,
        accessToken: purchasedArticle.accessToken,
        expiresAt: purchasedArticle.expiresAt
      };
    } catch (error: any) {
      logger.error('Get article access error:', error);
      throw error;
    }
  }

  static async getArticleMetadata(articleId: string): Promise<any> {
    try {
      return {
        articleId,
        title: 'Sample Article Title',
        author: 'John Doe',
        publishDate: new Date(),
        price: 0.75,
        publisher: 'Sample Publisher'
      };
    } catch (error: any) {
      logger.error('Get article metadata error:', error);
      throw error;
    }
  }

  static async verifyArticleAccess(userId: string, articleId: string): Promise<boolean> {
    try {
      const access = await this.getArticleAccess(userId, articleId);
      return access !== null;
    } catch (error: any) {
      logger.error('Verify article access error:', error);
      return false;
    }
  }
}