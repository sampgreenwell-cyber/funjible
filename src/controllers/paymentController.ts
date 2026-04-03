import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PaymentService } from '../services/paymentService';
import { logger } from '../utils/logger';

export class PaymentController {
  static async getPaymentMethods(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const paymentMethods = await PaymentService.getPaymentMethods(userId);

      res.json({
        success: true,
        data: paymentMethods
      });
    } catch (error: any) {
      logger.error('Get payment methods error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get payment methods'
      });
    }
  }

  static async addPaymentMethod(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const paymentDetails = req.body;

      const paymentMethod = await PaymentService.addPaymentMethod(userId, paymentDetails);

      res.status(201).json({
        success: true,
        data: paymentMethod
      });
    } catch (error: any) {
      logger.error('Add payment method error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to add payment method'
      });
    }
  }

  static async setDefaultPaymentMethod(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { paymentMethodId } = req.params;

      await PaymentService.setDefaultPaymentMethod(userId, paymentMethodId);

      res.json({
        success: true,
        message: 'Default payment method updated'
      });
    } catch (error: any) {
      logger.error('Set default payment method error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to set default payment method'
      });
    }
  }

  static async removePaymentMethod(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { paymentMethodId } = req.params;

      await PaymentService.removePaymentMethod(userId, paymentMethodId);

      res.json({
        success: true,
        message: 'Payment method removed'
      });
    } catch (error: any) {
      logger.error('Remove payment method error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to remove payment method'
      });
    }
  }
}
