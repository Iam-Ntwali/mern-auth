import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/auth.route.js';

dotenv.config();  // Load environment variables from a .env file into process.env

const app = express();

app.get('/', (req, res) => {
  res.send('Hello Nodemond! 🙂');
});

app.use('/api/auth', authRoutes);

app.listen(3000, () => {
  connectDB();
  console.log('Server is running on http://localhost:3000');
});