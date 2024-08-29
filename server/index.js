import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/auth.route.js';

dotenv.config();  // Load environment variables from a .env file into process.env

const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(express.json()); // Parse incoming requets (JSON bodies)
app.use(cookieParser()); // Parse incoming cookies

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost: ${PORT}`);
});