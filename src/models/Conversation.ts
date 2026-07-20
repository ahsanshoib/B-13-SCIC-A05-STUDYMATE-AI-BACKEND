import { Schema, model, models, Document, Model } from "mongoose";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface ConversationDocument extends Document {
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<ChatMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new Schema<ConversationDocument>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, default: "New conversation" },
    messages: { type: [chatMessageSchema], default: [] },
  },
  { timestamps: true }
);

conversationSchema.index({ userId: 1, updatedAt: -1 });

export const ConversationModel: Model<ConversationDocument> =
  models.Conversation || model<ConversationDocument>("Conversation", conversationSchema);