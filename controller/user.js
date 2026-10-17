import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "#%$*$%^@%*#&";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, mobileNumber, role = "user" } = req.body;
        if (!name || !email || !password || !mobileNumber) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        const exists = await User.findOne({ $or: [{ email }, { mobileNumber }] });
        if (exists) {
            return res.status(400).json({ message: "User already exists with this email or mobile number" });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash, mobileNumber, role });
        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, mobileNumber, password } = req.body;
        if ((!email && !mobileNumber) || !password) {
            return res.status(400).json({ message: "Enter all the fields" });
        }
        const user = await User.findOne(email ? { email } : { mobileNumber });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Enter correct password" });
        }
        const token = jwt.sign({ userId: user._id, role: user.role || "user" }, JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({
            message: "User is logged in successfully",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role || "user" },
            success: true
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};