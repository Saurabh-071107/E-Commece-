import express from 'express';
import { addProduct, removeProduct, updateQuantity, getCart, clearCart } from '../controller/cart.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getCart);
router.post('/add', auth, addProduct);
router.put('/update', auth, updateQuantity);
router.delete('/:productId', auth, removeProduct);
router.post('/remove', auth, removeProduct);
router.delete('/', auth, clearCart);

export default router;

