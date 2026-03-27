# Backend Implementation Plan

## Overview
Node.js/Express proxy server that forwards requests to TheMealDB API while hiding the API key.

## File Structure
```
/server
  .env.example
  .env
  package.json
  tsconfig.json
  src/
    index.ts          → Server entry point
    routes/
      mealdb.ts       → All /api/* routes
    middleware/
      cache.ts        → In-memory TTL cache
    types/
      index.ts        → TypeScript interfaces
```

## Step-by-Step Implementation

### 1. Initialize Project
```bash
cd server
npm init -y
npm install express cors helmet compression dotenv
npm install -D typescript @types/node @types/express @types/cors @types/compression ts-node nodemon
```

### 2. Environment Configuration

**.env.example**
```
MEALDB_API_BASE=https://www.themealdb.com/api/json/v1
MEALDB_API_KEY=1
PORT=5174
CLIENT_ORIGIN=http://localhost:5173
```

**.env** (copy from .env.example for local dev)

### 3. TypeScript Configuration

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Package.json Scripts
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### 5. Type Definitions

**src/types/index.ts**
```typescript
// TheMealDB API response types
export interface Meal {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate: string | null;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  // Ingredients 1-20
  strIngredient1?: string;
  strIngredient2?: string;
  // ... up to 20
  strMeasure1?: string;
  strMeasure2?: string;
  // ... up to 20
  strSource: string | null;
  strImageSource: string | null;
  strCreativeCommonsConfirmed: string | null;
  dateModified: string | null;
}

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface MealSummary {
  strMeal: string;
  strMealThumb: string;
  idMeal: string;
}

export interface SearchResponse {
  meals: Meal[] | null;
}

export interface CategoriesResponse {
  categories: Category[] | null;
}

export interface FilterResponse {
  meals: MealSummary[] | null;
}

// Cache entry type
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}
```

### 6. Caching Middleware

**src/middleware/cache.ts**
```typescript
import { Request, Response, NextFunction } from 'express';
import { CacheEntry } from '../types';

// In-memory cache store
const cache = new Map<string, CacheEntry<unknown>>();

// Default TTL: 1 minute for general API calls
export const DEFAULT_TTL = 60 * 1000;
// Categories are more stable, cache for 5 minutes
export const CATEGORIES_TTL = 5 * 60 * 1000;

/**
 * Get cached response if valid
 */
export function getFromCache(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

/**
 * Set cache entry with TTL
 */
export function setCache(key: string, data: unknown, ttl: number = DEFAULT_TTL): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

/**
 * Cache middleware for specific routes
 */
export function cacheMiddleware(ttl: number = DEFAULT_TTL) {
  return (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = req.originalUrl;
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }
    
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to cache response
    res.json = function(data: unknown) {
      setCache(cacheKey, data, ttl);
      res.set('X-Cache', 'MISS');
      return originalJson(data);
    } as typeof res.json;
    
    next();
  };
}

/**
 * Clear cache for a specific key or all cache
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
```

### 7. Main Server Entry

**src/index.ts**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { mealdbRouter } from './routes/mealdb';

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
```

### 8. API Routes

**src/routes/mealdb.ts**
```typescript
import { Router, Request, Response } from 'express';
import { cacheMiddleware, CATEGORIES_TTL } from '../middleware/cache';
import { 
  SearchResponse, 
  CategoriesResponse, 
  FilterResponse, 
  Meal 
} from '../types';

export const mealdbRouter = Router();

const MEALDB_API_BASE = process.env.MEALDB_API_BASE || 'https://www.themealdb.com/api/json/v1';
const MEALDB_API_KEY = process.env.MEALDB_API_KEY || '1';

/**
 * Helper to fetch from TheMealDB
 */
