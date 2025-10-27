import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from '@/middleware/errorHandler';
import { notFound } from '@/middleware/notFound';
import { rateLimiter } from '@/middleware/rateLimiter';
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/database/connection';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
app.use(rateLimiter);

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
import authRoutes from '@/routes/auth';
import jobRoutes from '@/routes/jobs';
import jobCategoryRoutes from '@/routes/jobCategories';
import applicationRoutes from '@/routes/applications';
import bookmarkRoutes from '@/routes/bookmarks';
import recommendationRoutes from '@/routes/recommendations';
import analyticsRoutes from '@/routes/analytics';
import skillsRoutes from '@/routes/skills';

app.get('/api', (req, res) => {
  res.json({
    message: 'Career Development Platform API',
    version: '1.0.0',
    status: 'active'
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Job routes
app.use('/api/jobs', jobRoutes);

// Job categories routes
app.use('/api/job-categories', jobCategoryRoutes);

// Application routes
app.use('/api/applications', applicationRoutes);

// Bookmark routes
app.use('/api/bookmarks', bookmarkRoutes);

// Recommendation routes
app.use('/api/recommendations', recommendationRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// Skills routes
app.use('/api/skills', skillsRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
