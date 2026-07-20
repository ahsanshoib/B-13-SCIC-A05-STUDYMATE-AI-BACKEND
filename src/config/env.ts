import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CLIENT_URL: z.string().url(),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET must be at least 16 characters"),
  BETTER_AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GEMINI_MODEL: z.string().default("gemini-1.5-flash"),
  RATE_LIMIT_WINDOW_MS: z.string().default("900000"),
  RATE_LIMIT_MAX: z.string().default("100"),
  MAX_UPLOAD_SIZE_MB: z.string().default("10"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  throw new Error("Invalid environment variables. Check backend/.env against .env.example");
}

export const env = {
  PORT: Number(parsed.data.PORT),
  NODE_ENV: parsed.data.NODE_ENV,
  CLIENT_URL: parsed.data.CLIENT_URL,
  MONGODB_URI: parsed.data.MONGODB_URI,
  BETTER_AUTH_SECRET: parsed.data.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: parsed.data.BETTER_AUTH_URL,
  GOOGLE_CLIENT_ID: parsed.data.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: parsed.data.GOOGLE_CLIENT_SECRET,
  GEMINI_API_KEY: parsed.data.GEMINI_API_KEY,
  GEMINI_MODEL: parsed.data.GEMINI_MODEL,
  RATE_LIMIT_WINDOW_MS: Number(parsed.data.RATE_LIMIT_WINDOW_MS),
  RATE_LIMIT_MAX: Number(parsed.data.RATE_LIMIT_MAX),
  MAX_UPLOAD_SIZE_MB: Number(parsed.data.MAX_UPLOAD_SIZE_MB),
};
