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
  const supabase = createAdminSupabaseClient();

  if (req.method === 'GET') {
    // Get project details
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return res.status(404).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PATCH') {
    // Only allow admin/owner
    if (!user.role || !['admin', 'owner'].includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const updateFields = req.body;
    const { data, error } = await supabase
      .from('projects')
      .update(updateFields)
      .eq('id', id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 