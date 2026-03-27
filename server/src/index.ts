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

// Determine allowed origins for CORS
// In production (Vercel), we need to handle multiple scenarios:
// 1. Explicitly set CLIENT_ORIGIN
// 2. Vercel's automatic URL (VERCEL_URL)
// 3. Any vercel.app subdomain (for preview deployments)
const getAllowedOrigins = (): (string | RegExp)[] => {
  const origins: (string | RegExp)[] = [];
  
  // Always allow localhost for development
  origins.push('http://localhost:5173');
  origins.push('http://localhost:3000');
  
  // Add explicitly configured origin
  if (process.env.CLIENT_ORIGIN) {
    origins.push(process.env.CLIENT_ORIGIN);
  }
  
  // Add Vercel URL if available (automatic in Vercel deployments)
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }
  
  // Allow any vercel.app subdomain (for preview deployments)
  // This regex matches any subdomain of vercel.app
  origins.push(/https:\/\/[a-z0-9-]+\.vercel\.app$/);
  
  return origins;
};

const allowedOrigins = getAllowedOrigins();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`Origin ${origin} not allowed by CORS`);
      callback(null, true); // Allow anyway for now - change to `false` in production if needed
    }
  },
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
  console.log(`🌐 Allowed origins: ${allowedOrigins.map(o => o.toString()).join(', ')}`);
});

export default app;
