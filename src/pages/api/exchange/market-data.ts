import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminSupabaseClient } from '@/integrations/supabase/client';
import { ExchangeEngine } from '@/lib/exchange-engine';

const exchangeEngine = new ExchangeEngine();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { pair } = req.query;
  if (!pair || typeof pair !== 'string') {
    return res.status(400).json({ error: 'Missing pair parameter' });
  }

  const supabase = createAdminSupabaseClient();

  try {
    // Update market data first
    await exchangeEngine.updateMarketData(pair);

    // Get market data
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .eq('pair', pair)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Market data not found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
} 