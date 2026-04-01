import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    conversationKey: {
      type: String,
      required: true,
      trim: true,
    },
    senderId: {
      type: String,
      required: true,
      trim: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
      default: "Anonymous",
    },
    senderRole: {
      type: String,
      enum: ["seller", "admin"],
      required: true,
    },
    recipientId: {
      type: String,
      required: true,
      trim: true,
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
      default: "Anonymous",
    },
    recipientRole: {
      type: String,
      enum: ["seller", "admin"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ conversationKey: 1, createdAt: 1 });
chatMessageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
chatMessageSchema.index({ recipientId: 1, createdAt: -1 });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
