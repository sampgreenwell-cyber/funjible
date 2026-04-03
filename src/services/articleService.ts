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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.wallet.balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      const publisher = await Publisher.findOne({ id: publisherId }).session(session);
      if (!publisher || !publisher.active) {
        throw new Error('Publisher not found or inactive');
      }

      const alreadyPurchased = user.purchasedArticles.some(
        article => article.articleId === articleId
      );

      if (alreadyPurchased) {
        throw new Error('Article already purchased');
      }

      user.wallet.balance -= amount;
      user.wallet.transactions.push({
        type: 'PURCHASE',
        amount: -amount,
        articleId,
        publisherId,
        timestamp: new Date(),
        status: 'COMPLETED',
        description: `Article purchase: ${articleId}`
      });

      const publisherRevenue = amount * publisher.revenueShare;
      const platformFee = amount * (1 - publisher.revenueShare);

      const accessToken = await PublisherIntegration.getArticleAccess(
        publisherId,
        articleId,
        `txn_${Date.now()}`
      );

      user.purchasedArticles.push({
        articleId,
        publisherId,
        title: 'Article Title',
        price: amount,
        purchaseDate: new Date(),
        accessToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      await user.save({ session });

      const transaction = new Transaction({
        userId: user._id,
        articleId,
        publisherId: publisher._id,
        amount,
        publisherRevenue,
        platformFee,
        processingFee: 0,
        paymentMethod: 'wallet',
        status: 'COMPLETED',
        transactionId: `txn_${Date.now()}_${userId}`
      });

      await transaction.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`Article purchased: ${articleId} by user ${userId}`);

      return {
        success: true,
        accessToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        balance: user.wallet.balance
      };
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
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
