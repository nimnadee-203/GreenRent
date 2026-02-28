import React, { useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";

// Initialize Stripe (Replace with your actual Stripe publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentButton = ({ bookingId, totalPrice }) => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Create Checkout Session on the backend
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}/payment-session`,
                {},
                { withCredentials: true }
            );

            const { url } = response.data;

            // 2. Redirect to Stripe Checkout
            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No checkout URL received from server");
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error(error.response?.data?.message || "Failed to initiate payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
        >
            {loading ? "Processing..." : `Pay Now ($${totalPrice})`}
        </button>
    );
};

export default PaymentButton;
