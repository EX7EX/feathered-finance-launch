import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminSupabaseClient } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { pair, market_type, limit = 50 } = req.query;
  
  if (!pair || typeof pair !== 'string') {
    return res.status(400).json({ error: 'Missing pair parameter' });
  }

  const supabase = createAdminSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('trades')
      .select('id, price, amount, taker_side, created_at')
      .eq('pair', pair)
      .eq('market_type', market_type || 'spot')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string));

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Transform data to match expected format
    const trades = data?.map(trade => ({
      id: trade.id,
      price: Number(trade.price),
      amount: Number(trade.amount),
      side: trade.taker_side,
      timestamp: trade.created_at
    })) || [];

    return res.status(200).json(trades);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
} 