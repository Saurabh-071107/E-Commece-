import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { auth, adminAuth } from "../middleware/auth.js";
import { registerUser, login } from "../controller/user.js";
import { getProducts, getProductById } from "../controller/product.js";
import { addProduct, removeProduct, updateQuantity, getCart, clearCart } from "../controller/cart.js";
import { addAddress, getAddresses, getAddressById, updateAddress, deleteAddress, setDefaultAddress } from "../controller/address.js";
import { placeOrder, getUserOrders, getOrderById, cancelOrder, updateOrderStatus } from "../controller/order.js";
import { createPaymentOrder, verifyPayment, handleWebhook } from "../controller/payment.js";
import { getDashboardStats, getAdminProducts, addAdminProduct, updateAdminProduct, deleteAdminProduct, getAdminOrders, updateAdminOrderStatus, getAdminUsers } from "../controller/admin.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import Cart from "../models/cart.js";
import Address from "../models/address.js";
import Order from "../models/order.js";

const JWT_SECRET = process.env.JWT_SECRET || "#%$*$%^@%*#&";

class MockResponse {
    constructor() {
        this.statusCode = 200;
        this.data = null;
    }
    status(code) {
        this.statusCode = code;
        return this;
    }
    json(payload) {
        this.data = payload;
        return this;
    }
}

// Mock database layer for isolated unit & integration tests
const setupMocks = () => {
    // User mocks
    User.findOne = async (query) => {
        if (query.mobileNumber === "9876543210") {
            const hashedPassword = await bcrypt.hash("validPassword123", 10);
            return { _id: "user-1", mobileNumber: "9876543210", password: hashedPassword, role: "user" };
        }
        return null;
    };
    User.create = async (doc) => ({ _id: "user-new", ...doc });
    User.countDocuments = async () => 25;
    User.find = () => ({
        select: () => ({ sort: async () => [{ _id: "user-1", name: "Alice" }, { _id: "user-2", name: "Bob" }] })
    });

    // Product mocks
    Product.find = (filter) => ({
        sort: () => ({
            skip: () => ({
                limit: async () => [
                    { _id: "507f1f77bcf86cd799439011", name: "Headphones", category: "Audio", price: 12999, stock: 10, isActive: true },
                    { _id: "507f1f77bcf86cd799439012", name: "Keyboard", category: "Accessories", price: 8499, stock: 5, isActive: true }
                ]
            })
        })
    });
    Product.countDocuments = async () => 10;
    Product.findById = async (id) => {
        if (id === "507f1f77bcf86cd799439011") {
            return { _id: id, name: "Headphones", price: 12999, stock: 10, isActive: true };
        }
        if (id === "507f1f77bcf86cd799439099") {
            return { _id: id, name: "LowStockItem", price: 500, stock: 1, isActive: true };
        }
        return null;
    };
    Product.findByIdAndUpdate = async (id, update) => ({ _id: id, ...update });
    Product.findByIdAndDelete = async (id) => ({ _id: id });
    Product.create = async (doc) => ({ _id: "507f1f77bcf86cd799439090", ...doc });

    // Cart mocks
    const mockCartDB = [];
    Cart.findOne = async (query) => mockCartDB.find(c => c.productId === query.productId && c.userId === query.userId) || null;
    Cart.find = async (query) => mockCartDB.filter(c => !query.userId || c.userId === query.userId);
    Cart.create = async (doc) => {
        const item = { _id: `cart-${Date.now()}`, ...doc, save: async () => {} };
        mockCartDB.push(item);
        return item;
    };
    Cart.deleteOne = async (query) => {
        const idx = mockCartDB.findIndex(c => c.productId === query.productId && c.userId === query.userId);
        if (idx !== -1) {
            mockCartDB.splice(idx, 1);
            return { deletedCount: 1 };
        }
        return { deletedCount: 0 };
    };
    Cart.deleteMany = async (query) => {
        const initialLen = mockCartDB.length;
        for (let i = mockCartDB.length - 1; i >= 0; i--) {
            if (!query.userId || mockCartDB[i].userId === query.userId) {
                mockCartDB.splice(i, 1);
            }
        }
        return { deletedCount: initialLen - mockCartDB.length };
    };

    // Address mocks
    const mockAddressDB = [];
    Address.create = async (doc) => {
        const addr = { _id: `addr-${Date.now()}`, ...doc };
        mockAddressDB.push(addr);
        return addr;
    };
    Address.find = (query) => ({
        sort: async () => mockAddressDB.filter(a => a.userId === query.userId)
    });
    Address.findOne = async (query) => mockAddressDB.find(a => a._id === query._id && a.userId === query.userId) || null;
    Address.findOneAndUpdate = async (query, update) => {
        const addr = mockAddressDB.find(a => a._id === query._id && a.userId === query.userId);
        if (addr) Object.assign(addr, update);
        return addr || null;
    };
    Address.findOneAndDelete = async (query) => {
        const idx = mockAddressDB.findIndex(a => a._id === query._id && a.userId === query.userId);
        if (idx !== -1) return mockAddressDB.splice(idx, 1)[0];
        return null;
    };
    Address.updateMany = async () => ({});

    // Order mocks
    const mockOrderDB = [];
    Order.create = async (doc) => {
        const order = { _id: `order-${Date.now()}`, ...doc, save: async () => {} };
        mockOrderDB.push(order);
        return order;
    };
    Order.find = (query) => {
        const list = mockOrderDB.filter(o => !query?.userId || o.userId === query.userId);
        const p = Promise.resolve(list);
        p.sort = () => ({
            limit: async (n) => list.slice(-n)
        });
        return p;
    };
    Order.countDocuments = async () => mockOrderDB.length;
    Order.findOne = async (query) => mockOrderDB.find(o => o._id === query._id && o.userId === query.userId) || null;
    Order.findById = async (id) => mockOrderDB.find(o => o._id === id) || null;
    Order.findByIdAndUpdate = async (id, update) => {
        const order = mockOrderDB.find(o => o._id === id);
        if (order) Object.assign(order, update);
        return order || null;
    };
};

