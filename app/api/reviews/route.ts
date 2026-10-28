import { NextRequest } from "next/server";
import connectMongoose from "@/lib/mongoose";
import { Review } from "@/models/review";
import { ok, fail, badRequest } from "@/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    await connectMongoose();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const query: Record<string, any> = { status: 1 };
    if (productId && productId !== "all") {
      // Find reviews specific to this product OR general store reviews
      query.$or = [{ productId }, { productId: { $in: ["", null, "all"] } }];
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Compute summary statistics
    const total = reviews.length;
    const averageRating =
      total > 0
        ? Number(
            (
              reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / total
            ).toFixed(1)
          )
        : 5.0;

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;
      ratingCounts[star] = (ratingCounts[star] || 0) + 1;
    });

    return ok(reviews, 200, "Reviews fetched successfully", {
      total,
      averageRating,
      ratingCounts,
    });
  } catch (error: any) {
    console.error("GET /api/reviews error:", error);
    return fail(error, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectMongoose();
    const body = await req.json();

    const { name, location, phone, rating, comment, productTitle, productId } = body;

    if (!name || !name.trim()) {
      return badRequest("আপনার নাম লিখুন");
    }

    if (!comment || !comment.trim()) {
      return badRequest("আপনার মূল্যবান মতামত বা মন্তব্য লিখুন");
    }

    const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));

    const newReview = await Review.create({
      name: name.trim(),
      location: (location || "").trim(),
      phone: (phone || "").trim(),
      rating: numericRating,
      comment: comment.trim(),
      productTitle: (productTitle || "").trim(),
      productId: (productId || "").trim(),
      verifiedPurchase: true,
      status: 1, // Auto-published for instant customer gratification
      likes: 0,
    });

    return ok(newReview, 201, "আপনার মূল্যবান মতামতের জন্য অসংখ্য ধন্যবাদ!");
  } catch (error: any) {
    console.error("POST /api/reviews error:", error);
    return fail(error, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectMongoose();
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return badRequest("Review ID required");
    }

    const updated = await Review.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    return ok(updated, 200, "Marked as helpful");
  } catch (error: any) {
    return fail(error, 500);
  }
}
