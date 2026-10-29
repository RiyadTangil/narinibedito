import { NextRequest } from "next/server";
import connectMongoose from "@/lib/mongoose";
import { Product } from "@/models/product";
import { ok, fail, badRequest, notFound } from "@/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    await connectMongoose();
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("categorySlug");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const status = searchParams.get("status");

    const query: Record<string, any> = {};

    if (categorySlug && categorySlug !== "all") {
      query.categorySlug = categorySlug;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (status && status !== "all") {
      query.status = status === "active" || status === "1" ? 1 : 0;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ name: regex }, { sku: regex }, { category: regex }, { description: regex }];
    }

    const rawProducts = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const products = rawProducts.map((p: any) => ({
      ...p,
      id: p._id.toString(),
      _id: p._id.toString(),
    }));

    // Summary stats
    const total = await Product.countDocuments();
    const activeCount = await Product.countDocuments({ status: 1, stock: { $gt: 5 } });
    const lowStockCount = await Product.countDocuments({ status: 1, stock: { $gt: 0, $lte: 5 } });
    const outOfStockCount = await Product.countDocuments({ stock: { $lte: 0 } });

    return ok(products, 200, "Products fetched successfully", {
      total: products.length,
      stats: {
        total,
        activeCount,
        lowStockCount,
        outOfStockCount,
      },
    });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return fail(error, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectMongoose();
    const body = await req.json();

    const {
      name,
      category,
      categorySlug,
      price,
      originalPrice,
      discount,
      badge,
      highlight,
      description,
      size,
      material,
      image,
      secondaryImages,
      stock,
      sku,
    } = body;

    if (!name || !name.trim()) {
      return badRequest("পণ্যের নাম আবশ্যক");
    }

    if (!price || Number(price) <= 0) {
      return badRequest("সঠিক বিক্রয় মূল্য প্রদান করুন");
    }

    if (!category || !category.trim()) {
      return badRequest("ক্যাটাগরি নির্বাচন করুন");
    }

    if (!image || !image.trim()) {
      return badRequest("পণ্যের প্রধান ছবির লিংক প্রদান করুন");
    }

    // Generate SKU if missing
    let finalSku = sku?.trim();
    if (!finalSku) {
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      finalSku = `NN-${Date.now().toString().slice(-4)}-${randomPart}`;
    }

    // Check SKU duplicate
    const existingSku = await Product.findOne({ sku: finalSku });
    if (existingSku) {
      finalSku = `${finalSku}-${Math.floor(10 + Math.random() * 90)}`;
    }

    const numStock = typeof stock === "number" ? stock : Number(stock) || 20;
    const numPrice = Number(price);
    const numOriginalPrice = originalPrice ? Number(originalPrice) : undefined;

    const newProduct = await Product.create({
      sku: finalSku,
      name: name.trim(),
      category: category.trim(),
      categorySlug: (categorySlug || category).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price: numPrice,
      originalPrice: numOriginalPrice,
      discount: discount?.trim() || "",
      rating: 5.0,
      reviews: 0,
      badge: badge?.trim() || "",
      highlight: highlight?.trim() || "",
      description: description?.trim() || "",
      size: size?.trim() || "",
      material: material?.trim() || "",
      image: image.trim(),
      secondaryImages: Array.isArray(secondaryImages) ? secondaryImages : [],
      stock: numStock,
      inStock: numStock > 0,
      status: 1,
      whatsappMsg: `আমি '${name.trim()} (${numPrice} টাকা)' অর্ডার করতে চাই।`,
    });

    return ok(newProduct, 201, "নতুন পণ্য সফলভাবে স্টোরে যোগ করা হয়েছে");
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    return fail(error, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectMongoose();
    const body = await req.json();
    const { _id, id, sku, ...updates } = body;

    const query: Record<string, any> = {};
    if (_id) query._id = _id;
    else if (id) query.$or = [{ _id: id }, { sku: id }];
    else if (sku) query.sku = sku;
    else return badRequest("পণ্যের আইডি বা এসকেইউ আবশ্যক");

    const product = await Product.findOne(query);
    if (!product) {
      return notFound("পণ্যটি খুঁজে পাওয়া যায়নি");
    }

    if (updates.name !== undefined) product.name = updates.name.trim();
    if (updates.category !== undefined) product.category = updates.category.trim();
    if (updates.categorySlug !== undefined) product.categorySlug = updates.categorySlug.trim();
    if (updates.price !== undefined) product.price = Number(updates.price);
    if (updates.originalPrice !== undefined) product.originalPrice = updates.originalPrice ? Number(updates.originalPrice) : undefined;
    if (updates.discount !== undefined) product.discount = updates.discount.trim();
    if (updates.badge !== undefined) product.badge = updates.badge.trim();
    if (updates.highlight !== undefined) product.highlight = updates.highlight.trim();
    if (updates.description !== undefined) product.description = updates.description.trim();
    if (updates.size !== undefined) product.size = updates.size.trim();
    if (updates.sku !== undefined) product.sku = updates.sku.trim();
    if (updates.material !== undefined) product.material = updates.material.trim();
    if (updates.image !== undefined) product.image = updates.image.trim();
    if (updates.secondaryImages !== undefined) {
      product.secondaryImages = Array.isArray(updates.secondaryImages) ? updates.secondaryImages : [];
    }
    if (updates.stock !== undefined) {
      product.stock = Number(updates.stock);
      product.inStock = product.stock > 0;
    }
    if (updates.status !== undefined) {
      product.status = updates.status === 1 || updates.status === true ? 1 : 0;
    }

    await product.save();

    return ok(product, 200, "পণ্য সফলভাবে আপডেট করা হয়েছে");
  } catch (error: any) {
    console.error("PATCH /api/products error:", error);
    return fail(error, 500);
  }
}

export async function PUT(req: NextRequest) {
  return PATCH(req);
}

export async function DELETE(req: NextRequest) {
  try {
    await connectMongoose();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const _id = searchParams.get("_id");
    const sku = searchParams.get("sku");

    if (!id && !_id && !sku) {
      return badRequest("পণ্য আইডি আবশ্যক");
    }

    let query: Record<string, any> = {};
    if (_id) query = { _id };
    else if (sku) query = { sku };
    else query = { $or: [{ _id: id }, { sku: id }] };

    const deleted = await Product.findOneAndDelete(query);
    if (!deleted) {
      return notFound("পণ্যটি পাওয়া যায়নি");
    }

    return ok({ _id: deleted._id, sku: deleted.sku, name: deleted.name }, 200, "পণ্যটি সফলভাবে মুছে ফেলা হয়েছে");
  } catch (error: any) {
    console.error("DELETE /api/products error:", error);
    return fail(error, 500);
  }
}
