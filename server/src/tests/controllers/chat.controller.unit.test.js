import { jest } from "@jest/globals";

const mockUserFindById = jest.fn();
const mockUserFind = jest.fn();
const mockChatFind = jest.fn();
const mockChatCreate = jest.fn();
const mockChatInsertMany = jest.fn();

jest.unstable_mockModule("../../models/userModel.js", () => ({
  default: {
    findById: mockUserFindById,
    find: mockUserFind,
  },
}));

jest.unstable_mockModule("../../models/ChatMessage.js", () => ({
  default: {
    find: mockChatFind,
    create: mockChatCreate,
    insertMany: mockChatInsertMany,
  },
}));

const {
  sendChatMessageHandler,
  sendBroadcastMessageHandler,
  listChatMessagesHandler,
} = await import("../../controllers/chat.controller.js");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeChain = (result) => ({
  select: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(result),
});

describe("chat.controller unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("sendChatMessageHandler returns 400 when text is missing", async () => {
    const req = {
      body: { recipientId: "seller-1" },
      user: { id: "admin-1", role: "admin", name: "Admin" },
    };
    const res = createRes();

    await sendChatMessageHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "text is required" });
    expect(mockChatCreate).not.toHaveBeenCalled();
  });

  test("listChatMessagesHandler returns 403 when roles cannot message", async () => {
    const req = {
      query: { contactId: "user-2" },
      user: { id: "user-1", role: "seller" },
    };
    const res = createRes();

    mockUserFindById.mockReturnValue(makeChain({ _id: "user-2", role: "seller" }));

    await listChatMessagesHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Chat is only allowed between admin and landlord accounts" });
  });

  test("sendBroadcastMessageHandler inserts one message per seller", async () => {
    const req = {
      body: { text: "System maintenance tonight" },
      user: { id: "admin-1", role: "admin", name: "Admin" },
    };
    const res = createRes();
    const sellers = [
      { _id: "s1", name: "S One", email: "s1@mail.com", role: "seller" },
      { _id: "s2", name: "S Two", email: "s2@mail.com", role: "seller" },
    ];
    mockUserFind.mockReturnValue(makeChain(sellers));

    await sendBroadcastMessageHandler(req, res);

    expect(mockChatInsertMany).toHaveBeenCalledTimes(1);
    expect(mockChatInsertMany.mock.calls[0][0]).toHaveLength(2);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Broadcast successfully sent to 2 landlords" });
  });
});