import { Router } from "express";
import { requireAuth } from "@middlewares/auth.middleware";
import { validate } from "@middlewares/validate.middleware";
import { sendMessageSchema } from "./chat.validation";
import {
  postSendMessageStream,
  getConversations,
  getConversation,
  removeConversation,
} from "./chat.controller";

const router = Router();

router.use(requireAuth);

router.get("/conversations", getConversations);
router.get("/conversations/:id", getConversation);
router.delete("/conversations/:id", removeConversation);
router.post("/stream", validate(sendMessageSchema), postSendMessageStream);

export default router;