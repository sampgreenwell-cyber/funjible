import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthService } from '../services/authService';
import { logger } from '../utils/logger';

export class AuthController {
  static async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      const result = await AuthService.register({
        email,
        password,
        firstName,
        lastName
      });

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken
        }
      });
    } catch (error: any) {
      logger.error('Register error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Registration failed'
      });
    }
  }

  static async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.login(email, password);

      res.json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken
        }
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(401).json({
        success: false,
        error: error.message || 'Login failed'
      });
    }
  }

  static async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const user = {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        wallet: {
          balance: req.user.wallet.balance,
          currency: req.user.wallet.currency
        },
        createdAt: req.user.createdAt
      };

      res.json({
        success: true,
        data: { user }
      });
    } catch (error: any) {
      logger.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user profile'
      });
    }
  }

  static async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ success: false, error: 'Refresh token required' });
        return;
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: {
          token: result.token,
          refreshToken: result.refreshToken
        }
      });
    } catch (error: any) {
      logger.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
  }

  static async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error: any) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }
}