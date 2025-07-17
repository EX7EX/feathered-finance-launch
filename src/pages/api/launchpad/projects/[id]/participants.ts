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
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Project ID is required' });
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const supabase = createAdminSupabaseClient();
  // List all participants for the project
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('project_id', id)
    .order('tx_time', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
} 