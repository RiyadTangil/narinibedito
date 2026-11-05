import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUpload extends Document {
  _id: mongoose.Types.ObjectId;
  filename: string;
  contentType: string;
  size: number;
  data: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

const UploadSchema = new Schema<IUpload>(
  {
    filename: { type: String, required: true },
    contentType: { type: String, required: true, default: "image/jpeg" },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  {
    timestamps: true,
  }
);

export const Upload: Model<IUpload> =
  mongoose.models.Upload || mongoose.model<IUpload>("Upload", UploadSchema);
