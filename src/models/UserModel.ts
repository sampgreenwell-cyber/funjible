import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IPaymentMethod {
  id: string;
  token: string;
  type: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface IWalletTransaction {
  type: 'DEPOSIT' | 'PURCHASE' | 'REFUND';
  amount: number;
  articleId?: string;
  publisherId?: string;
  timestamp: Date;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description?: string;
}

export interface IWallet {
  balance: number;
  currency: string;
  transactions: IWalletTransaction[];
}

export interface IPurchasedArticle {
  articleId: string;
  publisherId: string;
  title: string;
  price: number;
  purchaseDate: Date;
  accessToken: string;
  expiresAt: Date;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  paymentMethods: IPaymentMethod[];
  wallet: IWallet;
  purchasedArticles: IPurchasedArticle[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>({
  id: { type: String, required: true },
  token: { type: String, required: true },
  type: { type: String, required: true },
  last4: { type: String, required: true },
  expiryMonth: { type: Number, required: true },
  expiryYear: { type: Number, required: true },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const WalletTransactionSchema = new Schema<IWalletTransaction>({
  type: { type: String, enum: ['DEPOSIT', 'PURCHASE', 'REFUND'], required: true },
  amount: { type: Number, required: true },
  articleId: String,
  publisherId: String,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  description: String
});

const WalletSchema = new Schema<IWallet>({
  balance: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'USD' },
  transactions: [WalletTransactionSchema]
});

const PurchasedArticleSchema = new Schema<IPurchasedArticle>({
  articleId: { type: String, required: true },
  publisherId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  accessToken: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  paymentMethods: [PaymentMethodSchema],
  wallet: { type: WalletSchema, default: () => ({ balance: 0, currency: 'USD', transactions: [] }) },
  purchasedArticles: [PurchasedArticleSchema]
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
