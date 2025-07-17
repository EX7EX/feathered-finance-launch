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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing order id' });
  const supabase = createAdminSupabaseClient();
  // Only allow user to cancel their own open order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'open')
    .single();
  if (orderError || !order) return res.status(404).json({ error: 'Order not found or not open' });
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data[0]);
} 