async function fetchFromMealDB(endpoint: string): Promise<unknown> {
  const url = `${MEALDB_API_BASE}/${MEALDB_API_KEY}/${endpoint}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TheMealDB API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * GET /api/search?s={query}
 * Search meals by name
 */
mealdbRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.s as string;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Sanitize query
    const sanitizedQuery = encodeURIComponent(query.trim());
    
    const data = await fetchFromMealDB(`search.php?s=${sanitizedQuery}`) as SearchResponse;
    
    res.json({
      meals: data.meals || [],
      query: query.trim()
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Failed to search meals',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/meal/:id
 * Get meal details by ID
 */
mealdbRouter.get('/meal/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || !/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Valid meal ID is required' });
    }
    
    const data = await fetchFromMealDB(`lookup.php?i=${id}`) as SearchResponse;
    
    if (!data.meals || data.meals.length === 0) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    // Extract ingredients and measures
    const meal = data.meals[0];
    const ingredients: Array<{ ingredient: string; measure: string }> = [];
    
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}` as keyof Meal] as string;
      const measure = meal[`strMeasure${i}` as keyof Meal] as string;
      
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure?.trim() || ''
        });
      }
    }
    
    res.json({
      ...meal,
      ingredients
    });
  } catch (error) {
    console.error('Meal lookup error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch meal details',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/categories
 * List all meal categories
 * Cached for 5 minutes
 */
mealdbRouter.get('/categories', cacheMiddleware(CATEGORIES_TTL), async (req: Request, res: Response) => {
  try {
    const data = await fetchFromMealDB('categories.php') as CategoriesResponse;
    
    res.json({
      categories: data.categories || []
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/filter?c={category}
 * Filter meals by category
 */
mealdbRouter.get('/filter', async (req: Request, res: Response) => {
  try {
    const category = req.query.c as string;
    
    if (!category || category.trim().length === 0) {
      return res.status(400).json({ error: 'Category is required' });
    }
    
    const sanitizedCategory = encodeURIComponent(category.trim());
    const data = await fetchFromMealDB(`filter.php?c=${sanitizedCategory}`) as FilterResponse;
    
    res.json({
      meals: data.meals || [],
      category: category.trim()
    });
  } catch (error) {
    console.error('Filter error:', error);
    res.status(500).json({ 
      error: 'Failed to filter meals',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/random
 * Get a random meal
 */
mealdbRouter.get('/random', async (req: Request, res: Response) => {
  try {
    const data = await fetchFromMealDB('random.php') as SearchResponse;
    
    if (!data.meals || data.meals.length === 0) {
      return res.status(404).json({ error: 'No random meal found' });
    }
    
    res.json(data.meals[0]);
  } catch (error) {
    console.error('Random meal error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch random meal',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
```

## API Endpoints Summary

| Endpoint | Method | Query Params | Description | Cache TTL |
|----------|--------|--------------|-------------|-----------|
| `/api/search` | GET | `s` (required) | Search meals by name | 1 min |
| `/api/meal/:id` | GET | - | Get meal details | 1 min |
| `/api/categories` | GET | - | List categories | 5 min |
| `/api/filter` | GET | `c` (required) | Filter by category | 1 min |
| `/api/random` | GET | - | Random meal | None |
| `/health` | GET | - | Health check | None |

## Error Handling Strategy

1. **Validation Errors**: 400 with descriptive message
2. **Not Found**: 404 for missing meals
3. **API Errors**: 500 with error details (dev only)
4. **Network Errors**: Caught and logged, generic message to client

## Security Measures

1. **Helmet**: Security headers
2. **CORS**: Restricted to client origin
3. **Input Sanitization**: encodeURIComponent for all user inputs
4. **API Key**: Never exposed, server-side only
5. **Rate Limiting**: Consider adding for production

## Testing Checklist

- [ ] Server starts without errors
- [ ] All endpoints return correct data
- [ ] Caching works (X-Cache header)
- [ ] Error handling returns proper status codes
- [ ] CORS allows client requests
- [ ] API key not exposed in responses
- [ ] Health check endpoint works

## Production Considerations

1. **Rate Limiting**: Add express-rate-limit
2. **Logging**: Use winston or pino
3. **Monitoring**: Add health checks for load balancer
4. **Scaling**: Consider Redis for distributed cache
5. **SSL**: Use HTTPS in production
6. **Environment**: Set NODE_ENV=production
