import { AiUsageModel, AiFeature } from "@models/AiUsage";

export const logAiUsage = async (
  userId: string,
  feature: AiFeature,
  metadata?: Record<string, unknown>
): Promise<void> => {
  try {
    await AiUsageModel.create({ userId, feature, metadata });
  } catch {
    // Usage logging must never break the primary AI request.
  }
};