import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminSupabaseClient } from '@/integrations/supabase/client';
import jwt from 'jsonwebtoken';

function getUserFromRequest(req: NextApiRequest) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    // Use your Supabase JWT secret here
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
    // List all projects
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('start_time', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    // Only allow admin/owner
    if (!user.role || !['admin', 'owner'].includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const {
      name,
      description,
      token_symbol,
      token_price,
      total_tokens,
      start_time,
      end_time,
      owner_id
    } = req.body;
    if (!name || !token_symbol || !token_price || !total_tokens || !start_time || !end_time || !owner_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          description,
          token_symbol,
          token_price,
          total_tokens,
          start_time,
          end_time,
          owner_id,
          status: 'draft'
        }
      ])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 