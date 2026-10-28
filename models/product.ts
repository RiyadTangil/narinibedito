import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  sku?: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  rating: number;
  reviews: number;
  badge?: string;
  highlight?: string;
  description?: string;
  size?: string;
  material?: string;
  image: string;
  secondaryImages?: string[];
  stock: number;
  inStock: boolean;
  status: number; // 1: active, 0: inactive
  whatsappMsg?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String, unique: true, sparse: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    categorySlug: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discount: { type: String, default: "" },
    rating: { type: Number, default: 5.0 },
    reviews: { type: Number, default: 0 },
    badge: { type: String, default: "" },
    highlight: { type: String, default: "" },
    description: { type: String, default: "" },
    size: { type: String, default: "" },
    material: { type: String, default: "" },
    image: { type: String, required: true },
    secondaryImages: { type: [String], default: [] },
    stock: { type: Number, default: 50 },
    inStock: { type: Boolean, default: true },
    status: { type: Number, default: 1 },
    whatsappMsg: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
