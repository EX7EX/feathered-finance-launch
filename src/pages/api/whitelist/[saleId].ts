import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const whitelistEntrySchema = z.object({
  address: z.string().min(42),
  maxContribution: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { saleId } = req.query;

  if (typeof saleId !== 'string') {
    return res.status(400).json({ error: 'Invalid sale ID' });
  }

  if (req.method === 'GET') {
    try {
      const whitelist = await prisma.whitelistEntry.findMany({
        where: { saleId },
        include: {
          user: true,
        },
      });

      return res.status(200).json(whitelist);
    } catch (error) {
      console.error('Error fetching whitelist:', error);
      return res.status(500).json({ error: 'Failed to fetch whitelist' });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = whitelistEntrySchema.parse(req.body);

      const whitelistEntry = await prisma.whitelistEntry.create({
        data: {
          saleId,
          address: data.address,
          maxContribution: data.maxContribution,
        },
        include: {
          user: true,
        },
      });

      return res.status(201).json(whitelistEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error adding to whitelist:', error);
      return res.status(500).json({ error: 'Failed to add to whitelist' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { address } = req.body;

      if (!address || typeof address !== 'string') {
        return res.status(400).json({ error: 'Invalid address' });
      }

      await prisma.whitelistEntry.delete({
        where: {
          saleId_address: {
            saleId,
            address,
          },
        },
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Error removing from whitelist:', error);
      return res.status(500).json({ error: 'Failed to remove from whitelist' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 