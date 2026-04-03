import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/UserModel';
import { logger } from '../utils/logger';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  token: string;
  refreshToken: string;
}

export class AuthService {
  private static generateToken(userId: string): string {
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign({ userId }, jwtSecret, { expiresIn } as any);
  }

  private static generateRefreshToken(userId: string): string {
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    return jwt.sign({ userId, type: 'refresh' }, jwtSecret, { expiresIn } as any);
  }

  static async register(data: RegisterData): Promise<AuthResult> {
    try {
      const existingUser = await User.findOne({ email: data.email.toLowerCase() });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const user = new User({
        email: data.email.toLowerCase(),
        passwordHash: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });

      await user.save();

      const token = this.generateToken(user._id.toString());
      const refreshToken = this.generateRefreshToken(user._id.toString());

      logger.info(`User registered: ${user.email}`);

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token,
        refreshToken
      };
    } catch (error: any) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  static async login(email: string, password: string): Promise<AuthResult> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const token = this.generateToken(user._id.toString());
      const refreshToken = this.generateRefreshToken(user._id.toString());

      logger.info(`User logged in: ${user.email}`);

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token,
        refreshToken
      };
    } catch (error: any) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
      
      const decoded = jwt.verify(refreshToken, jwtSecret) as { userId: string; type: string };

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      const newToken = this.generateToken(decoded.userId);
      const newRefreshToken = this.generateRefreshToken(decoded.userId);

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error: any) {
      logger.error('Refresh token error:', error);
      throw new Error('Invalid refresh token');
    }
  }
}
