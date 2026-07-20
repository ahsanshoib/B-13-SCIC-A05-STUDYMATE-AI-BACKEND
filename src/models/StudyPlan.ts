import { Schema, model, models, Document, Model, Types } from "mongoose";

export interface DailyScheduleItem {
  time: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  priority: "high" | "medium" | "low";
}

export interface WeeklyFocusItem {
  day: string;
  focusAreas: string[];
}

export interface StudyPlanDocument extends Document {
  userId: string;
  examDate: Date;
  subjects: string[];
  dailyStudyHours: number;
  weakTopics: string[];
  targetGrade: string;
  dailySchedule: DailyScheduleItem[];
  weeklyPlan: WeeklyFocusItem[];
  priorities: string[];
  improvementSuggestions: string[];
  version: number;
  previousPlanId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const dailyScheduleItemSchema = new Schema<DailyScheduleItem>(
  {
    time: { type: String, required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    priority: { type: String, enum: ["high", "medium", "low"], required: true },
  },
  { _id: false }
);

const weeklyFocusItemSchema = new Schema<WeeklyFocusItem>(
  {
    day: { type: String, required: true },
    focusAreas: { type: [String], default: [] },
  },
  { _id: false }
);

const studyPlanSchema = new Schema<StudyPlanDocument>(
  {
    userId: { type: String, required: true, index: true },
    examDate: { type: Date, required: true },
    subjects: { type: [String], required: true },
    dailyStudyHours: { type: Number, required: true },
    weakTopics: { type: [String], default: [] },
    targetGrade: { type: String, required: true },
    dailySchedule: { type: [dailyScheduleItemSchema], default: [] },
    weeklyPlan: { type: [weeklyFocusItemSchema], default: [] },
    priorities: { type: [String], default: [] },
    improvementSuggestions: { type: [String], default: [] },
    version: { type: Number, default: 1 },
    previousPlanId: { type: Schema.Types.ObjectId, ref: "StudyPlan" },
  },
  { timestamps: true }
);

studyPlanSchema.index({ userId: 1, createdAt: -1 });

export const StudyPlanModel: Model<StudyPlanDocument> =
  models.StudyPlan || model<StudyPlanDocument>("StudyPlan", studyPlanSchema);