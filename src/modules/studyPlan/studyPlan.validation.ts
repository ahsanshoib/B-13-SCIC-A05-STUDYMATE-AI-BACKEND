import { z } from "zod";

export const generateStudyPlanSchema = z.object({
  examDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Enter a valid date"),
  subjects: z.array(z.string().trim().min(1)).min(1, "Add at least one subject").max(10),
  dailyStudyHours: z.number().min(0.5, "At least 0.5 hours").max(16, "Max 16 hours"),
  weakTopics: z.array(z.string().trim().min(1)).max(15).default([]),
  targetGrade: z.string().trim().min(1, "Target grade is required").max(50),
});

export const refineStudyPlanSchema = generateStudyPlanSchema.extend({
  refinementNote: z.string().trim().min(3, "Describe what to change").max(500),
  previousPlanId: z.string().min(1, "Missing previous plan reference"),
});

export type GenerateStudyPlanInput = z.infer<typeof generateStudyPlanSchema>;
export type RefineStudyPlanInput = z.infer<typeof refineStudyPlanSchema>;