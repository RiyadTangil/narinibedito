import { NextRequest } from "next/server";
import mongoose from "mongoose";
import connectMongoose from "@/lib/mongoose";
import { Product } from "@/models/product";
import { ok, notFound, fail } from "@/utils/api-response";
import { PATCH as updateProduct, DELETE as deleteProduct } from "../route";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const nextReq = new NextRequest(new URL("/api/products", req.url), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, _id: body._id || body.id || id, id: body.id || body._id || id }),
  });
  return updateProduct(nextReq);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL("/api/products", req.url);
  url.searchParams.set("id", id);
  const nextReq = new NextRequest(url, { method: "DELETE" });
  return deleteProduct(nextReq);
}
