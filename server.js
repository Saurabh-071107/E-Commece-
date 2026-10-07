import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import userRoutes from './routes/user.js';

const app = express();
const port = 3000;

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

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});