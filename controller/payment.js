import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/order.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder"
});

export const createPaymentOrder = async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ message: "Valid amount is required" });
        }
        const options = {
            amount: Math.round(Number(amount) * 100),
            currency,
            receipt: receipt || `rcpt_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        res.status(200).json({ message: "Payment order created", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "All signature fields are required" });
        }
        const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid payment signature", success: false });
        }
        if (orderId) {
            const existingOrder = await Order.findById(orderId);
            if (existingOrder && existingOrder.paymentStatus === "Paid") {
                return res.status(200).json({ message: "Order payment already verified", success: true });
            }
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: "Paid",
                paymentMethod: "Razorpay"
            });
        }
        res.status(200).json({ message: "Payment verified successfully", success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const handleWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";
        const signature = req.headers["x-razorpay-signature"];
        const expectedSignature = crypto.createHmac("sha256", secret).update(JSON.stringify(req.body)).digest("hex");
        if (signature && expectedSignature !== signature) {
            return res.status(400).json({ message: "Invalid webhook signature" });
        }
        const event = req.body.event;
        if (event === "payment.captured") {
            const payment = req.body.payload?.payment?.entity;
            if (payment?.notes?.orderId) {
                const existingOrder = await Order.findById(payment.notes.orderId);
                if (existingOrder && existingOrder.paymentStatus !== "Paid") {
                    await Order.findByIdAndUpdate(payment.notes.orderId, { paymentStatus: "Paid" });
                }
            }
        }
        res.status(200).json({ status: "ok" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
