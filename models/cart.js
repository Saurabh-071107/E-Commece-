import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId: { type: String },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    productImage: { type: String, required: true },
});

export default mongoose.model("cart", cartSchema);
