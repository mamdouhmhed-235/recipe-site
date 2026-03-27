import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware for API routes
 * Limits requests to 100 per 15 minutes per IP address
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: '15 minutes'
  },
  skip: (req) => {
    // Skip rate limiting for health check endpoint
    return req.path === '/health';
  }
});

/**
 * Stricter rate limiter for search endpoint
 * Limits to 30 requests per 15 minutes per IP
 */
export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many search requests',
    message: 'You have exceeded the search rate limit. Please try again later.',
    retryAfter: '15 minutes'
  }
});
