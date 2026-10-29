import { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectMongoose from "@/lib/mongoose";
import { Product } from "@/models/product";
import { ok, notFound, fail } from "@/utils/api-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoose();
    const { id } = await params;

    let product = null;

    if (mongoose.isValidObjectId(id)) {
      product = await Product.findById(id).lean();
    }

    if (!product) {
      product = await Product.findOne({ sku: id }).lean();
    }

    if (!product) {
      // Support legacy indexed routes like /products/1, /products/2 by matching index in DB
      const all = await Product.find().sort({ createdAt: 1 }).lean();
      const numIdx = parseInt(id, 10);
      if (!isNaN(numIdx) && numIdx >= 1 && numIdx <= all.length) {
        product = all[numIdx - 1];
      }
    }

    if (!product) {
      return notFound("পণ্য পাওয়া যায়নি");
    }

    const formatted = {
      ...product,
      id: (product as any)._id.toString(),
      _id: (product as any)._id.toString(),
    };

    return ok(formatted, 200, "Product fetched successfully");
  } catch (error: any) {
    console.error("GET /api/products/[id] error:", error);
    return fail(error, 500);
  }
}
