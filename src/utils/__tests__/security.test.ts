import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  passwordSchema,
  emailSchema,
  checkRateLimit,
  generate2FASecret,
  generate2FAQRCode,
  verify2FAToken,
  createSession,
  validateSession,
  generateEmailVerificationToken,
  sendVerificationEmail,
  verifyEmail,
} from '../security';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-session-id' },
            error: null,
          })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gt: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: 'test-session-id' },
              error: null,
            })),
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: { email_verified: true },
                error: null,
              })),
            })),
          })),
        })),
      })),
    })),
    auth: {
      signInWithOtp: vi.fn(() => ({
        error: null,
      })),
    },
  })),
}));

describe('Security Utilities', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeEach(() => {
    supabase = createClient('test-url', 'test-key');
  });

  describe('Password Validation', () => {
    it('validates strong passwords', () => {
      const validPassword = 'StrongP@ss123';
      expect(() => passwordSchema.parse(validPassword)).not.toThrow();
    });

    it('rejects weak passwords', () => {
      const weakPasswords = [
        'weak',
        'no-uppercase123!',
        'NO-LOWERCASE123!',
        'No-Numbers!',
        'NoSpecialChars123',
      ];

      weakPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow();
      });
    });
  });

  describe('Email Validation', () => {
    it('validates correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        'not-an-email',
        'missing@domain',
        '@missing-local.com',
        'spaces in@email.com',
      ];

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });
  });

  describe('Rate Limiting', () => {
    it('allows requests within rate limit', async () => {
      const result = await checkRateLimit('test-key');
      expect(result).toBe(true);
    });
  });

  describe('2FA', () => {
    it('generates valid 2FA secret', () => {
      const secret = generate2FASecret();
      expect(secret).toBeDefined();
      expect(secret.length).toBeGreaterThan(0);
    });

    it('generates QR code for 2FA', async () => {
      const email = 'test@example.com';
      const secret = generate2FASecret();
      const qrCode = await generate2FAQRCode(email, secret);
      expect(qrCode).toMatch(/^data:image\/png;base64,/);
    });

    it('verifies valid 2FA token', () => {
      const secret = generate2FASecret();
      const token = authenticator.generate(secret);
      expect(verify2FAToken(token, secret)).toBe(true);
    });

    it('rejects invalid 2FA token', () => {
      const secret = generate2FASecret();
      expect(verify2FAToken('123456', secret)).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('creates new session', async () => {
      const userId = 'test-user-id';
      const session = await createSession(userId, supabase);
      expect(session).toBeDefined();
      expect(session.id).toBe('test-session-id');
    });

    it('validates existing session', async () => {
      const sessionId = 'test-session-id';
      const session = await validateSession(sessionId, supabase);
      expect(session).toBeDefined();
      expect(session.id).toBe('test-session-id');
    });
  });

  describe('Email Verification', () => {
    it('generates verification token', () => {
      const token = generateEmailVerificationToken();
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);
    });

    it('sends verification email', async () => {
      const email = 'test@example.com';
      const token = generateEmailVerificationToken();
      await expect(sendVerificationEmail(email, token, supabase)).resolves.not.toThrow();
    });

    it('verifies email with valid token', async () => {
      const email = 'test@example.com';
      const token = generateEmailVerificationToken();
      const result = await verifyEmail(email, token, supabase);
      expect(result.email_verified).toBe(true);
    });
  });
}); 