import Stripe from "stripe";
import Booking from "../models/booking.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntentHandler = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const booking = await Booking.findById(bookingId).populate("apartmentId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to pay for this booking" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "Booking is already paid" });
    }

    // Amount should be in LKR cents (multiply by 100)
    const amount = Math.round(booking.totalPrice * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "lkr",
      metadata: {
        bookingId: booking._id.toString(),
        userId: booking.userId.toString(),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    res.status(500).json({ message: "Failed to create payment intent", error: error.message });
  }
};
