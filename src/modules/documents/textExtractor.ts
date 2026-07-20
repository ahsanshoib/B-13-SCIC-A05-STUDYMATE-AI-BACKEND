import mammoth from "mammoth";
import { ApiError } from "@utils/ApiError";

type SupportedFileType = "pdf" | "docx" | "txt";

export const mimeToFileType = (mimetype: string): SupportedFileType => {
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  if (mimetype === "text/plain") return "txt";
  throw ApiError.badRequest("Unsupported file type");
};

export const extractTextFromFile = async (
  buffer: Buffer,
  fileType: SupportedFileType
): Promise<string> => {
  let text = "";

  if (fileType === "pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    text = result.text;
  } else if (fileType === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    text = buffer.toString("utf-8");
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw ApiError.badRequest("Couldn't extract any readable text from this file");
  }

  const MAX_CHARS = 40000;
  return trimmed.length > MAX_CHARS ? trimmed.slice(0, MAX_CHARS) : trimmed;
};