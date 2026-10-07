import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    CreatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('user', userSchema);