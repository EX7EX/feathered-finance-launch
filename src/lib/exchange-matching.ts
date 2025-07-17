import { createAdminSupabaseClient } from '@/integrations/supabase/client';

// Minimal matching engine: match and settle a single order
export async function matchAndSettleOrder(orderId: string): Promise<void> {
  const supabase = createAdminSupabaseClient();
  // Fetch the new order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (orderError || !order) return;
  if (order.status !== 'open') return;
  const isBuy = order.side === 'buy';
  // Find matching orders (opposite side, open, price compatible)
  const { data: matches } = await supabase
    .from('orders')
    .select('*')
    .eq('pair', order.pair)
    .eq('side', isBuy ? 'sell' : 'buy')
    .eq('status', 'open')
    .order('price', { ascending: isBuy }) // buy: lowest ask, sell: highest bid
    .order('created_at', { ascending: true });
  let remaining = Number(order.amount) - Number(order.filled);
  for (const match of matches || []) {
    if (remaining <= 0) break;
    // Price check
    if (isBuy && Number(match.price) > Number(order.price)) break;
    if (!isBuy && Number(match.price) < Number(order.price)) break;
    const matchRemaining = Number(match.amount) - Number(match.filled);
    const tradeAmount = Math.min(remaining, matchRemaining);
    const tradePrice = match.price;
    // Create trade
    await supabase.from('trades').insert([
      {
        buy_order_id: isBuy ? order.id : match.id,
        sell_order_id: isBuy ? match.id : order.id,
        pair: order.pair,
        price: tradePrice,
        amount: tradeAmount,
        taker_side: order.side,
      },
    ]);
    // Update filled amounts and status
    const updates = [];
    const newOrderFilled = Number(order.filled) + tradeAmount;
    const newMatchFilled = Number(match.filled) + tradeAmount;
    updates.push(
      supabase.from('orders').update({ filled: newOrderFilled, status: newOrderFilled >= Number(order.amount) ? 'filled' : 'partial', updated_at: new Date().toISOString() }).eq('id', order.id)
    );
    updates.push(
      supabase.from('orders').update({ filled: newMatchFilled, status: newMatchFilled >= Number(match.amount) ? 'filled' : 'partial', updated_at: new Date().toISOString() }).eq('id', match.id)
    );
    await Promise.all(updates);
    // TODO: Update user balances atomically (out of scope for this minimal version)
    remaining -= tradeAmount;
  }
} 