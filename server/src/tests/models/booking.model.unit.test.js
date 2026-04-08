import mongoose from "mongoose";
import Booking from "../../models/booking.model.js";

describe("Booking model", () => {
  test("applies default status, paymentStatus, and paymentDueAt", () => {
    const doc = new Booking({
      userId: "user-1",
      apartmentId: new mongoose.Types.ObjectId(),
      stayType: "short",
      checkInDate: new Date("2030-01-01"),
      checkOutDate: new Date("2030-01-05"),
      numberOfGuests: 2,
    });

    const error = doc.validateSync();
    expect(error).toBeUndefined();
    expect(doc.status).toBe("pending");
    expect(doc.paymentStatus).toBe("unpaid");
    expect(doc.paymentDueAt).toBeInstanceOf(Date);
  });

  test("promotes pending booking to confirmed when paymentStatus becomes paid", async () => {
    const doc = new Booking({
      userId: "user-2",
      apartmentId: new mongoose.Types.ObjectId(),
      stayType: "long",
      checkInDate: new Date("2030-02-01"),
      checkOutDate: new Date("2030-03-01"),
      status: "pending",
      paymentStatus: "paid",
      numberOfGuests: 1,
    });

    await expect(doc.validate()).resolves.toBeUndefined();
    expect(doc.status).toBe("confirmed");
    expect(doc.expiredAt).toBeUndefined();
  });

  test("fails validation when stayType is invalid", () => {
    const doc = new Booking({
      userId: "user-3",
      apartmentId: new mongoose.Types.ObjectId(),
      stayType: "weekly",
      checkInDate: new Date("2030-01-01"),
      checkOutDate: new Date("2030-01-05"),
    });

    const error = doc.validateSync();
    expect(error.errors.stayType).toBeDefined();
  });
});
