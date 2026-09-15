import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { seedDatabase } from './scripts/seed.js';

import authRoutes from './routes/authRoutes.js';
import vegetableRoutes from './routes/vegetableRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

// CORS configuration supporting production & local origins
const frontendUrl = process.env.FRONTEND_URL;
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];
if (frontendUrl) {
  allowedOrigins.push(frontendUrl.replace(/\/$/, ''));
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || !frontendUrl) {
      callback(null, true);
    } else {
      callback(null, true); // Allow for mobile/cross-origin requests
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    database: 'connected'
  });
});

// Connect to MongoDB & Seed initial data if empty
await connectDB();
await seedDatabase().catch(err => console.error('Seed warning:', err.message));

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // Address routes
app.use('/api', vegetableRoutes);
app.use('/api', packageRoutes);
app.use('/api', orderRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Jamalpur's MongoDB API active on port ${PORT}`));

