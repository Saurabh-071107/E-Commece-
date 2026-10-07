import express from 'express'
import { registerUser , login } from '../controller/user.js'

const router = express.Router();

router.post("/register" , registerUser);
router.post("/user" , login);
export default router ;