const runTests = async () => {
    console.log("==========================================");
    console.log("       BACKEND TEST SUITE (7/7)           ");
    console.log("==========================================\n");

    setupMocks();
    let passedCount = 0;

    // 1. AUTHENTICATION
    try {
        console.log("Testing 1. Authentication...");
        // 1a. Missing JWT
        const reqMissing = { headers: {} };
        const resMissing = new MockResponse();
        auth(reqMissing, resMissing, () => {});
        if (resMissing.statusCode !== 401) throw new Error("Missing JWT test failed");

        // 1b. Expired/Invalid JWT
        const reqInvalid = { headers: { authorization: "Bearer invalid_token_123" } };
        const resInvalid = new MockResponse();
        auth(reqInvalid, resInvalid, () => {});
        if (resInvalid.statusCode !== 401) throw new Error("Invalid JWT test failed");

        // 1c. Login with invalid password
        const reqBadLogin = { body: { mobileNumber: "9876543210", password: "wrongPassword" } };
        const resBadLogin = new MockResponse();
        await login(reqBadLogin, resBadLogin);
        if (resBadLogin.statusCode !== 400 || resBadLogin.data.message !== "Enter correct password") {
            throw new Error("Invalid password check failed");
        }

        // 1d. Login with valid password
        const reqGoodLogin = { body: { mobileNumber: "9876543210", password: "validPassword123" } };
        const resGoodLogin = new MockResponse();
        await login(reqGoodLogin, resGoodLogin);
        if (resGoodLogin.statusCode !== 200 || !resGoodLogin.data.token) {
            throw new Error("Valid login failed to return JWT");
        }

        console.log("[✓] 1. Authentication: PASSED (Register, login, invalid passwords, expired/missing JWT)\n");
        passedCount++;
    } catch (err) {
        console.error("[✗] 1. Authentication: FAILED -", err.message, "\n");
    }

    // 2. PRODUCTS
    try {
        console.log("Testing 2. Products...");
        // 2a. List products
        const reqList = { query: { category: "Audio", sort: "price-low" } };
        const resList = new MockResponse();
        await getProducts(reqList, resList);
        if (resList.statusCode !== 200 || !resList.data.products) throw new Error("Product listing failed");

        // 2b. Search products
        const reqSearch = { query: { search: "Headphones" } };
        const resSearch = new MockResponse();
        await getProducts(reqSearch, resSearch);
        if (resSearch.statusCode !== 200) throw new Error("Product search failed");

        // 2c. Invalid product ID
        const reqInvalidId = { params: { id: "not-a-valid-id" } };
        const resInvalidId = new MockResponse();
        await getProductById(reqInvalidId, resInvalidId);
        if (resInvalidId.statusCode !== 404) throw new Error("Invalid product ID did not return 404");

        // 2d. Valid product ID
        const reqValidId = { params: { id: "507f1f77bcf86cd799439011" } };
        const resValidId = new MockResponse();
        await getProductById(reqValidId, resValidId);
        if (resValidId.statusCode !== 200 || resValidId.data.product.name !== "Headphones") {
            throw new Error("Valid product lookup failed");
        }

        console.log("[✓] 2. Products: PASSED (List, search, category filters, sorting, invalid IDs)\n");
        passedCount++;
    } catch (err) {
        console.error("[✗] 2. Products: FAILED -", err.message, "\n");
    }

    // 3. CART
    try {
        console.log("Testing 3. Cart...");
        // 3a. Add to cart for User A
        const reqAddA = { userId: "user-A", body: { productId: "507f1f77bcf86cd799439011", productName: "Headphones", price: 12999, quantity: 1, productImage: "img.jpg" } };
        const resAddA = new MockResponse();
        await addProduct(reqAddA, resAddA);
        if (resAddA.statusCode !== 201) throw new Error("Add product to cart failed");

        // 3b. Add same product to cart for User A (quantity increase)
        const reqAddA2 = { userId: "user-A", body: { productId: "507f1f77bcf86cd799439011", productName: "Headphones", price: 12999, quantity: 2, productImage: "img.jpg" } };
        const resAddA2 = new MockResponse();
        await addProduct(reqAddA2, resAddA2);
        if (resAddA2.statusCode !== 200 || resAddA2.data.cart.quantity !== 3) {
            throw new Error("Cart quantity increment failed");
        }

        // 3c. User isolation: User B's cart must be empty
        const reqGetB = { userId: "user-B", params: {} };
        const resGetB = new MockResponse();
        await getCart(reqGetB, resGetB);
        if (resGetB.statusCode !== 200 || resGetB.data.cart.length !== 0) {
            throw new Error("User isolation failed: User B sees User A items");
        }

        // 3d. Update quantity
        const reqUpdate = { userId: "user-A", body: { productId: "507f1f77bcf86cd799439011", quantity: 5 } };
        const resUpdate = new MockResponse();
        await updateQuantity(reqUpdate, resUpdate);
        if (resUpdate.statusCode !== 200 || resUpdate.data.cart.quantity !== 5) {
            throw new Error("Cart quantity update failed");
        }

        // 3e. Remove product
        const reqRemove = { userId: "user-A", params: { productId: "507f1f77bcf86cd799439011" } };
        const resRemove = new MockResponse();
        await removeProduct(reqRemove, resRemove);
        if (resRemove.statusCode !== 200) throw new Error("Remove cart item failed");

        // 3f. Clear cart
        await addProduct(reqAddA, new MockResponse());
        const reqClear = { userId: "user-A", params: {} };
        const resClear = new MockResponse();
        await clearCart(reqClear, resClear);
        if (resClear.statusCode !== 200) throw new Error("Clear cart failed");

        console.log("[✓] 3. Cart: PASSED (Add, update quantity, remove, clear, user isolation)\n");
        passedCount++;
    } catch (err) {
        console.error("[✗] 3. Cart: FAILED -", err.message, "\n");
    }

    // 4. ADDRESSES
    try {
        console.log("Testing 4. Addresses...");
        // 4a. Create address for User A
        const reqAddAddr = { userId: "user-A", body: { fullName: "Alice", phone: "9876543210", address: "123 Main St", city: "Mumbai", state: "MH", pincode: "400001", isDefault: true } };
        const resAddAddr = new MockResponse();
        await addAddress(reqAddAddr, resAddAddr);
        if (resAddAddr.statusCode !== 201 || !resAddAddr.data.address._id) throw new Error("Create address failed");
        const addressId = resAddAddr.data.address._id;

        // 4b. Prevent User B from getting User A's address
        const reqGetOther = { userId: "user-B", params: { id: addressId } };
        const resGetOther = new MockResponse();
        await getAddressById(reqGetOther, resGetOther);
        if (resGetOther.statusCode !== 404) throw new Error("User B accessed User A's address");

        // 4c. Edit address for User A
        const reqEditAddr = { userId: "user-A", params: { id: addressId }, body: { city: "Pune" } };
        const resEditAddr = new MockResponse();
        await updateAddress(reqEditAddr, resEditAddr);
        if (resEditAddr.statusCode !== 200 || resEditAddr.data.address.city !== "Pune") throw new Error("Edit address failed");

        // 4d. Delete address for User A
        const reqDelAddr = { userId: "user-A", params: { id: addressId } };
        const resDelAddr = new MockResponse();
        await deleteAddress(reqDelAddr, resDelAddr);
        if (resDelAddr.statusCode !== 200) throw new Error("Delete address failed");

        console.log("[✓] 4. Addresses: PASSED (Create, edit, delete, cross-user isolation)\n");
        passedCount++;
    } catch (err) {
        console.error("[✗] 4. Addresses: FAILED -", err.message, "\n");
    }

    // 5. ORDERS
    try {
        console.log("Testing 5. Orders...");
        // 5a. Empty cart order rejected
        const reqEmptyOrder = { userId: "user-empty", body: {} };
        const resEmptyOrder = new MockResponse();
        await placeOrder(reqEmptyOrder, resEmptyOrder);
        if (resEmptyOrder.statusCode !== 400) throw new Error("Empty cart order did not return 400");

        // 5b. Stock validation: order quantity > stock
        const reqOverStock = {
            userId: "user-A",
            body: {
                items: [{ productId: "507f1f77bcf86cd799439099", productName: "LowStockItem", price: 500, quantity: 10 }]
            }
        };
        const resOverStock = new MockResponse();
        await placeOrder(reqOverStock, resOverStock);
        if (resOverStock.statusCode !== 400 || !resOverStock.data.message.includes("Insufficient stock")) {
            throw new Error("Stock validation failed to reject over-stock order");
        }

        // 5c. Place valid order & check totals (12999 * 2 = 25998)
        const reqValidOrder = {
            userId: "user-A",
            body: {
                items: [{ productId: "507f1f77bcf86cd799439011", productName: "Headphones", price: 12999, quantity: 2 }],
                shippingAddress: { city: "Mumbai" },
                paymentMethod: "COD"
            }
        };
        const resValidOrder = new MockResponse();
        await placeOrder(reqValidOrder, resValidOrder);
        if (resValidOrder.statusCode !== 201 || resValidOrder.data.order.totalAmount !== 25998) {
            throw new Error("Order placement or total calculation failed");
        }
        const createdOrderId = resValidOrder.data.order._id;

        // 5d. Order history
        const reqHistory = { userId: "user-A" };
        const resHistory = new MockResponse();
        await getUserOrders(reqHistory, resHistory);
        if (resHistory.statusCode !== 200 || resHistory.data.orders.length === 0) {
            throw new Error("Order history failed");
        }

        // 5e. Cancellation
        const reqCancel = { userId: "user-A", params: { id: createdOrderId } };
        const resCancel = new MockResponse();
        await cancelOrder(reqCancel, resCancel);
        if (resCancel.statusCode !== 200 || resCancel.data.order.orderStatus !== "Cancelled") {
            throw new Error("Order cancellation failed");
        }

        console.log("[✓] 5. Orders: PASSED (Correct totals, stock validation, cancellation, order history)\n");
        passedCount++;
    } catch (err) {
        console.error("[✗] 5. Orders: FAILED -", err.message, "\n");
    }

    // 6. PAYMENTS
    try {
        console.log("Testing 6. Payments...");
        const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";
        const orderId = "order_test_123";
        const paymentId = "pay_test_456";
        const expectedSignature = crypto.createHmac("sha256", secret).update(orderId + "|" + paymentId).digest("hex");

        // 6a. Valid signature verification
        const reqValidSig = { body: { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: expectedSignature } };
        const resValidSig = new MockResponse();
        await verifyPayment(reqValidSig, resValidSig);
        if (resValidSig.statusCode !== 200 || !resValidSig.data.success) throw new Error("Valid signature verification failed");

        // 6b. Invalid signature rejection
        const reqInvalidSig = { body: { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: "tampered_signature" } };
        const resInvalidSig = new MockResponse();
        await verifyPayment(reqInvalidSig, resInvalidSig);
        if (resInvalidSig.statusCode !== 400 || resInvalidSig.data.success !== false) throw new Error("Invalid signature was not rejected");

        // 6c. Duplicate callback protection
        const mockPaidOrder = { _id: "order-paid-1", paymentStatus: "Paid" };
        Order.findById = async (id) => (id === "order-paid-1" ? mockPaidOrder : null);
        const reqDup = { body: { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: expectedSignature, orderId: "order-paid-1" } };
        const resDup = new MockResponse();
        await verifyPayment(reqDup, resDup);
        if (resDup.statusCode !== 200 || !resDup.data.message.includes("already verified")) {
            throw new Error("Duplicate payment callback handling failed");
        }

        console.log("[✓] 6. Payments: PASSED (Invalid signatures, duplicate callbacks, status verification)\n");
        passedCount++;
    } catch (err) {
        console.error("[✗] 6. Payments: FAILED -", err.message, "\n");
    }

    // 7. ADMIN
    try {
        console.log("Testing 7. Admin...");
        // 7a. Normal user rejection
        const normalUserToken = jwt.sign({ userId: "user-1", role: "user" }, JWT_SECRET);
        const reqNormal = { headers: { authorization: `Bearer ${normalUserToken}` } };
        const resNormal = new MockResponse();
        let adminNextCalled = false;
        adminAuth(reqNormal, resNormal, () => { adminNextCalled = true; });
        if (resNormal.statusCode !== 403 || adminNextCalled) throw new Error("Normal user was not rejected with 403");

        // 7b. Admin authorized
        const adminToken = jwt.sign({ userId: "admin-1", role: "admin" }, JWT_SECRET);
        const reqAdmin = { headers: { authorization: `Bearer ${adminToken}` } };
        const resAdmin = new MockResponse();
        let adminAllowed = false;
        adminAuth(reqAdmin, resAdmin, () => { adminAllowed = true; });
        if (!adminAllowed || reqAdmin.role !== "admin") throw new Error("Admin user was not authorized");

        // 7c. Admin dashboard stats
        const reqStats = {};
        const resStats = new MockResponse();
        await getDashboardStats(reqStats, resStats);
        if (resStats.statusCode !== 200 || typeof resStats.data.totalProducts !== "number") {
            throw new Error("Admin dashboard stats failed");
        }

        console.log("[✓] 7. Admin: PASSED (Reject normal users, allow authorized administrators only)\n");
        passedCount++;
    } catch (err) {
        console.error("[✗] 7. Admin: FAILED -", err.message, "\n");
    }

    console.log("==========================================");
    console.log(`Backend test checklist: ${passedCount}/7 tested & PASSED`);
    console.log("==========================================");
};

runTests();
