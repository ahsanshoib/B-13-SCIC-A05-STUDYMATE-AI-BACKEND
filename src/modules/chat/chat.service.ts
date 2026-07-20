import { ConversationModel, ConversationDocument } from "@models/Conversation";
import { getGeminiModel } from "@modules/ai/gemini.client";
import { logAiUsage } from "@modules/ai/aiUsage.service";
import { ApiError } from "@utils/ApiError";

const SYSTEM_INSTRUCTION = `You are the StudyMate AI Chat Assistant, embedded inside the StudyMate AI
learning platform. StudyMate AI helps students study smarter with three core features: an AI Study
Planner (generates daily/weekly study schedules from exam date, subjects, and weak topics), AI Document
Intelligence (summarizes uploaded PDFs/DOCX/TXT into key points, action items, and quiz questions), and
a resource library students can search, filter, and manage.

Your job:
- Answer study-related and application-navigation questions clearly and concisely.
- Use the conversation history for follow-up reasoning — don't ask the student to repeat context they
  already gave you.
- When relevant, point students to the right feature (e.g. "You can generate a fresh plan from the AI
  Study Planner page" or "Try uploading that PDF to AI Document Intelligence for a summary").
- Keep answers focused and skimmable. Use short paragraphs or bullet points for multi-step answers.
- If you don't know something application-specific, say so plainly instead of guessing.`;

const MAX_HISTORY_MESSAGES = 20;

export const getOrCreateConversation = async (
  userId: string,
  conversationId?: string
): Promise<ConversationDocument> => {
  if (conversationId) {
    const existing = await ConversationModel.findOne({ _id: conversationId, userId });
    if (!existing) throw ApiError.notFound("Conversation not found");
    return existing;
  }

  return ConversationModel.create({ userId, title: "New conversation", messages: [] });
};

export const listConversations = async (userId: string) => {
  return ConversationModel.find({ userId })
    .sort({ updatedAt: -1 })
    .select("title messages createdAt updatedAt")
    .lean();
};

export const getConversationById = async (userId: string, id: string) => {
  const conversation = await ConversationModel.findOne({ _id: id, userId }).lean();
  if (!conversation) throw ApiError.notFound("Conversation not found");
  return conversation;
};

export const deleteConversation = async (userId: string, id: string) => {
  const conversation = await ConversationModel.findOne({ _id: id, userId });
  if (!conversation) throw ApiError.notFound("Conversation not found");
  await conversation.deleteOne();
};

export const streamChatReply = async (
  userId: string,
  conversation: ConversationDocument,
  userMessage: string,
  onChunk: (text: string) => void
): Promise<{ fullReply: string; suggestedFollowUps: string[] }> => {
  const model = getGeminiModel(SYSTEM_INSTRUCTION);

  const history = conversation.messages.slice(-MAX_HISTORY_MESSAGES).map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("model" as const),
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(userMessage);

  let fullReply = "";
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    if (chunkText) {
      fullReply += chunkText;
      onChunk(chunkText);
    }
  }

  conversation.messages.push({ role: "user", content: userMessage, createdAt: new Date() });
  conversation.messages.push({ role: "assistant", content: fullReply, createdAt: new Date() });

  if (conversation.title === "New conversation") {
    conversation.title = userMessage.slice(0, 60);
  }

  await conversation.save();
  await logAiUsage(userId, "chat", { conversationId: conversation._id });

  const suggestedFollowUps = deriveFollowUps(userMessage);

  return { fullReply, suggestedFollowUps };
};

const deriveFollowUps = (lastUserMessage: string): string[] => {
  const lower = lastUserMessage.toLowerCase();

  if (lower.includes("plan") || lower.includes("schedule")) {
    return [
      "Can you adjust this for fewer study hours per day?",
      "What should I prioritize this week?",
    ];
  }
  if (lower.includes("document") || lower.includes("summar") || lower.includes("upload")) {
    return [
      "Can you generate quiz questions from my last upload?",
      "What were the key formulas in that document?",
    ];
  }
  return [
    "Can you suggest a study plan for this?",
    "What resources should I look at next?",
  ];
};