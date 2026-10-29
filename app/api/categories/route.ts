import { NextRequest } from "next/server";
import connectMongoose from "@/lib/mongoose";
import { Category } from "@/models/category";
import { ok, fail, badRequest, notFound } from "@/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    await connectMongoose();
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const search = searchParams.get("search");

    const query: Record<string, any> = {};

    if (statusParam && statusParam !== "all") {
      query.status = statusParam === "active" || statusParam === "1" ? 1 : 0;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ title: regex }, { subtitle: regex }, { id: regex }];
    }

    const categories = await Category.find(query).sort({ order: 1, createdAt: -1 }).lean();

    return ok(categories, 200, "Categories fetched successfully", {
      total: categories.length,
    });
  } catch (error: any) {
    console.error("GET /api/categories error:", error);
    return fail(error, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectMongoose();
    const body = await req.json();

    const { title, subtitle, count, image, badge, order, id } = body;

    if (!title || !title.trim()) {
      return badRequest("ক্যাটাগরির নাম প্রদান করুন");
    }

    if (!image || !image.trim()) {
      return badRequest("ক্যাটাগরির ছবি লিংক প্রদান করুন");
    }

    // Generate slug ID
    let slugId = id?.trim();
    if (!slugId) {
      slugId = (subtitle || title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      if (!slugId || slugId.length < 2) {
        slugId = `cat-${Date.now()}`;
      }
    }

    // Check if slug exists
    const existing = await Category.findOne({ id: slugId });
    if (existing) {
      slugId = `${slugId}-${Date.now().toString().slice(-4)}`;
    }

    const newCategory = await Category.create({
      id: slugId,
      title: title.trim(),
      subtitle: subtitle?.trim() || "",
      count: count?.trim() || "",
      image: image.trim(),
      badge: badge?.trim() || "",
      order: typeof order === "number" ? order : 0,
      status: 1,
    });

    return ok(newCategory, 201, "নতুন ক্যাটাগরি সফলভাবে যুক্ত হয়েছে");
  } catch (error: any) {
    console.error("POST /api/categories error:", error);
    return fail(error, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectMongoose();
    const body = await req.json();
    const { id, _id, ...updates } = body;

    const query = _id ? { _id } : { id };
    const category = await Category.findOne(query);

    if (!category) {
      return notFound("ক্যাটাগরি খুঁজে পাওয়া যায়নি");
    }

    if (updates.title !== undefined) category.title = updates.title.trim();
    if (updates.subtitle !== undefined) category.subtitle = updates.subtitle.trim();
    if (updates.count !== undefined) category.count = updates.count.trim();
    if (updates.image !== undefined) category.image = updates.image.trim();
    if (updates.badge !== undefined) category.badge = updates.badge.trim();
    if (updates.order !== undefined) category.order = updates.order;
    if (updates.status !== undefined) {
      category.status = updates.status === 1 || updates.status === true ? 1 : 0;
    }

    await category.save();

    return ok(category, 200, "ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে");
  } catch (error: any) {
    console.error("PATCH /api/categories error:", error);
    return fail(error, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectMongoose();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const _id = searchParams.get("_id");

    if (!id && !_id) {
      return badRequest("ক্যাটাগরি আইডি আবশ্যক");
    }

    const query = _id ? { _id } : { id };
    const deleted = await Category.findOneAndDelete(query);

    if (!deleted) {
      return notFound("ক্যাটাগরি পাওয়া যায়নি");
    }

    return ok({ id: deleted.id, _id: deleted._id }, 200, "ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে");
  } catch (error: any) {
    console.error("DELETE /api/categories error:", error);
    return fail(error, 500);
  }
}
