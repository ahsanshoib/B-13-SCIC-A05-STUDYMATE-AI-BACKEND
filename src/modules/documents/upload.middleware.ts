import multer from "multer";
import { env } from "@config/env";
import { ApiError } from "@utils/ApiError";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const storage = multer.memoryStorage();

export const documentUpload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(ApiError.badRequest("Only PDF, DOCX, and TXT files are supported") as unknown as Error);
      return;
    }
    cb(null, true);
  },
});