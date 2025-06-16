import { jwtDecode } from 'jwt-decode';
import { hash, compare } from 'bcrypt';
import { encrypt, decrypt } from 'crypto-js';
import DOMPurify from 'dompurify';
import * as Sentry from '@sentry/react';

// JWT Validation
export const validateToken = (token: string) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

// Password Security
export const hashPassword = async (password: string) => {
  return hash(password, 12);
};

export const verifyPassword = async (password: string, hash: string) => {
  return compare(password, hash);
};

export const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

// Data Encryption
export const encryptData = (data: string, key: string) => {
  return encrypt(data, key).toString();
};

export const decryptData = (encryptedData: string, key: string) => {
  return decrypt(encryptedData, key).toString();
};

// XSS Prevention
export const sanitizeInput = (input: string) => {
  return DOMPurify.sanitize(input);
};

// Error Tracking
export const trackError = (error: Error, context?: any) => {
  Sentry.withScope(scope => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(error);
  });
};

// Security Logging
export const logSecurityEvent = (event: {
  type: string;
  userId?: string;
  ip?: string;
  details: any;
}) => {
  console.log({
    timestamp: new Date().toISOString(),
    ...event
  });
};

// Role-Based Access Control
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export const hasPermission = (userRole: UserRole, requiredRole: UserRole) => {
  const roleHierarchy = {
    [UserRole.USER]: 1,
    [UserRole.MODERATOR]: 2,
    [UserRole.ADMIN]: 3
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Session Management
export const configureSession = (session: any) => {
  return {
    maxAge: 24 * 60 * 60, // 24 hours
    secure: true,
    httpOnly: true,
    sameSite: 'strict'
  };
};

// Content Security Policy
export const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.your-domain.com']
  }
}; 