import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import builderRoutes from './routes/builderRoutes';
import projectRoutes from './routes/projectRoutes';
import contractorRoutes from './routes/contractorRoutes';
import masterRoutes from './routes/masterRoutes';
import discoveryRoutes from './routes/discoveryRoutes';
import negotiationRoutes from './routes/negotiationRoutes';
import adminRoutes from './routes/adminRoutes';
import adminAnalyticsRoutes from './routes/adminAnalyticsRoutes';
import reviewRoutes from './routes/reviewRoutes';
import { errorHandler } from './middleware/errorHandler';
import { createApiResponse } from './utils/apiResponse';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: '*', // For development. Can be restricted in production config.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve local upload assets statically for testing fallbacks
app.use('/storage/uploads', express.static(path.join(__dirname, 'storage/uploads')));

// Main API Routes
app.use('/api/auth', authRoutes);
app.use('/api/builders', builderRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/negotiation', negotiationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json(createApiResponse(true, 'Server is running and healthy.', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }));
});

// Fallback for 404 Route Not Found
app.use((req, res) => {
  res.status(404).json(
    createApiResponse(false, `Route ${req.method} ${req.url} not found.`, {}, null)
  );
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  BuildConnect Backend Running on Port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});

export default app;
