import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return withAuth(req, res, async () => {
      try {
        const { period = '7d' } = req.query;

        // Calculate date range based on period
        const now = new Date();
        let startDate: Date;

        switch (period) {
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        // Get sales analytics
        const salesAnalytics = await prisma.sale.aggregate({
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          _count: {
            id: true,
          },
          _sum: {
            totalRaised: true,
          },
        });

        // Get distribution analytics
        const distributionAnalytics = await prisma.distribution.aggregate({
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          _count: {
            id: true,
          },
          _sum: {
            totalAmount: true,
          },
        });

        // Get contribution analytics
        const contributionAnalytics = await prisma.contribution.aggregate({
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          _count: {
            id: true,
          },
          _sum: {
            amount: true,
          },
        });

        // Get KYC analytics
        const kycAnalytics = await prisma.kycVerification.groupBy({
          by: ['status'],
          _count: {
            id: true,
          },
          where: {
            createdAt: {
              gte: startDate,
            },
          },
        });

        return res.status(200).json({
          sales: {
            total: salesAnalytics._count.id,
            totalRaised: salesAnalytics._sum.totalRaised || 0,
          },
          distributions: {
            total: distributionAnalytics._count.id,
            totalAmount: distributionAnalytics._sum.totalAmount || 0,
          },
          contributions: {
            total: contributionAnalytics._count.id,
            totalAmount: contributionAnalytics._sum.amount || 0,
          },
          kyc: kycAnalytics.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
          }, {} as Record<string, number>),
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        return res.status(500).json({ error: 'Failed to fetch analytics' });
      }
    }, { requireAdmin: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 