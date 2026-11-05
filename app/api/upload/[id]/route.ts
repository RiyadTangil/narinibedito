import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongoose from "@/lib/mongoose";
import { Upload } from "@/models/upload";
import { notFound, fail, ok } from "@/utils/api-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return notFound("Invalid image ID");
    }

    await connectMongoose();
    const doc = await Upload.findById(id).select("data contentType filename size updatedAt");

    if (!doc || !doc.data) {
      return notFound("ছবিটি পাওয়া যায়নি (Image not found)");
    }

    // Convert Buffer to Uint8Array for Next / Web Response compatibility
    const body = new Uint8Array(doc.data);

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": doc.contentType || "image/jpeg",
        "Content-Length": doc.size?.toString() || body.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Fetch image error:", error);
    return fail(error, 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return notFound("Invalid image ID");
    }

    await connectMongoose();
    const deleted = await Upload.findByIdAndDelete(id);

    if (!deleted) {
      return notFound("ছবিটি পাওয়া যায়নি");
    }

    return ok({ deleted: true }, 200, "ছবি মুছে ফেলা হয়েছে");
  } catch (error: any) {
    console.error("Delete image error:", error);
    return fail(error, 500);
  }
}

