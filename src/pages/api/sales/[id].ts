import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid sale ID' });
  }

  if (req.method === 'GET') {
    try {
      const sale = await prisma.sale.findUnique({
        where: { id },
        include: {
          token: true,
          vestingSchedule: true,
          contributions: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!sale) {
        return res.status(404).json({ error: 'Sale not found' });
      }

      return res.status(200).json(sale);
    } catch (error) {
      console.error('Error fetching sale:', error);
      return res.status(500).json({ error: 'Failed to fetch sale' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { status } = req.body;

      if (!status || !['pending', 'active', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const sale = await prisma.sale.update({
        where: { id },
        data: { status },
        include: {
          token: true,
          vestingSchedule: true,
        },
      });

      return res.status(200).json(sale);
    } catch (error) {
      console.error('Error updating sale:', error);
      return res.status(500).json({ error: 'Failed to update sale' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.sale.delete({
        where: { id },
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting sale:', error);
      return res.status(500).json({ error: 'Failed to delete sale' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 