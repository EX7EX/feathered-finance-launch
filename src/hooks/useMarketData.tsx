
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface MarketChartData {
  name: string;
  timestamp: number;
  [key: string]: number | string; // For dynamic coin data
}

export const useMarketData = (
  coins: string[] = ['bitcoin', 'ethereum'],
  timeframe: '1h' | '1d' | '7d' | '30d' | '90d' = '7d'
) => {
  const [chartData, setChartData] = useState<MarketChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);

        // Convert timeframe to days for API
        let days: number;
        switch (timeframe) {
          case '1h':
            days = 1/24; // 1 hour
            break;
          case '1d':
            days = 1;
            break;
          case '7d':
            days = 7;
            break;
          case '30d':
            days = 30;
            break;
          case '90d':
            days = 90;
            break;
          default:
            days = 7;
        }

        // Add a small random delay to prevent rate limiting issues
        const randomDelay = Math.floor(Math.random() * 300);
        await new Promise(resolve => setTimeout(resolve, randomDelay));

        // Fetch data for each coin
        const dataPromises = coins.map(async (coin) => {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`,
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
            throw new Error(`Failed to fetch data for ${coin}`);
          }
          
          return {
            coin,
            data: await response.json()
          };
        });

        const results = await Promise.all(dataPromises);
        
        // Process and format the data for the chart
        const processedData: MarketChartData[] = [];
        
        // Get the shortest prices array to normalize data points
        let minDataPoints = Math.min(
          ...results.map(result => result.data.prices.length)
        );
        
        // Limit the number of points based on timeframe for better visualization
        let dataPointInterval = 1;
        if (timeframe === '1h') dataPointInterval = 3; // Every 3 minutes for 1 hour
        if (timeframe === '1d') dataPointInterval = 12; // Every 2 hours for 1 day
        if (timeframe === '7d') dataPointInterval = 24; // Every 7 hours for 7 days
        if (timeframe === '30d') dataPointInterval = 48; // Every day for 30 days
        if (timeframe === '90d') dataPointInterval = 90; // Every 3 days for 90 days
        
        // Process price data into chart format
        for (let i = 0; i < minDataPoints; i += dataPointInterval) {
          if (i % dataPointInterval === 0) {
            const timestamp = results[0].data.prices[i][0];
            const dataPoint: MarketChartData = {
              name: new Date(timestamp).toLocaleDateString(),
              timestamp: timestamp
            };
            
            results.forEach((result) => {
              // Use coin symbol as key
              const symbol = result.coin.substring(0, 3).toUpperCase();
              dataPoint[symbol] = result.data.prices[i][1];
            });
            
            processedData.push(dataPoint);
          }
        }
        
        setChartData(processedData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching market data:', err);
        setError(err.message || 'Failed to fetch market data');
        
        toast({
          title: "Market Data Error",
          description: err.message || "Could not fetch market chart data",
          variant: "destructive",
        });
        
        // Fallback data if API fails - generate more realistic data based on timeframe
        const fallbackData = generateFallbackChartData(timeframe, coins);
        setChartData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();

    // Set up interval for real-time data if looking at short timeframes
    let intervalTime = 60000; // 1 minute for default
    if (timeframe === '1h') intervalTime = 30000; // 30 seconds for 1 hour view
    
    const intervalId = timeframe === '1h' || timeframe === '1d' 
      ? setInterval(fetchMarketData, intervalTime) 
      : null;

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timeframe, coins.join(',')]);

  return { chartData, loading, error };
};

// Helper function to generate realistic fallback chart data
const generateFallbackChartData = (timeframe: string, coins: string[]): MarketChartData[] => {
  const now = new Date();
  const data: MarketChartData[] = [];
  let points = 7;
  let timeStep = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  
  // Configure based on timeframe
  switch (timeframe) {
    case '1h':
      points = 12;
      timeStep = 5 * 60 * 1000; // 5 minutes
      break;
    case '1d':
      points = 24;
      timeStep = 60 * 60 * 1000; // 1 hour
      break;
    case '7d':
      points = 7;
      timeStep = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '30d':
      points = 30;
      timeStep = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '90d':
      points = 90;
      timeStep = 24 * 60 * 60 * 1000; // 1 day
      break;
  }

  // Base prices for common cryptos
  const basePrices: {[key: string]: number} = {
    'bitcoin': 45000,
    'ethereum': 3200,
    'solana': 150,
    'cardano': 0.45,
    'ripple': 0.50,
    'polkadot': 5.50,
    'dogecoin': 0.07,
    'avalanche': 30,
    'binancecoin': 320,
    'polygon': 0.70
  };

  // Generate data points
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = now.getTime() - (i * timeStep);
    const dataPoint: MarketChartData = {
      name: new Date(timestamp).toLocaleDateString(),
      timestamp: timestamp
    };
    
    coins.forEach(coin => {
      const symbol = coin.substring(0, 3).toUpperCase();
      const basePrice = basePrices[coin] || 100;
      
      // Create realistic price fluctuations
      const volatilityFactor = timeframe === '1h' ? 0.002 : 
                               timeframe === '1d' ? 0.005 : 
                               timeframe === '7d' ? 0.015 : 0.03;
                               
      const randomFactor = 1 + ((Math.random() - 0.5) * volatilityFactor);
      const trendFactor = 1 + ((i / points) * (Math.random() > 0.5 ? 0.1 : -0.05));
      
      dataPoint[symbol] = basePrice * randomFactor * trendFactor;
    });
    
    data.push(dataPoint);
  }
  
  return data;
};
