import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

let allowAuth = true;
let allowRole = true;

const handlers = {
  listChatContactsHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  listChatMessagesHandler: jest.fn((req, res) => res.status(200).json({ ok: true })),
  sendChatMessageHandler: jest.fn((req, res) => res.status(201).json({ ok: true })),
  sendBroadcastMessageHandler: jest.fn((req, res) => res.status(201).json({ ok: true })),
};

jest.unstable_mockModule("../../middleware/auth.js", () => ({
  authenticate: (req, res, next) => {
    if (!allowAuth) return res.status(401).json({ message: "unauthorized" });
    req.user = { role: "admin" };
    return next();
  },
  authorize: () => (req, res, next) => {
    if (!allowRole) return res.status(403).json({ message: "forbidden" });
    return next();
  },
}));

jest.unstable_mockModule("../../controllers/chat.controller.js", () => handlers);

const { default: chatRoutes } = await import("../../routes/chat.routes.js");

const app = express();
app.use(express.json());
app.use("/api/chat", chatRoutes);

describe("chat.routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    allowAuth = true;
    allowRole = true;
  });

  test("GET /contacts requires auth", async () => {
    allowAuth = false;
    const res = await request(app).get("/api/chat/contacts");
    expect(res.status).toBe(401);
  });

  test("POST /messages reaches handler when allowed", async () => {
    const res = await request(app).post("/api/chat/messages").send({ text: "x" });
    expect(res.status).toBe(201);
    expect(handlers.sendChatMessageHandler).toHaveBeenCalled();
  });

  test("POST /broadcast blocked by role middleware", async () => {
    allowRole = false;
    const res = await request(app).post("/api/chat/broadcast").send({ text: "x" });
    expect(res.status).toBe(403);
    expect(handlers.sendBroadcastMessageHandler).not.toHaveBeenCalled();
  });
});
