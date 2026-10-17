import Product from "../models/product.js";
import Order from "../models/order.js";
import User from "../models/user.js";

export const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const orders = await Order.find();
        const totalSales = orders.reduce((sum, o) => (o.orderStatus !== "Cancelled" ? sum + (o.totalAmount || 0) : sum), 0);
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
        res.status(200).json({
            totalSales,
            totalOrders,
            totalUsers,
            totalProducts,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        let filter = {};
        if (category && category !== "All products") {
            filter.category = category;
        }
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }
        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ message: "Products fetched successfully", products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addAdminProduct = async (req, res) => {
    try {
        const { name, category, price, stock, description, image, oldPrice, gallery, color, badge } = req.body;
        if (!name || !category || !price || !description || !image) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }
        const product = await Product.create({
            name,
            category,
            price: Number(price),
            stock: Number(stock) || 0,
            description,
            image,
            oldPrice: oldPrice ? Number(oldPrice) : null,
            gallery: gallery || [image],
            color,
            badge
        });
        res.status(201).json({ message: "Product added successfully", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAdminProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAdminProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({ message: "Orders fetched successfully", orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAdminOrderStatus = async (req, res) => {
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

export const getAdminUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ CreatedAt: -1 });
        res.status(200).json({ message: "Users fetched successfully", users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
