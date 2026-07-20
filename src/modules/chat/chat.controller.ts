import { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiError } from "@utils/ApiError";
import * as chatService from "./chat.service";
import { SendMessageInput } from "./chat.validation";

export const postSendMessageStream = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const { conversationId, message } = req.body as SendMessageInput;
  const conversation = await chatService.getOrCreateConversation(req.user.id, conversationId);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  // Let the client know which conversation this stream belongs to
  // immediately, so a first-time chat can start rendering under the right ID.
  res.write(`event: init\ndata: ${JSON.stringify({ conversationId: conversation._id })}\n\n`);

  try {
    const { suggestedFollowUps } = await chatService.streamChatReply(
      req.user.id,
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
  const conversations = await chatService.listConversations(req.user.id);
  res.status(200).json({ success: true, conversations });
});

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const conversation = await chatService.getConversationById(req.user.id, req.params.id);
  res.status(200).json({ success: true, conversation });
});

export const removeConversation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await chatService.deleteConversation(req.user.id, req.params.id);
  res.status(200).json({ success: true, message: "Conversation deleted" });
});
