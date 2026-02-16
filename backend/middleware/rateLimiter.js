const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Create Redis client for distributed rate limiting
let redisClient;
let store;

const initializeRedis = () => {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });

    store = new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    });

    console.log('✅ Redis rate limiting initialized');
  } catch (error) {
    console.log('⚠️ Redis not available, using memory store');
    store = undefined; // Will use default memory store
  }
};

// Production-ready rate limiters for dedicated server
const createProductionRateLimiters = () => {
  // Initialize Redis if available
  initializeRedis();

  // General API rate limiter (for dedicated server)
  const generalLimiter = rateLimit({
    store: store,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes per IP
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes',
      limit: 1000,
      windowMs: 900000
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/';
    },
  });

  // Login rate limiter (more restrictive)
  const loginLimiter = rateLimit({
    store: store,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 login attempts per 15 minutes per IP
    message: {
      error: 'Too many login attempts from this IP, please try again later.',
      retryAfter: '15 minutes',
      limit: 20,
      windowMs: 900000
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
      return `login:${req.ip || req.connection.remoteAddress}`;
    },
  });

  // Admin rate limiter
  const adminLimiter = rateLimit({
    store: store,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 admin requests per 15 minutes per IP
    message: {
      error: 'Too many admin requests from this IP, please try again later.',
      retryAfter: '15 minutes',
      limit: 500,
      windowMs: 900000
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return `admin:${req.ip || req.connection.remoteAddress}`;
    },
  });

  // File upload rate limiter (very restrictive)
  const uploadLimiter = rateLimit({
    store: store,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour per IP
    message: {
      error: 'Too many file uploads from this IP, please try again later.',
      retryAfter: '1 hour',
      limit: 50,
      windowMs: 3600000
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return `upload:${req.ip || req.connection.remoteAddress}`;
    },
  });

  // API endpoint specific limiters
  const propertyLimiter = rateLimit({
    store: store,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 property requests per 15 minutes per IP
    message: {
      error: 'Too many property requests from this IP, please try again later.',
      retryAfter: '15 minutes',
      limit: 200,
      windowMs: 900000
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return `property:${req.ip || req.connection.remoteAddress}`;
    },
  });

  // User registration limiter
  const registrationLimiter = rateLimit({
    store: store,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 registrations per hour per IP
    message: {
      error: 'Too many registration attempts from this IP, please try again later.',
      retryAfter: '1 hour',
      limit: 5,
      windowMs: 3600000
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return `register:${req.ip || req.connection.remoteAddress}`;
    },
  });

  return {
    generalLimiter,
    loginLimiter,
    adminLimiter,
    uploadLimiter,
    propertyLimiter,
    registrationLimiter
  };
};

// Development/Cloud rate limiters (for Railway/Vercel)
const createCloudRateLimiters = () => {
  // General API rate limiter (for cloud platforms)
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per 15 minutes per IP
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes',
      limit: 500,
      windowMs: 900000
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    },
    skip: (req) => {
      return req.path === '/health' || req.path === '/';
    },
  });

  // Login rate limiter (cloud-optimized)
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 15 login attempts per 15 minutes per IP
    message: {
      error: 'Too many login attempts from this IP, please try again later.',
      retryAfter: '15 minutes',
      limit: 15,
      windowMs: 900000
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
      return `login:${req.ip || req.connection.remoteAddress}`;
    },
  });

  // Admin rate limiter (cloud-optimized)
  const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 admin requests per 15 minutes per IP
    message: {
      error: 'Too many admin requests from this IP, please try again later.',
      retryAfter: '15 minutes',
      limit: 200,
      windowMs: 900000
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return `admin:${req.ip || req.connection.remoteAddress}`;
    },
  });

  return {
    generalLimiter,
    loginLimiter,
    adminLimiter,
    uploadLimiter: loginLimiter, // Reuse login limiter for uploads
    propertyLimiter: generalLimiter, // Use general for properties
    registrationLimiter: loginLimiter, // Use login for registration
  };
};

// Environment-aware rate limiter creation
const createRateLimiters = () => {
  const isProductionServer = process.env.NODE_ENV === 'production' && 
                            (process.env.DEDICATED_SERVER === 'true' || 
                             process.env.REDIS_HOST);
  
  if (isProductionServer) {
    console.log('🚀 Using production rate limiters (dedicated server)');
    return createProductionRateLimiters();
  } else {
    console.log('☁️ Using cloud rate limiters (Railway/Vercel)');
    return createCloudRateLimiters();
  }
};

module.exports = createRateLimiters;
