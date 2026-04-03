import { User } from '../models/User';
import { PaymentService } from './paymentService';
import { logger } from '../utils/logger';

export class WalletService {
  static async getBalance(userId: string): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        balance: user.wallet.balance,
        currency: user.wallet.currency
      };
    } catch (error: any) {
      logger.error('Get balance error:', error);
      throw error;
    }
  }

  static async addFunds(userId: string, amount: number, paymentMethodId: string): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const paymentMethod = user.paymentMethods.find(pm => pm.id === paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      const paymentResult = await PaymentService.processPayment({
        userId,
        paymentMethodToken: paymentMethod.token,
        amount,
        description: 'Wallet funding'
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      user.wallet.balance += amount;
      user.wallet.transactions.push({
        type: 'DEPOSIT',
        amount,
        timestamp: new Date(),
        status: 'COMPLETED',
        description: `Wallet funding via ${paymentMethod.type} ${paymentMethod.last4}`
      });

      await user.save();

      logger.info(`Funds added to wallet: $${amount} for user ${userId}`);

      return {
        success: true,
        balance: user.wallet.balance,
        transaction: {
          id: paymentResult.transactionId,
          amount,
          timestamp: new Date()
        }
      };
    } catch (error: any) {
      logger.error('Add funds error:', error);
      throw error;
    }
  }

  static async getTransactions(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const transactions = user.wallet.transactions
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice((page - 1) * limit, page * limit);

      const total = user.wallet.transactions.length;

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      logger.error('Get transactions error:', error);
      throw error;
    }
  }

  static async getAnalytics(userId: string, timeframe: string = 'month'): Promise<any> {
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

      const relevantTransactions = user.wallet.transactions.filter(
        t => t.timestamp >= startDate
      );

      const totalSpent = relevantTransactions
        .filter(t => t.type === 'PURCHASE')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const totalDeposited = relevantTransactions
        .filter(t => t.type === 'DEPOSIT')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyData = this.groupByMonth(relevantTransactions);

      return {
        timeframe,
        totalSpent,
        totalDeposited,
        netChange: totalDeposited - totalSpent,
        transactionCount: relevantTransactions.length,
        monthlyData,
        currentBalance: user.wallet.balance
      };
    } catch (error: any) {
      logger.error('Get analytics error:', error);
      throw error;
    }
  }

  private static groupByMonth(transactions: any[]): any[] {
    const grouped: { [key: string]: number } = {};

    transactions.forEach(transaction => {
      const month = transaction.timestamp.toISOString().substring(0, 7);
      if (!grouped[month]) {
        grouped[month] = 0;
      }
      if (transaction.type === 'PURCHASE') {
        grouped[month] += Math.abs(transaction.amount);
      }
    });

    return Object.entries(grouped).map(([month, amount]) => ({
      month,
      amount
    }));
  }
}
