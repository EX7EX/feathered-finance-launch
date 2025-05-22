import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { RateLimiter } from 'limiter';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

// Password validation schema
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Email validation schema
export const emailSchema = z.string().email('Invalid email address');

// Rate limiter for failed attempts
const rateLimiter = new RateLimiter({
  tokensPerInterval: 5, // 5 attempts
  interval: 15 * 60 * 1000 // 15 minutes in milliseconds
});

// Rate limiting middleware
export const checkRateLimit = async (key: string): Promise<boolean> => {
  const hasToken = await rateLimiter.tryRemoveTokens(1);
  return hasToken;
};

// 2FA setup
export const generate2FASecret = () => {
  return authenticator.generateSecret();
};

export const generate2FAQRCode = async (email: string, secret: string): Promise<string> => {
  const otpauth = authenticator.keyuri(email, 'Feathered Finance', secret);
  return await qrcode.toDataURL(otpauth);
};

export const verify2FAToken = (token: string, secret: string): boolean => {
  return authenticator.verify({ token, secret });
};

// Session management
export const createSession = async (userId: string, supabase: ReturnType<typeof createClient>) => {
  const { data, error } = await supabase
    .from('sessions')
    .insert([
      {
        user_id: userId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const validateSession = async (sessionId: string, supabase: ReturnType<typeof createClient>) => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) throw error;
  return data;
};

// Email verification
export const generateEmailVerificationToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const sendVerificationEmail = async (
  email: string,
  token: string,
  supabase: ReturnType<typeof createClient>
) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: {
        verification_token: token,
      },
    },
  });

  if (error) throw error;
};

export const verifyEmail = async (
  email: string,
  token: string,
  supabase: ReturnType<typeof createClient>
) => {
  const { data, error } = await supabase
    .from('users')
    .update({ email_verified: true })
    .eq('email', email)
    .eq('verification_token', token)
    .select()
    .single();

  if (error) throw error;
  return data;
}; 