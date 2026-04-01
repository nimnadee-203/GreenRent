import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { listChatContactsHandler, listChatMessagesHandler, sendChatMessageHandler, sendBroadcastMessageHandler } from "../controllers/chat.controller.js";

const router = Router();

router.get("/contacts", authenticate, authorize("seller", "admin"), listChatContactsHandler);
router.get("/messages", authenticate, authorize("seller", "admin"), listChatMessagesHandler);
router.post("/messages", authenticate, authorize("seller", "admin"), sendChatMessageHandler);
router.post("/broadcast", authenticate, authorize("admin"), sendBroadcastMessageHandler);

export default router;

