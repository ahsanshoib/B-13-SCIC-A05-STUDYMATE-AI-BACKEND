import { z } from "zod";
import { SUBJECTS, DIFFICULTIES, RESOURCE_SORT_OPTIONS } from "./resource.constants";

export const createResourceSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  shortDescription: z.string().trim().min(10, "Short description must be at least 10 characters").max(220),
  fullDescription: z.string().trim().min(30, "Full description must be at least 30 characters").max(8000),
  subject: z.enum(SUBJECTS, { errorMap: () => ({ message: "Choose a valid subject" }) }),
  difficulty: z.enum(DIFFICULTIES, { errorMap: () => ({ message: "Choose a valid difficulty" }) }),
  estimatedStudyTimeMinutes: z
    .number({ invalid_type_error: "Estimated study time must be a number" })
    .int()
    .min(5, "Minimum 5 minutes")
    .max(6000, "Maximum 6000 minutes"),
  tags: z.array(z.string().trim().min(1)).max(10, "Up to 10 tags").default([]),
  imageUrl: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
});

export const updateResourceSchema = createResourceSchema.partial();

export const listResourcesQuerySchema = z.object({
  search: z.string().trim().optional(),
  subject: z.enum(SUBJECTS).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  sort: z.enum(RESOURCE_SORT_OPTIONS).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ListResourcesQuery = z.infer<typeof listResourcesQuerySchema>;