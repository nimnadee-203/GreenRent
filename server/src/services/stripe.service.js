import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout Session for a booking
 * @param {Object} booking - Booking document
 * @param {Object} property - Property document
 * @returns {Promise<Object>} - Stripe session object
 */
export const createCheckoutSession = async (booking, property) => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not configured in .env");
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: property.title,
                        description: `${booking.stayType === "short" ? "Short" : "Long"} stay at ${property.location.address}`,
                    },
                    unit_amount: booking.totalPrice * 100, // Stripe expects amount in cents
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        metadata: {
            bookingId: booking._id.toString(),
            userId: booking.userId.toString(),
        },
    });

    return session;
};

export default stripe;
