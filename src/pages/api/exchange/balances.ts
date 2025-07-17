import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '@/lib/auth-utils';
import { createAdminSupabaseClient } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = createAdminSupabaseClient();

  if (req.method === 'GET') {
    // Get user balances
    const { data, error } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', user.id)
      .gt('available_balance', 0);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  if (req.method === 'POST') {
    // Deposit funds (for demo purposes)
    const { currency, amount } = req.body;

    if (!currency || !amount) {
      return res.status(400).json({ error: 'Missing currency or amount' });
    }

    try {
      // Check if balance exists
      const { data: existingBalance } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user.id)
        .eq('currency', currency)
        .single();

      if (existingBalance) {
        // Update existing balance
        const { data, error } = await supabase
          .from('user_balances')
          .update({
            balance: existingBalance.balance + Number(amount),
            available_balance: existingBalance.available_balance + Number(amount),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('currency', currency)
          .select()
          .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      } else {
        // Create new balance
        const { data, error } = await supabase
          .from('user_balances')
          .insert([{
            user_id: user.id,
            currency,
            balance: Number(amount),
            available_balance: Number(amount),
            locked_balance: 0
          }])
          .select()
          .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
      }
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 