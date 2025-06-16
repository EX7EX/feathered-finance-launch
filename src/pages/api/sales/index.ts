import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const createSaleSchema = z.object({
  tokenAddress: z.string().min(42),
  saleType: z.enum(['fixed', 'dutch']),
  startTime: z.number(),
  endTime: z.number(),
  price: z.string(),
  minContribution: z.string(),
  maxContribution: z.string(),
  softCap: z.string(),
  hardCap: z.string(),
  vestingSchedule: z.object({
    tgePercentage: z.number(),
    cliffMonths: z.number(),
    vestingMonths: z.number(),
  }).optional(),
  whitelistEnabled: z.boolean(),
  kycRequired: z.boolean(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const sales = await prisma.sale.findMany({
        include: {
          token: true,
          vestingSchedule: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json(sales);
    } catch (error) {
      console.error('Error fetching sales:', error);
      return res.status(500).json({ error: 'Failed to fetch sales' });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = createSaleSchema.parse(req.body);

      const sale = await prisma.sale.create({
        data: {
          tokenAddress: data.tokenAddress,
          saleType: data.saleType,
          startTime: new Date(data.startTime * 1000),
          endTime: new Date(data.endTime * 1000),
          price: data.price,
          minContribution: data.minContribution,
          maxContribution: data.maxContribution,
          softCap: data.softCap,
          hardCap: data.hardCap,
          whitelistEnabled: data.whitelistEnabled,
          kycRequired: data.kycRequired,
          vestingSchedule: data.vestingSchedule ? {
            create: {
              tgePercentage: data.vestingSchedule.tgePercentage,
              cliffMonths: data.vestingSchedule.cliffMonths,
              vestingMonths: data.vestingSchedule.vestingMonths,
            },
          } : undefined,
        },
        include: {
          token: true,
          vestingSchedule: true,
        },
      });

      return res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating sale:', error);
      return res.status(500).json({ error: 'Failed to create sale' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 