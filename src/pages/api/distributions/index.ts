import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const createDistributionSchema = z.object({
  tokenAddress: z.string().min(42),
  recipients: z.array(z.object({
    address: z.string().min(42),
    amount: z.string(),
  })),
  vestingEnabled: z.boolean(),
  vestingSchedule: z.object({
    tgePercentage: z.number(),
    cliffMonths: z.number(),
    vestingMonths: z.number(),
  }).optional(),
  transactionHash: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const distributions = await prisma.distribution.findMany({
        include: {
          token: true,
          vestingSchedule: true,
          recipients: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json(distributions);
    } catch (error) {
      console.error('Error fetching distributions:', error);
      return res.status(500).json({ error: 'Failed to fetch distributions' });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = createDistributionSchema.parse(req.body);

      const distribution = await prisma.distribution.create({
        data: {
          tokenAddress: data.tokenAddress,
          transactionHash: data.transactionHash,
          vestingEnabled: data.vestingEnabled,
          vestingSchedule: data.vestingSchedule ? {
            create: {
              tgePercentage: data.vestingSchedule.tgePercentage,
              cliffMonths: data.vestingSchedule.cliffMonths,
              vestingMonths: data.vestingSchedule.vestingMonths,
            },
          } : undefined,
          recipients: {
            create: data.recipients.map(recipient => ({
              address: recipient.address,
              amount: recipient.amount,
            })),
          },
        },
        include: {
          token: true,
          vestingSchedule: true,
          recipients: true,
        },
      });

      return res.status(201).json(distribution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating distribution:', error);
      return res.status(500).json({ error: 'Failed to create distribution' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 