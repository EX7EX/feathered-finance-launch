import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from './auth';
import { z } from 'zod';

export function withSanitization(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => Promise<void>,
  schema: z.ZodType<any>
) {
  try {
    // Sanitize query parameters
    if (req.query) {
      const sanitizedQuery = Object.entries(req.query).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = value.trim().replace(/[<>]/g, '');
        } else if (Array.isArray(value)) {
          acc[key] = value.map(v => v.trim().replace(/[<>]/g, ''));
        }
        return acc;
      }, {} as Record<string, any>);
      req.query = sanitizedQuery;
    }

    // Sanitize body
    if (req.body) {
      const sanitizedBody = Object.entries(req.body).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = value.trim().replace(/[<>]/g, '');
        } else if (Array.isArray(value)) {
          acc[key] = value.map(v => 
            typeof v === 'string' ? v.trim().replace(/[<>]/g, '') : v
          );
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      req.body = sanitizedBody;
    }

    // Validate against schema
    const validationResult = schema.safeParse({
      ...req.query,
      ...req.body,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    return next();
  } catch (error) {
    console.error('Sanitization error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 