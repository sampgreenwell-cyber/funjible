import { Publisher } from '../models/Publisher';
import { Subscription } from '../models/Subscription';
import { User } from '../models/User';
import { PaymentService } from './paymentService';
import { logger } from '../utils/logger';

export class PublisherService {
  static async getPublishers(): Promise<any[]> {
    try {
      const publishers = await Publisher.find({ active: true });

      return publishers.map(pub => ({
        id: pub.id,
        name: pub.name,
        domain: pub.domain,
        defaultArticlePrice: pub.defaultArticlePrice,
        active: pub.active
      }));
    } catch (error: any) {
      logger.error('Get publishers error:', error);
      throw error;
    }
  }

  static async getPublisherById(publisherId: string): Promise<any> {
    try {
      const publisher = await Publisher.findOne({ id: publisherId });

      if (!publisher) {
        return null;
      }

      return {
        id: publisher.id,
        name: publisher.name,
        domain: publisher.domain,
        defaultArticlePrice: publisher.defaultArticlePrice,
        active: publisher.active
      };
    } catch (error: any) {
      logger.error('Get publisher by ID error:', error);
      throw error;
    }
  }

  static async getPublisherArticles(publisherId: string): Promise<any[]> {
    try {
      return [
        {
          id: `article_${Date.now()}_1`,
          title: 'Sample Article 1',
          author: 'John Doe',
          publishDate: new Date(),
          price: 0.75
        },
        {
          id: `article_${Date.now()}_2`,
          title: 'Sample Article 2',
          author: 'Jane Smith',
          publishDate: new Date(),
          price: 0.99
        }
      ];
    } catch (error: any) {
      logger.error('Get publisher articles error:', error);
      throw error;
    }
  }

  static async subscribe(
    userId: string,
    publisherId: string,
    type: 'WEEKLY' | 'MONTHLY',
    paymentMethodId: string
  ): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const publisher = await Publisher.findOne({ id: publisherId });
      if (!publisher || !publisher.active) {
        throw new Error('Publisher not found or inactive');
      }

      const existingSubscription = await Subscription.findOne({
        userId,
        publisherId: publisher._id,
        active: true
      });

      if (existingSubscription) {
        throw new Error('Already subscribed to this publisher');
      }

      const prices = {
        WEEKLY: 3.99,
        MONTHLY: 12.99
      };
      const price = prices[type];

      const paymentMethod = user.paymentMethods.find(pm => pm.id === paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      const paymentResult = await PaymentService.processPayment({
        userId,
        paymentMethodToken: paymentMethod.token,
        amount: price,
        description: `${type} subscription to ${publisher.name}`
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      const expiresAt = type === 'WEEKLY'
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const subscription = new Subscription({
        userId,
        publisherId: publisher._id,
        type,
        price,
        expiresAt,
        transactionId: paymentResult.transactionId
      });

      await subscription.save();

      logger.info(`Subscription created: ${type} for user ${userId} to publisher ${publisherId}`);

      return {
        id: subscription._id,
        publisher: {
          id: publisher.id,
          name: publisher.name
        },
        type: subscription.type,
        price: subscription.price,
        startDate: subscription.startDate,
        expiresAt: subscription.expiresAt,
        autoRenew: subscription.autoRenew
      };
    } catch (error: any) {
      logger.error('Subscribe error:', error);
      throw error;
    }
  }

  static async unsubscribe(userId: string, publisherId: string): Promise<void> {
    try {
      const publisher = await Publisher.findOne({ id: publisherId });
      if (!publisher) {
        throw new Error('Publisher not found');
      }

      const subscription = await Subscription.findOne({
        userId,
        publisherId: publisher._id,
        active: true
      });

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      subscription.active = false;
      subscription.autoRenew = false;
      await subscription.save();

      logger.info(`Unsubscribed: user ${userId} from publisher ${publisherId}`);
    } catch (error: any) {
      logger.error('Unsubscribe error:', error);
      throw error;
    }
  }
}