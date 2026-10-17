import Address from "../models/address.js";

export const addAddress = async (req, res) => {
    try {
        const { fullName, phone, address, city, state, pincode, isDefault } = req.body;
        if (!fullName || !phone || !address || !city || !state || !pincode) {
            return res.status(400).json({ message: "Please fill all required address fields" });
        }
        if (isDefault) {
            await Address.updateMany({ userId: req.userId }, { isDefault: false });
        }
        const newAddress = await Address.create({
            userId: req.userId,
            fullName,
            phone,
            address,
            city,
            state,
            pincode,
            isDefault: Boolean(isDefault)
        });
        res.status(201).json({ message: "Address added successfully", address: newAddress });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.userId }).sort({ isDefault: -1, createdAt: -1 });
        res.status(200).json({ message: "Addresses fetched successfully", addresses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAddressById = async (req, res) => {
    try {
        const address = await Address.findOne({ _id: req.params.id, userId: req.userId });
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }
        res.status(200).json({ message: "Address fetched successfully", address });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAddress = async (req, res) => {
    try {
        if (req.body.isDefault) {
            await Address.updateMany({ userId: req.userId }, { isDefault: false });
        }
        const updatedAddress = await Address.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true }
        );
        if (!updatedAddress) {
            return res.status(404).json({ message: "Address not found" });
        }
        res.status(200).json({ message: "Address updated successfully", address: updatedAddress });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const deletedAddress = await Address.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!deletedAddress) {
            return res.status(404).json({ message: "Address not found" });
        }
        res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const setDefaultAddress = async (req, res) => {
    try {
        await Address.updateMany({ userId: req.userId }, { isDefault: false });
        const defaultAddress = await Address.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { isDefault: true },
            { new: true }
        );
        if (!defaultAddress) {
            return res.status(404).json({ message: "Address not found" });
        }
        res.status(200).json({ message: "Default address updated successfully", address: defaultAddress });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
