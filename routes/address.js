import express from "express";
import {
    addAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from "../controller/address.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, addAddress);
router.get("/", auth, getAddresses);
router.get("/:id", auth, getAddressById);
router.patch("/:id/default", auth, setDefaultAddress);
router.patch("/:id", auth, updateAddress);
router.delete("/:id", auth, deleteAddress);

export default router;
