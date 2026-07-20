import { Schema, model, models, Document, Model } from "mongoose";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface UploadedDocument extends Document {
  userId: string;
  fileName: string;
  fileType: "pdf" | "docx" | "txt";
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  quizQuestions: QuizQuestion[];
  formulasAndConcepts: string[];
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema<QuizQuestion>(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswerIndex: { type: Number, required: true },
  },
  { _id: false }
);

const documentSchema = new Schema<UploadedDocument>(
  {
    userId: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    fileType: { type: String, enum: ["pdf", "docx", "txt"], required: true },
    summary: { type: String, required: true },
    keyPoints: { type: [String], default: [] },
    actionItems: { type: [String], default: [] },
    quizQuestions: { type: [quizQuestionSchema], default: [] },
    formulasAndConcepts: { type: [String], default: [] },
  },
  { timestamps: true }
);

documentSchema.index({ userId: 1, createdAt: -1 });

export const DocumentModel: Model<UploadedDocument> =
  models.UploadedDocument || model<UploadedDocument>("UploadedDocument", documentSchema);