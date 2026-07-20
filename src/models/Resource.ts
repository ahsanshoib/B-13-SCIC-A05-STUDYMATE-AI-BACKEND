import { Schema, model, models, Document, Model } from "mongoose";
import { SUBJECTS, DIFFICULTIES, Subject, Difficulty } from "@modules/resources/resource.constants";

export interface ResourceDocument extends Document {
  title: string;
  shortDescription: string;
  fullDescription: string;
  subject: Subject;
  difficulty: Difficulty;
  estimatedStudyTimeMinutes: number;
  tags: string[];
  imageUrl?: string;
  ownerId: string;
  ownerName: string;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<ResourceDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    shortDescription: { type: String, required: true, trim: true, maxlength: 220 },
    fullDescription: { type: String, required: true, trim: true, maxlength: 8000 },
    subject: { type: String, required: true, enum: SUBJECTS },
    difficulty: { type: String, required: true, enum: DIFFICULTIES },
    estimatedStudyTimeMinutes: { type: Number, required: true, min: 5, max: 6000 },
    tags: {
      type: [String],
      default: [],
      set: (tags: string[]) => tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean),
    },
    imageUrl: { type: String, trim: true },
    ownerId: { type: String, required: true, index: true },
    ownerName: { type: String, required: true },
  },
  { timestamps: true }
);

resourceSchema.index({ title: "text", shortDescription: "text", tags: "text" });
resourceSchema.index({ subject: 1, difficulty: 1 });
resourceSchema.index({ createdAt: -1 });

export const ResourceModel: Model<ResourceDocument> =
  models.Resource || model<ResourceDocument>("Resource", resourceSchema);