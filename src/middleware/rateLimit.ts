import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from './auth';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function withRateLimit(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => Promise<void>,
  config: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
  }
) {
  const key = req.user?.address || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  if (now > store[key].resetTime) {
    store[key] = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  store[key].count++;

  if (store[key].count > config.max) {
    return res.status(429).json({
      error: config.message,
      retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
    });
  }

  res.setHeader('X-RateLimit-Limit', config.max);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - store[key].count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(store[key].resetTime / 1000));

  return next();
} 