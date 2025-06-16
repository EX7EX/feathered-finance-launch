import { jwtDecode } from 'jwt-decode';
import { hash, compare } from 'bcrypt';
import { encrypt, decrypt } from 'crypto-js';
import DOMPurify from 'dompurify';
import * as Sentry from '@sentry/react';
import rateLimit from 'express-rate-limit';

// Production security configuration
export const securityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h',
    refreshExpiresIn: '7d',
  },
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  cors: {
    origin: process.env.VITE_CORS_ORIGINS?.split(',') || ['https://feathered.finance'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://api.production.com', 'https://prod-project.supabase.co'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
};

// Enhanced JWT validation
export const validateToken = (token: string) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (!decoded.exp || decoded.exp < currentTime) {
      return false;
    }

    // Additional security checks
    if (decoded.iss !== 'feathered-finance') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// Enhanced password security
export const validatePassword = (password: string) => {
  const {
    minLength,
    requireUppercase,
    requireLowercase,
    requireNumbers,
    requireSpecialChars,
  } = securityConfig.password;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    (!requireUppercase || hasUpperCase) &&
    (!requireLowercase || hasLowerCase) &&
    (!requireNumbers || hasNumbers) &&
    (!requireSpecialChars || hasSpecialChar)
  );
};

// Enhanced data encryption
export const encryptData = (data: string, key: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  return encrypt(data, key, {
    salt: salt,
    iv: iv,
  }).toString();
};

export const decryptData = (encryptedData: string, key: string) => {
  return decrypt(encryptedData, key).toString();
};

// Enhanced XSS prevention
export const sanitizeInput = (input: string) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
  });
};

// Rate limiting middleware
export const rateLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Security logging
export const logSecurityEvent = (event: {
  type: string;
  userId?: string;
  ip?: string;
  details: any;
}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...event,
  };

  // Log to monitoring system
  Sentry.addBreadcrumb({
    category: 'security',
    message: event.type,
    level: 'info',
    data: logEntry,
  });

  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Security Event:', logEntry);
  }
};

// Role-based access control
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export const hasPermission = (userRole: UserRole, requiredRole: UserRole) => {
  const roleHierarchy = {
    [UserRole.USER]: 1,
    [UserRole.MODERATOR]: 2,
    [UserRole.ADMIN]: 3,
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Session management
export const configureSession = (session: any) => {
  return {
    maxAge: 24 * 60 * 60, // 24 hours
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    domain: '.feathered.finance',
  };
}; 