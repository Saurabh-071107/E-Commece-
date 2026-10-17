import express from "express";
import { createPaymentOrder, verifyPayment, handleWebhook } from "../controller/payment.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-order", auth, createPaymentOrder);
router.post("/verify", auth, verifyPayment);
router.post("/webhook", handleWebhook);

export default router;
