import mongoose, { Schema, Document, Model } from "mongoose";
import { ORDER_STATUS, PAYMENT_METHOD } from "@/lib/constants/order-constants";

export interface IOrderItem {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryArea: string; // "inside_dhaka" | "outside_dhaka"
  deliveryFee: number;
  items: IOrderItem[];
  subtotal: number;
  totalAmount: number;
  status: number; // 1: Pending, 2: Confirmed, 3: Processing, 4: Shipped, 5: Delivered, 6: Cancelled
  paymentMethod: number; // 1: Cash on Delivery, 2: bKash, 3: Nagad
  paymentStatus: number; // 1: Unpaid, 2: Paid
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    size: { type: String },
    image: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    address: { type: String, required: true },
    deliveryArea: { type: String, default: "outside_dhaka" },
    deliveryFee: { type: Number, default: 130 },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: Number, default: ORDER_STATUS.PENDING, index: true },
    paymentMethod: { type: Number, default: PAYMENT_METHOD.CASH_ON_DELIVERY },
    paymentStatus: { type: Number, default: 1 },
    note: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
