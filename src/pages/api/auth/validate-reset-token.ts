import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }
  // Try to set the session with the token to validate it
  const { data, error } = await supabase.auth.setSession({ access_token: token, refresh_token: token });
  if (error) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
  return res.status(200).json({ message: 'Token is valid' });
} 