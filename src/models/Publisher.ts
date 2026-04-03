import mongoose, { Schema, Document } from 'mongoose';

export interface IPublisher extends Document {
  id: string;
  name: string;
  domain: string;
  apiEndpoint?: string;
  apiKey?: string;
  active: boolean;
  revenueShare: number;
  defaultArticlePrice: number;
  contractStartDate?: Date;
  contractEndDate?: Date;
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PublisherSchema = new Schema<IPublisher>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  apiEndpoint: String,
  apiKey: String,
  active: { type: Boolean, default: true },
  revenueShare: { type: Number, default: 0.7, min: 0, max: 1 },
  defaultArticlePrice: { type: Number, default: 0.75 },
  contractStartDate: Date,
  contractEndDate: Date,
  paymentDetails: {
    bankName: String,
    accountNumber: String,
    routingNumber: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PublisherSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Publisher = mongoose.model<IPublisher>('Publisher', PublisherSchema);
