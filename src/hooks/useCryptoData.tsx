
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define types for cryptocurrency data
export interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: string;
  volume24h: number;
  marketCap: number;
  image: string;
}

const FALLBACK_DATA: CryptoPrice[] = [
  { symbol: "BTC/USDT", price: 48351.25, change24h: "+2.4%", volume24h: 24500000000, marketCap: 950000000000, image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
  { symbol: "ETH/USDT", price: 3254.60, change24h: "+1.7%", volume24h: 12000000000, marketCap: 380000000000, image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { symbol: "SOL/USDT", price: 152.30, change24h: "+3.8%", volume24h: 4500000000, marketCap: 65000000000, image: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  { symbol: "ADA/USDT", price: 0.45, change24h: "-0.8%", volume24h: 900000000, marketCap: 15000000000, image: "https://assets.coingecko.com/coins/images/975/large/cardano.png" }
];

// Function to fetch cryptocurrency data via cached edge function
export const useCryptoData = (coins: string[] = ['bitcoin', 'ethereum', 'solana', 'cardano']) => {
  const [data, setData] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);

        const { data: responseData, error: fnError } = await supabase.functions.invoke(
          'crypto-prices',
          { body: null, method: 'GET', headers: {} }
        );

        // supabase.functions.invoke with GET doesn't support query params easily,
        // so we'll call with the full URL instead
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/crypto-prices?coins=${coins.join(',')}`,
          {
            headers: {
              'Authorization': `Bearer ${anonKey}`,
              'apikey': anonKey,
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch cryptocurrency data');
        }

        const jsonData = await response.json();
        
        if (jsonData.error) {
          throw new Error(jsonData.error);
        }

        setData(jsonData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching crypto data:', err);
        setError(err.message || 'Failed to fetch data');
        
        toast({
          title: "Data Fetch Error",
          description: err.message || "Could not fetch cryptocurrency data",
          variant: "destructive",
        });
        
        // Fallback to sample data
        setData(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();

    // Poll every 60 seconds
    const intervalId = setInterval(fetchCryptoData, 60000);
    return () => clearInterval(intervalId);
  }, [coins.join(',')]);

  return { data, loading, error };
};
