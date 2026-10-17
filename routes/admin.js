import express from "express";
import {
    getDashboardStats,
    getAdminProducts,
    addAdminProduct,
    updateAdminProduct,
    deleteAdminProduct,
    getAdminOrders,
    updateAdminOrderStatus,
    getAdminUsers
} from "../controller/admin.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", adminAuth, getDashboardStats);
router.get("/products", adminAuth, getAdminProducts);
router.post("/products", adminAuth, addAdminProduct);
router.patch("/products/:id", adminAuth, updateAdminProduct);
router.delete("/products/:id", adminAuth, deleteAdminProduct);
router.get("/orders", adminAuth, getAdminOrders);
router.patch("/orders/:id/status", adminAuth, updateAdminOrderStatus);
router.get("/users", adminAuth, getAdminUsers);

export default router;
