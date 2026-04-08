import { jest } from "@jest/globals";

const mockCreateBooking = jest.fn();
const mockGetBookingById = jest.fn();
const mockUpdateBookingStatus = jest.fn();

const mockValidationResult = jest.fn();
const mockCreateValidatorRun = jest.fn();

jest.unstable_mockModule("../../services/booking.service.js", () => ({
  createBooking: mockCreateBooking,
  getAllBookings: jest.fn(),
  getUserBookings: jest.fn(),
  getBookingById: mockGetBookingById,
  updateBooking: jest.fn(),
  updateBookingStatus: mockUpdateBookingStatus,
  updatePaymentStatus: jest.fn(),
  cancelBooking: jest.fn(),
  requestRefund: jest.fn(),
  processRefundByAdmin: jest.fn(),
  rejectRefundByAdmin: jest.fn(),
  expireBookingById: jest.fn(),
  deleteBooking: jest.fn(),
  checkAvailability: jest.fn(),
}));

jest.unstable_mockModule("express-validator", () => ({
  validationResult: mockValidationResult,
}));

jest.unstable_mockModule("../../validators/bookingValidators.js", () => ({
  validateCreateBooking: [{ run: mockCreateValidatorRun }],
  validateUpdateBooking: [],
  handleValidationErrors: jest.fn(),
}));

const {
  createBookingHandler,
  getBookingByIdHandler,
  updateBookingStatusHandler,
} = await import("../../controllers/booking.controller.js");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("booking.controller unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });
    mockCreateValidatorRun.mockResolvedValue(undefined);
  });

  test("createBookingHandler returns 201 and injects authenticated user id", async () => {
    const req = {
      body: { apartmentId: "apt-1", userId: "body-user" },
      user: { id: "auth-user" },
    };
    const res = createRes();
    const created = { _id: "b1", userId: "auth-user" };
    mockCreateBooking.mockResolvedValue(created);

    await createBookingHandler(req, res);

    expect(mockCreateBooking).toHaveBeenCalledWith({ apartmentId: "apt-1", userId: "auth-user" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Booking created successfully", booking: created });
  });

  test("getBookingByIdHandler returns 403 for non-owner non-admin", async () => {
    const req = {
      params: { id: "booking-1" },
      user: { id: "u-2", role: "user" },
    };
    const res = createRes();
    mockGetBookingById.mockResolvedValue({ _id: "booking-1", userId: "u-1" });

    await getBookingByIdHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied. You can only view your own bookings." });
  });

  test("updateBookingStatusHandler validates status and returns 400 for invalid input", async () => {
    const req = {
      params: { id: "booking-1" },
      body: { status: "bad-status" },
      user: { id: "admin-1" },
    };
    const res = createRes();

    await updateBookingStatusHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Status must be one of: pending, confirmed, cancelled, completed, expired",
    });
    expect(mockUpdateBookingStatus).not.toHaveBeenCalled();
  });
});