import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminSupabaseClient } from '@/integrations/supabase/client';
import jwt from 'jsonwebtoken';

function getUserFromRequest(req: NextApiRequest) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);
    return payload;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createAdminSupabaseClient();

  if (req.method === 'GET') {
    // List all crypto wallets for the authenticated user
    const { data, error } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('user_id', user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    // Add a new crypto wallet for the authenticated user
    const { crypto_code, address, blockchain } = req.body;
    if (!crypto_code || !address || !blockchain) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const { data, error } = await supabase
      .from('crypto_wallets')
      .insert([
        {
          user_id: user.id,
          crypto_code,
          address,
          blockchain,
          address_verified: false,
          balance: 0
        }
      ])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 