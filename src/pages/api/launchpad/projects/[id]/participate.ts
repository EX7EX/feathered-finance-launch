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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { tokens_bought } = req.body;
  if (!tokens_bought) {
    return res.status(400).json({ error: 'tokens_bought is required' });
  }
  const supabase = createAdminSupabaseClient();
  // Get project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (projectError || !project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  // Check if sale is active
  const now = new Date();
  if (now < new Date(project.start_time) || now > new Date(project.end_time) || project.status !== 'active') {
    return res.status(400).json({ error: 'Sale is not active' });
  }
  // Check if enough tokens remain
  if (project.tokens_sold + tokens_bought > project.total_tokens) {
    return res.status(400).json({ error: 'Not enough tokens remaining' });
  }
  // Calculate amount paid
  const amount_paid = Number(tokens_bought) * Number(project.token_price);
  // Insert participant record
  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .insert([
      {
        project_id: id,
        user_id: user.id,
        tokens_bought,
        amount_paid
      }
    ])
    .select();
  if (participantError) {
    return res.status(500).json({ error: participantError.message });
  }
  // Update tokens_sold in project
  await supabase
    .from('projects')
    .update({ tokens_sold: project.tokens_sold + tokens_bought })
    .eq('id', id);
  // Update user's wallet balance
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .eq('token_symbol', project.token_symbol)
    .single();
  if (wallet) {
    await supabase
      .from('wallets')
      .update({ balance: Number(wallet.balance) + Number(tokens_bought) })
      .eq('user_id', user.id)
      .eq('token_symbol', project.token_symbol);
  } else {
    await supabase
      .from('wallets')
      .insert([
        {
          user_id: user.id,
          token_symbol: project.token_symbol,
          balance: tokens_bought
        }
      ]);
  }
  // Record transaction (legacy fields removed)
  await supabase
    .from('transactions')
    .insert([
      {
        user_id: user.id,
        amount: tokens_bought,
        currency_code: project.token_symbol,
        status: 'completed',
        transaction_type: 'buy'
      }
    ]);
  return res.status(201).json({ message: 'Participation successful', participant: participant[0] });
} 