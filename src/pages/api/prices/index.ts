import type { NextApiRequest, NextApiResponse } from 'next';

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { symbol } = req.query;
  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Missing symbol' });
  }
  // Accept any symbol, use CoinGecko API directly
  try {
    const url = `${COINGECKO_API}?ids=${symbol.toLowerCase()}&vs_currencies=usd`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('CoinGecko error');
    const data = await response.json();
    if (!data[symbol.toLowerCase()] || typeof data[symbol.toLowerCase()].usd !== 'number') {
      return res.status(502).json({ error: 'Price not available' });
    }
    return res.status(200).json({ symbol, usd: data[symbol.toLowerCase()].usd });
  } catch (e) {
    return res.status(502).json({ error: 'Failed to fetch price' });
  }
} 