import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  name: string;
  location?: string;
  phone?: string;
  rating: number; // 1 to 5
  comment: string;
  productTitle?: string;
  productId?: string;
  verifiedPurchase: boolean;
  status: number; // 1: approved/active, 0: pending
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    comment: { type: String, required: true, trim: true },
    productTitle: { type: String, default: "", trim: true },
    productId: { type: String, default: "", index: true },
    verifiedPurchase: { type: Boolean, default: true },
    status: { type: Number, default: 1, index: true }, // 1: visible, 0: hidden
    likes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
