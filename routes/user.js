import express from 'express';
import { registerUser, login } from '../controller/user.js';
import { auth } from '../middleware/auth.js';
import User from '../models/user.js';

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.post("/user", login);
router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;