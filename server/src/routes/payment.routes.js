import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { createPaymentIntentHandler } from "../controllers/payment.controller.js";

const router = Router();

router.post("/create-payment-intent", authenticate, createPaymentIntentHandler);

export default router;
