import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '@/lib/auth-utils';
import { ExchangeEngine } from '@/lib/exchange-engine';

const exchangeEngine = new ExchangeEngine();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    // List user orders
    const { pair } = req.query;
    try {
      const orders = await exchangeEngine.getUserOrders(user.id, pair as string);
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  if (req.method === 'POST') {
    // Place new order
    const { side, pair, price, amount, order_type, time_in_force, stop_price } = req.body;

    if (!side || !pair || !price || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['buy', 'sell'].includes(side)) {
      return res.status(400).json({ error: 'Invalid side' });
    }

    try {
      const result = await exchangeEngine.placeOrder({
        user_id: user.id,
        side,
        pair,
        price: Number(price),
        amount: Number(amount),
        order_type,
        time_in_force,
        stop_price: stop_price ? Number(stop_price) : undefined
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  if (req.method === 'DELETE') {
    // Cancel order
    const { orderId } = req.query;
    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ error: 'Missing order ID' });
    }

    try {
      await exchangeEngine.cancelOrder(orderId, user.id);
      return res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 