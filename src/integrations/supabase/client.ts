import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Supabase URL and Key must be provided as environment variables VITE_SUPABASE_URL and VITE_SUPABASE_KEY.");
}

export class SupabaseError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'SupabaseError';
    this.code = code;
  }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
