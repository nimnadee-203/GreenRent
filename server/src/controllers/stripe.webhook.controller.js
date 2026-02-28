import stripe from "../services/stripe.service.js";
import { updateBookingStatus, updatePaymentStatus } from "../services/booking.service.js";
import Booking from "../models/booking.model.js";

/**
 * Handle Stripe Webhooks
 * POST /api/webhooks/stripe
 */
export const stripeWebhookHandler = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        // stripe.webhooks.constructEvent requires the raw body
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object;
            await handleCheckoutSessionCompleted(session);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

const handleCheckoutSessionCompleted = async (session) => {
    const bookingId = session.metadata.bookingId;

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            console.error(`Booking not found for ID: ${bookingId}`);
            return;
        }

        // Update payment status
        await updatePaymentStatus(bookingId, "paid");

        // Update booking status to confirmed if it was pending
        if (booking.status === "pending") {
            await updateBookingStatus(bookingId, "confirmed");
        }

        console.log(`Payment confirmed for booking ${bookingId}`);
    } catch (error) {
        console.error(`Error processing payment for booking ${bookingId}:`, error);
    }
};
