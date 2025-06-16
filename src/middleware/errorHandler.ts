import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from './auth';

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function withErrorHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) {
  return next().catch((error) => {
    console.error('API Error:', {
      path: req.url,
      method: req.method,
      error: error.message,
      stack: error.stack,
      user: req.user?.address,
    });

    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        error: error.message,
        details: error.details,
      });
    }

    // Handle Prisma errors
    if (error.code?.startsWith('P')) {
      return res.status(400).json({
        error: 'Database operation failed',
        details: error.message,
      });
    }

    // Handle validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    // Handle unknown errors
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  });
} 