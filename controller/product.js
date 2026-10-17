import mongoose from "mongoose";
import Product from "../models/product.js";

export const getProducts = async (req, res) => {
    try {
        const { search, category, sort, page = 1, limit = 50 } = req.query;
        let filter = { isActive: { $ne: false } };
        if (category && category !== "All products") {
            filter.category = category;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }
        let sortOption = { createdAt: -1 };
        if (sort === "price-low") sortOption = { price: 1 };
        if (sort === "price-high") sortOption = { price: -1 };
        if (sort === "rating") sortOption = { rating: -1 };
        const skip = (Number(page) - 1) * Number(limit);
        const products = await Product.find(filter).sort(sortOption).skip(skip).limit(Number(limit));
        const total = await Product.countDocuments(filter);
        res.status(200).json({ message: "Products fetched successfully", products, total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Invalid product ID or product not found" });
        }
        const product = await Product.findById(req.params.id);
        if (!product || product.isActive === false) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product fetched successfully", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
