import Cart from "../models/cart.js";

export const addProduct = async (req, res) => {
    try {
        const { productId, productName, price, quantity, productImage } = req.body;
        if (!productId || !productName || !price || !quantity || !productImage) {
            return res.status(400).json({ message: "Please fill all product fields" });
        }
        let item = await Cart.findOne({ productId, userId: req.userId });
        if (item) {
            item.quantity += Number(quantity);
            await item.save();
            return res.status(200).json({ message: "Product quantity increased in cart", cart: item });
        }
        const cart = await Cart.create({
            userId: req.userId,
            productId,
            productName,
            price,
            quantity,
            productImage
        });
        res.status(201).json({ message: "Product added to cart successfully", cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const removeProduct = async (req, res) => {
    try {
        const productId = req.params.productId || req.body.productId;
        if (!productId) {
            return res.status(400).json({ message: "Please provide productId" });
        }
        const deleted = await Cart.deleteOne({ productId, userId: req.userId });
        if (deleted.deletedCount === 0) {
            return res.status(404).json({ message: "Product not found in cart" });
        }
        res.status(200).json({ message: "Product removed from cart successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        await Cart.deleteMany({ userId: req.userId });
        res.status(200).json({ message: "Cart cleared successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({ message: "Please provide productId and quantity" });
        }
        let item = await Cart.findOne({ productId, userId: req.userId });
        if (!item) {
            return res.status(404).json({ message: "Product not found in cart" });
        }
        item.quantity = Number(quantity);
        await item.save();
        res.status(200).json({ message: "Cart quantity updated successfully", cart: item });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const items = await Cart.find({ userId: req.userId });
        res.status(200).json({ message: "Cart fetched successfully", cart: items });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};