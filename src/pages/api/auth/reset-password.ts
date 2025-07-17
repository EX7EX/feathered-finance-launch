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
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }
  // Set the access token for the current session
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(200).json({ message: 'Password has been reset successfully' });
} 