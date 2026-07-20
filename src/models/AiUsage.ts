import { Schema, model, models, Document, Model } from "mongoose";

export type AiFeature = "study_plan" | "document_intelligence" | "chat";

export interface AiUsageDocument extends Document {
  userId: string;
  feature: AiFeature;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const aiUsageSchema = new Schema<AiUsageDocument>(
  {
    userId: { type: String, required: true, index: true },
    feature: {
      type: String,
      required: true,
      enum: ["study_plan", "document_intelligence", "chat"],
    },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

aiUsageSchema.index({ userId: 1, createdAt: -1 });

export const AiUsageModel: Model<AiUsageDocument> =
  models.AiUsage || model<AiUsageDocument>("AiUsage", aiUsageSchema);