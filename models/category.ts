import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  id: string; // slug e.g. "churi-alna"
  title: string;
  subtitle?: string;
  count?: string;
  image: string;
  badge?: string;
  order: number;
  status: number; // 1: active, 0: inactive
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    count: { type: String, default: "" },
    image: { type: String, required: true },
    badge: { type: String, default: "" },
    order: { type: Number, default: 0 },
    status: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
