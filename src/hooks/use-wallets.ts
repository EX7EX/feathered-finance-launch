import { useState, useEffect, useCallback } from 'react';

export function useWallets(token: string) {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/wallets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch wallets');
      setWallets(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchWallets(); }, [fetchWallets]);

  const addWallet = async (crypto_code: string, address: string, blockchain: string) => {
    setError(null);
    try {
      const res = await fetch('/api/wallets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ crypto_code, address, blockchain }),
      });
      if (!res.ok) throw new Error('Failed to add wallet');
      await fetchWallets();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return { wallets, loading, error, addWallet };
} 