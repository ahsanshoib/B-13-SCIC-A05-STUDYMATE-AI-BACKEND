import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@config/env";
import { ApiError } from "@utils/ApiError";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const getGeminiModel = (systemInstruction?: string) => {
  return genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction,
  });
};

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("503") ||
    message.includes("overloaded") ||
    message.includes("Service Unavailable") ||
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED")
  );
};

/**
 * Wraps any Gemini call with exponential-backoff retries. Only retries on
 * transient server-side errors (503 overload, 429 rate limit) — never on
 * genuine client errors (bad API key, invalid request), which fail fast.
 */
const withRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isTransientError(error) || attempt === MAX_RETRIES) {
        throw error;
      }

      const delay = BASE_DELAY_MS * 2 ** attempt;
      await sleep(delay);
    }
  }

  throw lastError;
};

export const generateJSON = async <T>(params: {
  prompt: string;
  systemInstruction: string;
}): Promise<T> => {
  const model = getGeminiModel(params.systemInstruction);

  try {
    const text = await withRetry(async () => {
      const result = await model.generateContent(params.prompt);
      return result.response.text();
    });

    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw ApiError.internal("AI returned an unexpected format. Please try again.");
    }
    if (isTransientError(error)) {
      throw ApiError.internal(
        "The AI service is currently experiencing high demand. Please try again in a moment."
      );
    }
    throw ApiError.internal("AI request failed. Please try again shortly.");
  }
};

export const generateText = async (params: {
  prompt: string;
  systemInstruction?: string;
}): Promise<string> => {
  const model = getGeminiModel(params.systemInstruction);
  try {
    return await withRetry(async () => {
      const result = await model.generateContent(params.prompt);
      return result.response.text();
    });
  } catch (error) {
    if (isTransientError(error)) {
      throw ApiError.internal(
        "The AI service is currently experiencing high demand. Please try again in a moment."
      );
    }
    throw ApiError.internal("AI request failed. Please try again shortly.");
  }
};

/**
 * Starts a Gemini chat stream with retry on the initial connection only
 * (once tokens start streaming, we can't safely retry mid-stream).
 */
export const startChatWithRetry = async (params: {
  systemInstruction: string;
  history: { role: "user" | "model"; parts: { text: string }[] }[];
  message: string;
}) => {
  const model = getGeminiModel(params.systemInstruction);
  const chat = model.startChat({ history: params.history });

  return withRetry(() => chat.sendMessageStream(params.message));
};
