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

export const generateJSON = async <T>(params: {
  prompt: string;
  systemInstruction: string;
}): Promise<T> => {
  const model = getGeminiModel(params.systemInstruction);

  try {
    const result = await model.generateContent(params.prompt);
    const text = result.response.text();
    const cleaned = text.replace(/json|/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw ApiError.internal("AI returned an unexpected format. Please try again.");
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
    const result = await model.generateContent(params.prompt);
    return result.response.text();
  } catch {
    throw ApiError.internal("AI request failed. Please try again shortly.");
  }
};