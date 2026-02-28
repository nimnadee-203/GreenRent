import { Router } from "express";
import express from "express";
import { stripeWebhookHandler } from "../controllers/stripe.webhook.controller.js";

const router = Router();

// Stripe requires the raw body for signature verification
router.post(
    "/stripe",
    express.raw({ type: "application/json" }),
    stripeWebhookHandler
);

export default router;
