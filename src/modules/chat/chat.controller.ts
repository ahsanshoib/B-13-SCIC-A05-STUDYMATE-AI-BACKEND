import { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiError } from "@utils/ApiError";
import * as chatService from "./chat.service";
import { SendMessageInput } from "./chat.validation";

export const postSendMessageStream = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const userId = req.user.uid || req.user.id;
  const { conversationId, message } = req.body as SendMessageInput;
  const conversation = await chatService.getOrCreateConversation(userId, conversationId);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

 
  res.write(`event: init\ndata: ${JSON.stringify({ conversationId: conversation._id })}\n\n`);

  try {
    const { suggestedFollowUps } = await chatService.streamChatReply(
      userId,
      conversation,
      message,
      (chunk) => {
        res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    );

    res.write(`event: done\ndata: ${JSON.stringify({ suggestedFollowUps })}\n\n`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "AI request failed";
    res.write(`event: error\ndata: ${JSON.stringify({ message: msg })}\n\n`);
  } finally {
    res.end();
  }
});

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const userId = req.user.uid || req.user.id;
  
  const conversations = await chatService.listConversations(userId);
  res.status(200).json({ success: true, conversations });
});

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const userId = req.user.uid || req.user.id;

  const conversation = await chatService.getConversationById(userId, req.params.id);
  res.status(200).json({ success: true, conversation });
});

export const removeConversation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const userId = req.user.uid || req.user.id;

  await chatService.deleteConversation(userId, req.params.id);
  res.status(200).json({ success: true, message: "Conversation deleted" });
});