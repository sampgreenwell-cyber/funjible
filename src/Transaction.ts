import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  articleId?: string;
  publisherId?: mongoose.Types.ObjectId;
  amount: number;
  publisherRevenue: number;
  platformFee: number;
  processingFee: number;
  paymentMethod: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  articleId: String,
  publisherId: { type: Schema.Types.ObjectId, ref: 'Publisher' },
  amount: { type: Number, required: true },
  publisherRevenue: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  processingFee: { type: Number, default: 0 },
  paymentMethod: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  transactionId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

TransactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);