
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define types for cryptocurrency data
export interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: string;
  volume24h: number;
  marketCap: number;
  image: string;
}

// Function to fetch real cryptocurrency data from CoinGecko API
export const useCryptoData = (coins: string[] = ['bitcoin', 'ethereum', 'solana', 'cardano']) => {
  const [data, setData] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        
        // Add a small random delay to prevent rate limiting issues
        const randomDelay = Math.floor(Math.random() * 500);
        await new Promise(resolve => setTimeout(resolve, randomDelay));
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coins.join(',')}&order=market_cap_desc&per_page=${coins.length}&page=1&sparkline=false&price_change_percentage=24h`,
          {
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
            }
          }
        );
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
          }
          throw new Error('Failed to fetch cryptocurrency data');
        }
        
        const jsonData = await response.json();
        
        const formattedData = jsonData.map((coin: any) => ({
          symbol: coin.symbol.toUpperCase() + '/USDT',
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h?.toFixed(1) + '%',
          volume24h: coin.total_volume,
          marketCap: coin.market_cap,
          image: coin.image
        }));
        
        setData(formattedData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching crypto data:', err);
        setError(err.message || 'Failed to fetch data');
        
        // Show toast notification on error
        toast({
          title: "Data Fetch Error",
          description: err.message || "Could not fetch cryptocurrency data",
          variant: "destructive",
        });
        
        // Fallback to sample data if the API fails
        setData([
          { symbol: "BTC/USDT", price: 48351.25, change24h: "+2.4%", volume24h: 24500000000, marketCap: 950000000000, image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
          { symbol: "ETH/USDT", price: 3254.60, change24h: "+1.7%", volume24h: 12000000000, marketCap: 380000000000, image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
          { symbol: "SOL/USDT", price: 152.30, change24h: "+3.8%", volume24h: 4500000000, marketCap: 65000000000, image: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
          { symbol: "ADA/USDT", price: 0.45, change24h: "-0.8%", volume24h: 900000000, marketCap: 15000000000, image: "https://assets.coingecko.com/coins/images/975/large/cardano.png" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();

    // Set up polling for real-time updates
    const intervalId = setInterval(fetchCryptoData, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [coins.join(',')]);

  return { data, loading, error };
};
