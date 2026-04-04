import mongoose, { Document, Schema } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  description: string;
  excerpt: string;
  content: string;
  author: string;
  publisher: mongoose.Types.ObjectId;
  publishedAt: Date;
  price: number;
  imageUrl?: string;
  url?: string;
  category?: string;
  tags?: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    publisher: { type: Schema.Types.ObjectId, ref: 'Publisher', required: true },
    publishedAt: { type: Date, default: Date.now },
    price: { type: Number, required: true, min: 0.25, max: 10 },
    imageUrl: { type: String },
    url: { type: String },
    category: { type: String },
    tags: [{ type: String }],
    active: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

articleSchema.index({ title: 'text', description: 'text' });
articleSchema.index({ publisher: 1, publishedAt: -1 });
articleSchema.index({ active: 1, publishedAt: -1 });

export const Article = mongoose.model<IArticle>('Article', articleSchema);