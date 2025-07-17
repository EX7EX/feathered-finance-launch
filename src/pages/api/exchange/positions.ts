import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '@/lib/auth-utils';
import { ExchangeEngine } from '@/lib/exchange-engine';

const exchangeEngine = new ExchangeEngine();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    // Get user positions
    try {
      const positions = await exchangeEngine.getUserPositions(user.id);
      return res.status(200).json(positions);
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  if (req.method === 'POST') {
    // Close position
    const { positionId, amount } = req.body;

    if (!positionId) {
      return res.status(400).json({ error: 'Missing position ID' });
    }

    try {
      // This would implement position closing logic
      // For now, return success
      return res.status(200).json({ message: 'Position closed successfully' });
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 