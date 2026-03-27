import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { mealdbRouter } from './routes/mealdb';
import { apiLimiter } from './middleware/rateLimit';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5174;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: CLIENT_ORIGIN,
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression for responses
app.use(compression());

// JSON parsing
app.use(express.json());

// Rate limiting
app.use('/api', apiLimiter);

// Request logging (development)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api', mealdbRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying to: ${process.env.MEALDB_API_BASE}`);
  console.log(`🔑 API Key: ${process.env.MEALDB_API_KEY ? '***' : 'NOT SET'}`);
});

export default app;
