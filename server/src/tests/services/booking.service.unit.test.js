import { jest } from "@jest/globals";

const mockBookingFindById = jest.fn();
const mockBookingFindByIdAndUpdate = jest.fn();
const mockBookingFindOne = jest.fn();
const mockPropertyFindById = jest.fn();

jest.unstable_mockModule("../../models/booking.model.js", () => ({
  default: {
    findById: mockBookingFindById,
    findByIdAndUpdate: mockBookingFindByIdAndUpdate,
    findOne: mockBookingFindOne,
    create: jest.fn(),
    find: jest.fn(),
    updateMany: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.unstable_mockModule("../../models/Property.js", () => ({
  default: {
    findById: mockPropertyFindById,
  },
}));

jest.unstable_mockModule("../../models/userModel.js", () => ({
  default: {
    find: jest.fn(),
  },
}));

const {
  calculateTotalPrice,
  checkAvailability,
  updatePaymentStatus,
} = await import("../../services/booking.service.js");

describe("booking.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calculateTotalPrice uses daily rate for short stays", () => {
    const total = calculateTotalPrice(
      "short",
      new Date("2030-01-01"),
      new Date("2030-01-04"),
      { dailyPrice: 100 }
    );

    expect(total).toBe(300);
  });

  test("calculateTotalPrice uses explicit months for long stays", () => {
    const total = calculateTotalPrice(
      "long",
      new Date("2030-01-01"),
      new Date("2030-04-01"),
      { monthlyPrice: 1500 },
      { months: 2 }
    );

    expect(total).toBe(3000);
  });

  test("checkAvailability returns false when property is not available", async () => {
    mockPropertyFindById.mockResolvedValue({ _id: "p1", availabilityStatus: "rented" });

    const result = await checkAvailability("p1", "2030-01-01", "2030-01-05");
    expect(result).toBe(false);
    expect(mockBookingFindOne).not.toHaveBeenCalled();
  });

  test("updatePaymentStatus paid flow confirms booking and clears cancellation reason", async () => {
    mockBookingFindById.mockResolvedValue({ _id: "b1", status: "pending" });
    mockBookingFindByIdAndUpdate.mockResolvedValue({ _id: "b1", paymentStatus: "paid" });

    await updatePaymentStatus("b1", "paid");

    expect(mockBookingFindByIdAndUpdate).toHaveBeenCalledWith(
      "b1",
      {
        $set: expect.objectContaining({
          paymentStatus: "paid",
          status: "confirmed",
          paymentDueAt: null,
          expiredAt: null,
        }),
        $unset: { cancellationReason: 1 },
      },
      { returnDocument: "after", runValidators: true }
    );
  });
});
