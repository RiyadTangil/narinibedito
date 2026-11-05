import { NextRequest } from "next/server";
import connectMongoose from "@/lib/mongoose";
import { Upload } from "@/models/upload";
import { ok, fail, badRequest } from "@/utils/api-response";

// Max 10MB per image to stay well within MongoDB 16MB document limit
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    await connectMongoose();

    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return badRequest("Content-Type must be multipart/form-data");
    }

    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return badRequest("কোনো ছবি পাওয়া যায়নি (No image file uploaded)");
    }

    const uploadedResults = [];

    for (const file of files) {
      if (typeof file === "string" || !file.size) continue;

      if (!file.type.startsWith("image/")) {
        return badRequest(`ফাইলটি ছবি নয়: ${file.name} (Only image files allowed)`);
      }

      if (file.size > MAX_FILE_SIZE) {
        return badRequest(`ছবির সাইজ ১০ মেগাবাইটের বেশি হতে পারবে না: ${file.name}`);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const doc = await Upload.create({
        filename: file.name || "image.jpg",
        contentType: file.type || "image/jpeg",
        size: buffer.length,
        data: buffer,
      });

      const docId = (doc._id as any).toString();
      uploadedResults.push({
        url: `/api/upload/${docId}`,
        id: docId,
        filename: doc.filename,
        size: doc.size,
      });
    }

    if (uploadedResults.length === 0) {
      return badRequest("ছবি আপলোড সম্পন্ন হয়নি");
    }

    // If single file uploaded, return the primary object; otherwise return list
    if (uploadedResults.length === 1) {
      return ok(uploadedResults[0], 201, "ছবি সফলভাবে আপলোড হয়েছে");
    }

    return ok(uploadedResults, 201, "ছবিসমূহ সফলভাবে আপলোড হয়েছে");
  } catch (error: any) {
    console.error("Upload error:", error);
    return fail(error, 500);
  }
}
