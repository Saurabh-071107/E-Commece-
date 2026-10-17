import express from "express";
import {
    placeOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus
} from "../controller/order.js";
import { auth, adminAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, placeOrder);
router.get("/", auth, getUserOrders);
router.get("/my-orders", auth, getUserOrders);
router.get("/:id", auth, getOrderById);
router.patch("/:id/cancel", auth, cancelOrder);
router.patch("/:id/status", adminAuth, updateOrderStatus);

export default router;
