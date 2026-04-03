import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { logger } from '../utils/logger';

export class UserService {
  static async getPurchasedArticles(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const articles = user.purchasedArticles
        .sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime())
        .slice((page - 1) * limit, page * limit);

      const total = user.purchasedArticles.length;

      return {
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      logger.error('Get purchased articles error:', error);
      throw error;
    }
  }

  static async getReadingHistory(userId: string): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const publisherGroups: { [key: string]: any[] } = {};

      user.purchasedArticles.forEach(article => {
        if (!publisherGroups[article.publisherId]) {
          publisherGroups[article.publisherId] = [];
        }
        publisherGroups[article.publisherId].push(article);
      });

      const history = Object.entries(publisherGroups).map(([publisherId, articles]) => ({
        publisherId,
        articleCount: articles.length,
        totalSpent: articles.reduce((sum, article) => sum + article.price, 0),
        articles: articles.slice(0, 5)
      }));

      return {
        totalArticles: user.purchasedArticles.length,
        publisherCount: Object.keys(publisherGroups).length,
        history
      };
    } catch (error: any) {
      logger.error('Get reading history error:', error);
      throw error;
    }
  }

  static async getSpendingAnalytics(userId: string, timeframe: string = 'month'): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const relevantPurchases = user.purchasedArticles.filter(
        article => article.purchaseDate >= startDate
      );

      const totalSpent = relevantPurchases.reduce((sum, article) => sum + article.price, 0);

      const publisherSpending: { [key: string]: number } = {};
      relevantPurchases.forEach(article => {
        if (!publisherSpending[article.publisherId]) {
          publisherSpending[article.publisherId] = 0;
        }
        publisherSpending[article.publisherId] += article.price;
      });

      const topPublishers = Object.entries(publisherSpending)
        .map(([publisherId, amount]) => ({
          publisherId,
          amount,
          articleCount: relevantPurchases.filter(a => a.publisherId === publisherId).length
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      const monthlySpending = this.groupByMonth(relevantPurchases);

      return {
        timeframe,
        totalSpent,
        articleCount: relevantPurchases.length,
        averageArticlePrice: relevantPurchases.length > 0 ? totalSpent / relevantPurchases.length : 0,
        topPublishers,
        monthlySpending
      };
    } catch (error: any) {
      logger.error('Get spending analytics error:', error);
      throw error;
    }
  }

  static async updateProfile(userId: string, updates: any): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const allowedUpdates = ['firstName', 'lastName'];
      const updateData: any = {};

      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          updateData[field] = updates[field];
        }
      });

      Object.assign(user, updateData);
      await user.save();

      logger.info(`Profile updated for user ${userId}`);

      return {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };
    } catch (error: any) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  static async getSubscriptions(userId: string): Promise<any> {
    try {
      const subscriptions = await Subscription.find({
        userId,
        active: true
      }).populate('publisherId');

      return subscriptions.map(sub => ({
        id: sub._id,
        publisher: sub.publisherId,
        type: sub.type,
        price: sub.price,
        startDate: sub.startDate,
        expiresAt: sub.expiresAt,
        autoRenew: sub.autoRenew
      }));
    } catch (error: any) {
      logger.error('Get subscriptions error:', error);
      throw error;
    }
  }

  private static groupByMonth(purchases: any[]): any[] {
    const grouped: { [key: string]: number } = {};

    purchases.forEach(purchase => {
      const month = purchase.purchaseDate.toISOString().substring(0, 7);
      if (!grouped[month]) {
        grouped[month] = 0;
      }
      grouped[month] += purchase.price;
    });

    return Object.entries(grouped).map(([month, amount]) => ({
      month,
      amount
    }));
  }
}