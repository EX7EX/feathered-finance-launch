import type { NextApiRequest, NextApiResponse } from 'next';
import { ExchangeEngine } from '@/lib/exchange-engine';

const exchangeEngine = new ExchangeEngine();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { pair, depth } = req.query;
  if (!pair || typeof pair !== 'string') {
    return res.status(400).json({ error: 'Missing pair parameter' });
  }

  try {
    const orderBook = await exchangeEngine.getOrderBook(pair, depth ? Number(depth) : 50);
    return res.status(200).json(orderBook);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
} 