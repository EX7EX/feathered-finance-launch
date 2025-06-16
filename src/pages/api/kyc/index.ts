import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const kycSubmissionSchema = z.object({
  address: z.string().min(42),
  fullName: z.string(),
  email: z.string().email(),
  country: z.string(),
  documentType: z.enum(['passport', 'id_card', 'drivers_license']),
  documentNumber: z.string(),
  documentImage: z.string(), // Base64 encoded image
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { address } = req.query;

      if (typeof address !== 'string') {
        return res.status(400).json({ error: 'Invalid address' });
      }

      const kyc = await prisma.kycVerification.findUnique({
        where: { address },
      });

      if (!kyc) {
        return res.status(404).json({ error: 'KYC verification not found' });
      }

      // Don't return sensitive data
      const { documentImage, ...safeData } = kyc;
      return res.status(200).json(safeData);
    } catch (error) {
      console.error('Error fetching KYC:', error);
      return res.status(500).json({ error: 'Failed to fetch KYC' });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = kycSubmissionSchema.parse(req.body);

      // Check if KYC already exists
      const existingKyc = await prisma.kycVerification.findUnique({
        where: { address: data.address },
      });

      if (existingKyc) {
        return res.status(400).json({ error: 'KYC verification already exists' });
      }

      const kyc = await prisma.kycVerification.create({
        data: {
          address: data.address,
          fullName: data.fullName,
          email: data.email,
          country: data.country,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          documentImage: data.documentImage,
          status: 'pending',
        },
      });

      // Don't return sensitive data
      const { documentImage, ...safeData } = kyc;
      return res.status(201).json(safeData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error submitting KYC:', error);
      return res.status(500).json({ error: 'Failed to submit KYC' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { address, status } = req.body;

      if (!address || typeof address !== 'string') {
        return res.status(400).json({ error: 'Invalid address' });
      }

      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const kyc = await prisma.kycVerification.update({
        where: { address },
        data: { status },
      });

      // Don't return sensitive data
      const { documentImage, ...safeData } = kyc;
      return res.status(200).json(safeData);
    } catch (error) {
      console.error('Error updating KYC:', error);
      return res.status(500).json({ error: 'Failed to update KYC' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 