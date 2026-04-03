import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  publisherId: mongoose.Types.ObjectId;
  type: 'WEEKLY' | 'MONTHLY';
  price: number;
  startDate: Date;
  expiresAt: Date;
  autoRenew: boolean;
  active: boolean;
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  publisherId: { type: Schema.Types.ObjectId, ref: 'Publisher', required: true },
  type: { type: String, enum: ['WEEKLY', 'MONTHLY'], required: true },
  price: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  autoRenew: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
  transactionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SubscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
