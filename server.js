import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRoutes from './routes/user.js';
import cartRoutes from './routes/cart.js';
import addressRoutes from './routes/address.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';
import productRoutes from './routes/product.js';

const app = express();
const port = 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

mongoose
    .connect('YOUR_MONGODB_CONNECTION_STRING', {
        dbName: 'User'
    })
    .then(() => console.log('Database connected'))
    .catch((err) => console.log('Database connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('E-commerce server is running');
});

app.use('/users', userRoutes);
app.use('/api/auth', userRoutes);
app.use('/auth', userRoutes);
app.use('/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});