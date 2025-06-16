import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { verifyMessage } from 'ethers/lib/utils';

export type AuthenticatedRequest = NextApiRequest & {
  user?: {
    address: string;
    role: 'admin' | 'user';
  };
};

export async function withAuth(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => Promise<void>,
  options: {
    requireAdmin?: boolean;
    requireSignature?: boolean;
  } = {}
) {
  try {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify wallet signature if required
    if (options.requireSignature) {
      const { signature, message, address } = req.body;

      if (!signature || !message || !address) {
        return res.status(400).json({ error: 'Missing signature data' });
      }

      const recoveredAddress = verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Check admin role if required
    if (options.requireAdmin && session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Attach user to request
    req.user = {
      address: session.user.address,
      role: session.user.role,
    };

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 