import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OrderBookLevel {
  price: number;
  amount: number;
  count: number;
}

interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: string;
  sequence_number: number;
}

interface OrderBookProps {
  pair: string;
  marketType: 'spot' | 'perpetual' | 'futures' | 'options';
  onPriceSelect?: (price: number, side: 'buy' | 'sell') => void;
}

export default function OrderBook({ pair, marketType, onPriceSelect }: OrderBookProps) {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [depth, setDepth] = useState(20);
  const [grouping, setGrouping] = useState(0.1);

  // Fetch order book data
  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const response = await fetch(`/api/exchange/orderbook?pair=${pair}&market_type=${marketType}&depth=${depth}`);
        const data = await response.json();
        setOrderBook(data);
      } catch (error) {
        console.error('Failed to fetch order book:', error);
      }
    };

    fetchOrderBook();
    
    // Update every second
    const interval = setInterval(fetchOrderBook, 1000);
    return () => clearInterval(interval);
  }, [pair, marketType, depth]);

  // Group order book levels
  const groupOrderBook = (levels: OrderBookLevel[], grouping: number) => {
    if (grouping === 0) return levels;

    const grouped = new Map<number, { amount: number; count: number }>();
    
    levels.forEach(level => {
      const groupedPrice = Math.floor(level.price / grouping) * grouping;
      if (grouped.has(groupedPrice)) {
        grouped.get(groupedPrice)!.amount += level.amount;
        grouped.get(groupedPrice)!.count += level.count;
      } else {
        grouped.set(groupedPrice, { amount: level.amount, count: level.count });
      }
    });

    return Array.from(grouped.entries())
      .map(([price, { amount, count }]) => ({ price, amount, count }))
      .sort((a, b) => b.price - a.price);
  };

  const groupedAsks = orderBook ? groupOrderBook(orderBook.asks, grouping) : [];
  const groupedBids = orderBook ? groupOrderBook(orderBook.bids, grouping) : [];

  // Calculate max amount for depth visualization
  const maxAmount = Math.max(
    ...groupedAsks.map(ask => ask.amount),
    ...groupedBids.map(bid => bid.amount)
  );

  const handlePriceClick = (price: number, side: 'buy' | 'sell') => {
    if (onPriceSelect) {
      onPriceSelect(price, side);
    }
  };

  const getSpread = () => {
    if (!orderBook || orderBook.asks.length === 0 || orderBook.bids.length === 0) {
      return { spread: 0, spreadPercent: 0 };
    }

    const bestAsk = orderBook.asks[0].price;
    const bestBid = orderBook.bids[0].price;
    const spread = bestAsk - bestBid;
    const spreadPercent = (spread / bestAsk) * 100;

    return { spread, spreadPercent };
  };

  const { spread, spreadPercent } = getSpread();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Order Book</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{depth} levels</Badge>
            <Badge variant="outline">
              Spread: ${spread.toFixed(2)} ({spreadPercent.toFixed(2)}%)
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-96">
          {/* Header */}
          <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
            <div>Price</div>
            <div>Amount</div>
            <div>Count</div>
          </div>

          {/* Asks (Sell Orders) */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-0">
              {groupedAsks.slice(0, depth).map((ask, index) => (
                <div
                  key={`ask-${index}`}
                  className="grid grid-cols-3 gap-2 px-4 py-1 text-sm hover:bg-muted/50 cursor-pointer relative group"
                  onClick={() => handlePriceClick(ask.price, 'sell')}
                >
                  {/* Depth visualization */}
                  <div 
                    className="absolute inset-0 bg-red-500/10"
                    style={{ 
                      width: `${(ask.amount / maxAmount) * 100}%`,
                      right: 0
                    }}
                  />
                  
                  <div className="text-red-600 font-medium relative z-10">
                    {ask.price.toFixed(2)}
                  </div>
                  <div className="relative z-10">
                    {ask.amount.toFixed(6)}
                  </div>
                  <div className="text-muted-foreground relative z-10">
                    {ask.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spread Indicator */}
          <div className="px-4 py-2 bg-muted/50 text-center text-sm font-medium">
            <div className="text-muted-foreground">
              Spread: ${spread.toFixed(2)} ({spreadPercent.toFixed(2)}%)
            </div>
          </div>

          {/* Bids (Buy Orders) */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-0">
              {groupedBids.slice(0, depth).map((bid, index) => (
                <div
                  key={`bid-${index}`}
                  className="grid grid-cols-3 gap-2 px-4 py-1 text-sm hover:bg-muted/50 cursor-pointer relative group"
                  onClick={() => handlePriceClick(bid.price, 'buy')}
                >
                  {/* Depth visualization */}
                  <div 
                    className="absolute inset-0 bg-green-500/10"
                    style={{ 
                      width: `${(bid.amount / maxAmount) * 100}%`,
                      left: 0
                    }}
                  />
                  
                  <div className="text-green-600 font-medium relative z-10">
                    {bid.price.toFixed(2)}
                  </div>
                  <div className="relative z-10">
                    {bid.amount.toFixed(6)}
                  </div>
                  <div className="text-muted-foreground relative z-10">
                    {bid.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Depth</Label>
            <div className="flex space-x-1">
              {[10, 20, 50, 100].map((d) => (
                <Button
                  key={d}
                  variant={depth === d ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDepth(d)}
                  className="px-2 py-1 text-xs"
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm">Grouping</Label>
            <div className="flex space-x-1">
              {[0, 0.1, 0.5, 1, 5].map((g) => (
                <Button
                  key={g}
                  variant={grouping === g ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGrouping(g)}
                  className="px-2 py-1 text-xs"
                >
                  {g === 0 ? 'None' : g.toString()}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 