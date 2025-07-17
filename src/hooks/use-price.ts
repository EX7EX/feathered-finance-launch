import { useState, useEffect } from 'react';

export function usePrice(symbol: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchPrice() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/prices?symbol=${symbol}`);
        if (!res.ok) throw new Error('Failed to fetch price');
        const data = await res.json();
        if (mounted) setPrice(data.usd);
      } catch (e: any) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, [symbol]);

  return { price, loading, error };
} 