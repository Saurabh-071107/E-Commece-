import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import mongoose from "mongoose";

export const placeOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod = "COD" } = req.body;
        let cartItems = await Cart.find({ userId: req.userId });
        if (!cartItems || cartItems.length === 0) {
            cartItems = req.body.items || [];
        }
        if (cartItems.length === 0) {
            return res.status(400).json({ message: "Your cart is empty" });
        }
        for (const item of cartItems) {
            if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
                const prod = await Product.findById(item.productId);
                if (prod && prod.stock < item.quantity) {
                    return res.status(400).json({ message: `Insufficient stock for ${item.productName || prod.name}` });
                }
            }
        }
        for (const item of cartItems) {
            if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
            }
        }
        const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const order = await Order.create({
            userId: req.userId,
            items: cartItems,
            shippingAddress: shippingAddress || {},
            totalAmount,
            paymentMethod,
            paymentStatus: "Pending",
            orderStatus: "Placed"
        });
        await Cart.deleteMany({ userId: req.userId });
        res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.status(200).json({ message: "Orders fetched successfully", orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json({ message: "Order details fetched successfully", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (["Cancelled", "Delivered", "Shipped"].includes(order.orderStatus)) {
            return res.status(400).json({ message: `Cannot cancel an order that is ${order.orderStatus.toLowerCase()}` });
        }
        order.orderStatus = "Cancelled";
        await order.save();
        for (const item of order.items) {
            if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
            }
        }
        res.status(200).json({ message: "Order cancelled successfully", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: "Please provide order status" });
        }
        const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
