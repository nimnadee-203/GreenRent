import ChatMessage from "../models/ChatMessage.js";
import userModel from "../models/userModel.js";

const buildConversationKey = (firstUserId, secondUserId) => {
  return [String(firstUserId), String(secondUserId)].sort().join(":");
};

const canMessageEachOther = (currentRole, targetRole) => {
  if (currentRole === "admin") return targetRole === "seller";
  if (currentRole === "seller") return targetRole === "admin";
  return false;
};

const toSafeContact = (user) => ({
  id: String(user?._id || ""),
  name: user?.name || user?.email || "Anonymous",
  email: user?.email || "",
  role: user?.role,
});

export const listChatContactsHandler = async (req, res) => {
  try {
    const counterpartRole = req.user.role === "admin" ? "seller" : "admin";

    const users = await userModel
      .find({ role: counterpartRole })
      .select("_id name email role")
      .lean();

    const recentMessages = await ChatMessage.find({
      $or: [{ senderId: req.user.id }, { recipientId: req.user.id }],
    })
      .sort({ createdAt: -1 })
      .limit(500)
      .select("senderId senderName senderRole recipientId recipientName recipientRole text createdAt")
      .lean();

    const latestByContactId = new Map();

    for (const message of recentMessages) {
      const isSender = String(message.senderId) === String(req.user.id);
      const contactId = isSender ? String(message.recipientId) : String(message.senderId);
      const contactName = isSender ? message.recipientName : message.senderName;
      const contactRole = isSender ? message.recipientRole : message.senderRole;

      if (!latestByContactId.has(contactId)) {
        latestByContactId.set(contactId, {
          lastMessage: message.text,
          lastMessageAt: message.createdAt,
          name: contactName || "Anonymous",
          role: contactRole,
        });
      }
    }

    const contacts = users
      .map((user) => {
        const base = toSafeContact(user);
        const latest = latestByContactId.get(base.id);
        return {
          ...base,
          lastMessage: latest?.lastMessage || "",
          lastMessageAt: latest?.lastMessageAt || null,
        };
      })
      .sort((first, second) => {
        if (!first.lastMessageAt && !second.lastMessageAt) return first.name.localeCompare(second.name);
        if (!first.lastMessageAt) return 1;
        if (!second.lastMessageAt) return -1;
        return new Date(second.lastMessageAt) - new Date(first.lastMessageAt);
      });

    return res.status(200).json({ contacts });
  } catch (error) {
    console.error("List chat contacts error:", error);
    return res.status(500).json({ message: "Failed to fetch chat contacts" });
  }
};

export const listChatMessagesHandler = async (req, res) => {
  try {
    const contactId = typeof req.query?.contactId === "string" ? req.query.contactId.trim() : "";
    if (!contactId) {
      return res.status(400).json({ message: "contactId query parameter is required" });
    }

    const contact = await userModel.findById(contactId).select("_id name email role").lean();
    if (!contact) {
      return res.status(404).json({ message: "Chat contact not found" });
    }

    if (String(contact._id) === String(req.user.id)) {
      return res.status(400).json({ message: "You cannot open a chat with yourself" });
    }

    if (!canMessageEachOther(req.user.role, contact.role)) {
      return res.status(403).json({ message: "Chat is only allowed between admin and landlord accounts" });
    }

    const conversationKey = buildConversationKey(req.user.id, contact._id);

    const messages = await ChatMessage.find({ conversationKey })
      .sort({ createdAt: 1 })
      .limit(300)
      .select("-__v");

    return res.status(200).json({
      contact: toSafeContact(contact),
      messages,
    });
  } catch (error) {
    console.error("List chat messages error:", error);
    return res.status(500).json({ message: "Failed to fetch chat messages" });
  }
};

export const sendChatMessageHandler = async (req, res) => {
  try {
    const recipientId = typeof req.body?.recipientId === "string" ? req.body.recipientId.trim() : "";
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

    if (!recipientId) {
      return res.status(400).json({ message: "recipientId is required" });
    }
    if (!text) {
      return res.status(400).json({ message: "text is required" });
    }
    if (text.length > 1000) {
      return res.status(400).json({ message: "text must be 1000 characters or less" });
    }

    const recipient = await userModel.findById(recipientId).select("_id name email role").lean();
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (String(recipient._id) === String(req.user.id)) {
      return res.status(400).json({ message: "You cannot send messages to yourself" });
    }

    if (!canMessageEachOther(req.user.role, recipient.role)) {
      return res.status(403).json({ message: "Chat is only allowed between admin and landlord accounts" });
    }

    const conversationKey = buildConversationKey(req.user.id, recipient._id);

    const message = await ChatMessage.create({
      conversationKey,
      senderId: req.user.id,
      senderName: req.user.name || "Anonymous",
      senderRole: req.user.role,
      recipientId: String(recipient._id),
      recipientName: recipient.name || recipient.email || "Anonymous",
      recipientRole: recipient.role,
      text,
    });

    return res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    console.error("Send chat message error:", error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};

export const sendBroadcastMessageHandler = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can send broadcast messages" });
    }

    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text) {
      return res.status(400).json({ message: "text is required" });
    }
    if (text.length > 1000) {
      return res.status(400).json({ message: "text must be 1000 characters or less" });
    }

    const sellers = await userModel.find({ role: "seller" }).select("_id name email role").lean();
    if (sellers.length === 0) {
      return res.status(400).json({ message: "No landlords found to broadcast to" });
    }

    const messagesToInsert = sellers.map((recipient) => {
      const conversationKey = buildConversationKey(req.user.id, recipient._id);
      return {
        conversationKey,
        senderId: req.user.id,
        senderName: req.user.name || "Anonymous",
        senderRole: req.user.role,
        recipientId: String(recipient._id),
        recipientName: recipient.name || recipient.email || "Anonymous",
        recipientRole: recipient.role,
        text,
      };
    });

    await ChatMessage.insertMany(messagesToInsert);

    return res.status(201).json({ message: `Broadcast successfully sent to ${sellers.length} landlords` });
  } catch (error) {
    console.error("Send broadcast message error:", error);
    return res.status(500).json({ message: "Failed to send broadcast message" });
  }
};
