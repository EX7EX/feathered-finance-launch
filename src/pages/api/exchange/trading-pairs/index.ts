import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminSupabaseClient } from '@/integrations/supabase/client';
import { getUserFromRequest } from '@/lib/auth-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createAdminSupabaseClient();

  if (req.method === 'GET') {
    // Get trading pairs with optional market type filter
    const { market_type } = req.query;
    
    let query = supabase
      .from('trading_pairs')
      .select('*')
      .eq('is_active', true)
      .order('symbol');

    if (market_type && typeof market_type === 'string') {
      query = query.eq('market_type', market_type);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    // Create new trading pair (admin only)
    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // TODO: Check if user is admin
    const { 
      base_currency, quote_currency, symbol, market_type, contract_type,
      leverage_max, leverage_min, min_order_size, max_order_size, 
      price_precision, quantity_precision, maker_fee, taker_fee,
      funding_rate, funding_interval, underlying_asset, strike_price, expiry_date
    } = req.body;

    if (!base_currency || !quote_currency || !symbol || !market_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('trading_pairs')
      .insert([{
        base_currency,
        quote_currency,
        symbol,
        market_type,
        contract_type,
        leverage_max,
        leverage_min: leverage_min || 1,
        min_order_size: min_order_size || 0.0001,
        max_order_size: max_order_size || 1000000,
        price_precision: price_precision || 8,
        quantity_precision: quantity_precision || 8,
        maker_fee: maker_fee || 0.001,
        taker_fee: taker_fee || 0.001,
        funding_rate,
        funding_interval: funding_interval || 8,
        underlying_asset,
        strike_price,
        expiry_date,
        is_active: true
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 