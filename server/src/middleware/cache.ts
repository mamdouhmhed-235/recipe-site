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

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
}
