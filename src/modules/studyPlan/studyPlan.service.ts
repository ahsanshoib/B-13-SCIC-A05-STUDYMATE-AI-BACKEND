import { generateJSON } from "@modules/ai/gemini.client";
import { logAiUsage } from "@modules/ai/aiUsage.service";
import { StudyPlanModel, StudyPlanDocument } from "@models/StudyPlan";
import { ApiError } from "@utils/ApiError";
import { GenerateStudyPlanInput, RefineStudyPlanInput } from "./studyPlan.validation";

interface AiPlanResponse {
  dailySchedule: {
    time: string;
    subject: string;
    topic: string;
    durationMinutes: number;
    priority: "high" | "medium" | "low";
  }[];
  weeklyPlan: { day: string; focusAreas: string[] }[];
  priorities: string[];
  improvementSuggestions: string[];
}

const SYSTEM_INSTRUCTION = `You are StudyMate AI's expert academic study planner. You analyze a student's
exam date, subjects, available daily study hours, weak topics, and target grade to build a realistic,
prioritized study plan. Always prioritize weak topics earlier and more frequently. Never exceed the
student's stated daily study hours across the daily schedule. Respond with ONLY valid JSON matching
this exact TypeScript shape, and nothing else — no markdown, no commentary:

{
  "dailySchedule": [
    { "time": "7:00 AM", "subject": "string", "topic": "string", "durationMinutes": number, "priority": "high" | "medium" | "low" }
  ],
  "weeklyPlan": [
    { "day": "Monday", "focusAreas": ["string"] }
  ],
  "priorities": ["string"],
  "improvementSuggestions": ["string"]
}

dailySchedule should represent ONE representative study day (today), with 3-6 time blocks.
weeklyPlan should cover all 7 days of the week with 1-3 focus areas each.
priorities should list 3-5 subject/topic priorities in order of urgency.
improvementSuggestions should give 2-4 concrete, actionable study-habit suggestions.`;

const buildPrompt = (input: GenerateStudyPlanInput, refinementNote?: string): string => {
  const daysUntilExam = Math.max(
    1,
    Math.ceil((new Date(input.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return `Student profile:
- Exam date: ${input.examDate} (${daysUntilExam} days from now)
- Subjects: ${input.subjects.join(", ")}
- Daily study hours available: ${input.dailyStudyHours}
- Weak topics needing extra focus: ${input.weakTopics.length ? input.weakTopics.join(", ") : "none specified"}
- Target grade: ${input.targetGrade}
${refinementNote ? `\nThe student wants this refinement compared to their last plan: "${refinementNote}"` : ""}

Generate the study plan JSON now.`;
};

export const generateStudyPlan = async (
  userId: string,
  input: GenerateStudyPlanInput
): Promise<StudyPlanDocument> => {
  const aiResponse = await generateJSON<AiPlanResponse>({
    prompt: buildPrompt(input),
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const plan = await StudyPlanModel.create({
    userId,
    examDate: new Date(input.examDate),
    subjects: input.subjects,
    dailyStudyHours: input.dailyStudyHours,
    weakTopics: input.weakTopics,
    targetGrade: input.targetGrade,
    dailySchedule: aiResponse.dailySchedule,
    weeklyPlan: aiResponse.weeklyPlan,
    priorities: aiResponse.priorities,
    improvementSuggestions: aiResponse.improvementSuggestions,
    version: 1,
  });

  await logAiUsage(userId, "study_plan", { action: "generate", planId: plan._id });

  return plan;
};

export const refineStudyPlan = async (
  userId: string,
  input: RefineStudyPlanInput
): Promise<StudyPlanDocument> => {
  const previousPlan = await StudyPlanModel.findOne({
    _id: input.previousPlanId,
    userId,
  });

  if (!previousPlan) {
    throw ApiError.notFound("Previous study plan not found");
  }

  const aiResponse = await generateJSON<AiPlanResponse>({
    prompt: buildPrompt(input, input.refinementNote),
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const plan = await StudyPlanModel.create({
    userId,
    examDate: new Date(input.examDate),
    subjects: input.subjects,
    dailyStudyHours: input.dailyStudyHours,
    weakTopics: input.weakTopics,
    targetGrade: input.targetGrade,
    dailySchedule: aiResponse.dailySchedule,
    weeklyPlan: aiResponse.weeklyPlan,
    priorities: aiResponse.priorities,
    improvementSuggestions: aiResponse.improvementSuggestions,
    version: previousPlan.version + 1,
    previousPlanId: previousPlan._id,
  });

  await logAiUsage(userId, "study_plan", { action: "refine", planId: plan._id });

  return plan;
};

export const listStudyPlans = async (userId: string) => {
  return StudyPlanModel.find({ userId }).sort({ createdAt: -1 }).lean();
};

export const getLatestStudyPlan = async (userId: string) => {
  return StudyPlanModel.findOne({ userId }).sort({ createdAt: -1 }).lean();
};

export const getStudyPlanById = async (userId: string, id: string) => {
  const plan = await StudyPlanModel.findOne({ _id: id, userId }).lean();
  if (!plan) throw ApiError.notFound("Study plan not found");
  return plan;
};

export const deleteStudyPlan = async (userId: string, id: string) => {
  const plan = await StudyPlanModel.findOne({ _id: id, userId });
  if (!plan) throw ApiError.notFound("Study plan not found");
  await plan.deleteOne();
};
