import ChatMessage from "../../models/ChatMessage.js";

describe("ChatMessage model", () => {
  test("validates a correct admin-to-seller message", () => {
    const doc = new ChatMessage({
      conversationKey: "admin-1:seller-1",
      senderId: "admin-1",
      senderName: "Admin",
      senderRole: "admin",
      recipientId: "seller-1",
      recipientName: "Seller",
      recipientRole: "seller",
      text: "Hello, please update your listing details.",
    });

    const error = doc.validateSync();
    expect(error).toBeUndefined();
  });

  test("fails validation when text is longer than 1000 characters", () => {
    const doc = new ChatMessage({
      conversationKey: "admin-1:seller-1",
      senderId: "admin-1",
      senderRole: "admin",
      recipientId: "seller-1",
      recipientRole: "seller",
      text: "a".repeat(1001),
    });

    const error = doc.validateSync();
    expect(error.errors.text).toBeDefined();
  });

  test("fails validation for unsupported role", () => {
    const doc = new ChatMessage({
      conversationKey: "user-1:seller-1",
      senderId: "user-1",
      senderRole: "user",
      recipientId: "seller-1",
      recipientRole: "seller",
      text: "Hi",
    });

    const error = doc.validateSync();
    expect(error.errors.senderRole).toBeDefined();
  });
});
