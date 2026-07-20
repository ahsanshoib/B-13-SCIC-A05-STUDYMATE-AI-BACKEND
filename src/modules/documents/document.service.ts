import { generateJSON } from "@modules/ai/gemini.client";
import { logAiUsage } from "@modules/ai/aiUsage.service";
import { DocumentModel, UploadedDocument } from "@models/Document";
import { ApiError } from "@utils/ApiError";
import { extractTextFromFile, mimeToFileType } from "./textExtractor";

interface AiDocumentAnalysis {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  formulasAndConcepts: string[];
  quizQuestions: { question: string; options: string[]; correctAnswerIndex: number }[];
}

const SYSTEM_INSTRUCTION = `You are StudyMate AI's document intelligence engine. You read study material
(lecture notes, textbook excerpts, slides) and produce a structured study aid. Respond with ONLY valid
JSON matching this exact shape, and nothing else — no markdown, no commentary:

{
  "summary": "string, 3-5 sentences",
  "keyPoints": ["string", "..."],
  "actionItems": ["string", "..."],
  "formulasAndConcepts": ["string", "..."],
  "quizQuestions": [
    { "question": "string", "options": ["string","string","string","string"], "correctAnswerIndex": number }
  ]
}

keyPoints: 5-10 concise bullet points capturing the most important ideas.
actionItems: 3-6 concrete next steps a student should take to master this material (practice problems,
concepts to review, etc).
formulasAndConcepts: important formulas, definitions, or core concepts found in the text (empty array if none).
quizQuestions: exactly 5 multiple-choice questions (4 options each) testing understanding of the material,
with correctAnswerIndex as the 0-based index of the right option.`;

export const analyzeDocument = async (
  userId: string,
  file: { buffer: Buffer; mimetype: string; originalname: string }
): Promise<UploadedDocument> => {
  const fileType = mimeToFileType(file.mimetype);
  const text = await extractTextFromFile(file.buffer, fileType);

  const aiResponse = await generateJSON<AiDocumentAnalysis>({
    prompt: `Analyze the following study material and produce the structured JSON output.\n\n---\n${text}\n---`,
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const doc = await DocumentModel.create({
    userId,
    fileName: file.originalname,
    fileType,
    summary: aiResponse.summary,
    keyPoints: aiResponse.keyPoints,
    actionItems: aiResponse.actionItems,
    formulasAndConcepts: aiResponse.formulasAndConcepts,
    quizQuestions: aiResponse.quizQuestions,
  });

  await logAiUsage(userId, "document_intelligence", { documentId: doc._id, fileType });

  return doc;
};

export const listDocuments = async (userId: string) => {
  return DocumentModel.find({ userId }).sort({ createdAt: -1 }).lean();
};

export const getDocumentById = async (userId: string, id: string) => {
  const doc = await DocumentModel.findOne({ _id: id, userId }).lean();
  if (!doc) throw ApiError.notFound("Document analysis not found");
  return doc;
};

export const deleteDocument = async (userId: string, id: string) => {
  const doc = await DocumentModel.findOne({ _id: id, userId });
  if (!doc) throw ApiError.notFound("Document analysis not found");
  await doc.deleteOne();
};
