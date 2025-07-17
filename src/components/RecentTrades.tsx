import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Trade {
  id: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

interface RecentTradesProps {
  pair: string;
  marketType: 'spot' | 'perpetual' | 'futures' | 'options';
}

export default function RecentTrades({ pair, marketType }: RecentTradesProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch recent trades
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await fetch(`/api/exchange/trades?pair=${pair}&market_type=${marketType}&limit=50`);
        const data = await response.json();
        setTrades(data);
      } catch (error) {
        console.error('Failed to fetch trades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();
    
    // Update every 2 seconds
    const interval = setInterval(fetchTrades, 2000);
    return () => clearInterval(interval);
  }, [pair, marketType]);

  // Calculate 24h volume
  const volume24h = trades.reduce((sum, trade) => sum + trade.amount, 0);
  
  // Calculate 24h high/low
  const prices = trades.map(trade => trade.price);
  const high24h = Math.max(...prices);
  const low24h = Math.min(...prices);

  // Calculate price change
  const priceChange = trades.length > 1 ? trades[0].price - trades[trades.length - 1].price : 0;
  const priceChangePercent = trades.length > 1 ? (priceChange / trades[trades.length - 1].price) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Trades</CardTitle>
          <Badge variant="outline">{trades.length} trades</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-96">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 p-4 border-b text-xs">
            <div>
              <div className="text-muted-foreground">24h Volume</div>
              <div className="font-medium">{volume24h.toFixed(6)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">24h Change</div>
              <div className={`font-medium ${priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">24h High</div>
              <div className="font-medium">${high24h.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">24h Low</div>
              <div className="font-medium">${low24h.toFixed(2)}</div>
            </div>
          </div>

          {/* Header */}
          <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
            <div>Price</div>
            <div>Amount</div>
            <div>Time</div>
          </div>

          {/* Trades List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-muted-foreground">Loading trades...</div>
                </div>
              </div>
            ) : trades.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-muted-foreground">No recent trades</div>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {trades.map((trade, index) => (
                  <div
                    key={trade.id}
                    className={`grid grid-cols-3 gap-2 px-4 py-1 text-sm border-b border-muted/20 ${
                      index === 0 ? 'bg-green-50 dark:bg-green-950/20' : ''
                    }`}
                  >
                    <div className={`font-medium ${trade.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                      ${trade.price.toFixed(2)}
                    </div>
                    <div>{trade.amount.toFixed(6)}</div>
                    <div className="text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 