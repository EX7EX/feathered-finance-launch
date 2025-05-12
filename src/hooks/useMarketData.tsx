
import { useState, useEffect } from 'react';

export interface MarketChartData {
  name: string;
  [key: string]: number | string; // For dynamic coin data
}

export const useMarketData = (
  coins: string[] = ['bitcoin', 'ethereum'],
  timeframe: '1h' | '1d' | '7d' | '30d' | '90d' = '7d'
) => {
  const [chartData, setChartData] = useState<MarketChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

        // Fetch data for each coin
        const dataPromises = coins.map(async (coin) => {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`
          );
          
          if (!response.ok) {
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
        if (timeframe === '30d') dataPointInterval = 6; // Every 6 hours for 30 days
        if (timeframe === '90d') dataPointInterval = 24; // Daily for 90 days
        
        // Process price data into chart format
        for (let i = 0; i < minDataPoints; i += dataPointInterval) {
          if (i % dataPointInterval === 0) {
            const dataPoint: MarketChartData = {
              name: new Date(results[0].data.prices[i][0]).toLocaleDateString()
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
        
        // Fallback data if API fails
        setChartData([
          { name: "Jan", BTC: 42000, ETH: 3200 },
          { name: "Feb", BTC: 44000, ETH: 3000 },
          { name: "Mar", BTC: 47000, ETH: 3300 },
          { name: "Apr", BTC: 45000, ETH: 3100 },
          { name: "May", BTC: 49000, ETH: 3500 },
          { name: "Jun", BTC: 50000, ETH: 3400 },
          { name: "Jul", BTC: 48000, ETH: 3200 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [timeframe, coins.join(',')]);

  return { chartData, loading, error };
};
