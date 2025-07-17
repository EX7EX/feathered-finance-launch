import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ExchangeEngine, TradingPair, OrderBook, MarketData } from '@/lib/exchange-engine';

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

interface Trade {
  id: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

export default function TradingPage() {
  const router = useRouter();
  const { pair } = router.query;
  const { toast } = useToast();
  
  const [tradingPair, setTradingPair] = useState<TradingPair | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [userBalances, setUserBalances] = useState<Record<string, number>>({});
  
  // Order placement state
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [orderTotal, setOrderTotal] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // Market type
  const [marketType, setMarketType] = useState<'spot' | 'perpetual' | 'futures'>('spot');

  const exchangeEngine = new ExchangeEngine();

  // Fetch trading pair data
  useEffect(() => {
    if (!pair) return;
    
    const fetchTradingPair = async () => {
      try {
        const pairs = await exchangeEngine.getTradingPairs();
        const foundPair = pairs.find(p => p.symbol === pair);
        if (foundPair) {
          setTradingPair(foundPair);
          setMarketType(foundPair.market_type as any);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load trading pair",
          variant: "destructive",
        });
      }
    };

    fetchTradingPair();
  }, [pair, toast]);

  // Fetch order book
  const fetchOrderBook = useCallback(async () => {
    if (!pair || !marketType) return;
    
    try {
      const book = await exchangeEngine.getOrderBook(pair as string, marketType);
      setOrderBook(book);
    } catch (error) {
      console.error('Failed to fetch order book:', error);
    }
  }, [pair, marketType]);

  // Fetch market data
  const fetchMarketData = useCallback(async () => {
    if (!pair || !marketType) return;
    
    try {
      const response = await fetch(`/api/exchange/market-data?pair=${pair}&market_type=${marketType}`);
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    }
  }, [pair, marketType]);

  // Fetch user balances
  const fetchUserBalances = useCallback(async () => {
    try {
      const response = await fetch('/api/exchange/balances');
      const balances = await response.json();
      const balanceMap: Record<string, number> = {};
      balances.forEach((balance: any) => {
        balanceMap[balance.currency] = balance.available_balance;
      });
      setUserBalances(balanceMap);
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    }
  }, []);

  // Real-time updates
  useEffect(() => {
    fetchOrderBook();
    fetchMarketData();
    fetchUserBalances();

    const interval = setInterval(() => {
      fetchOrderBook();
      fetchMarketData();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchOrderBook, fetchMarketData, fetchUserBalances]);

  // Calculate order total
  useEffect(() => {
    if (orderPrice && orderAmount) {
      const total = parseFloat(orderPrice) * parseFloat(orderAmount);
      setOrderTotal(total.toFixed(8));
    } else {
      setOrderTotal('');
    }
  }, [orderPrice, orderAmount]);

  // Place order
  const handlePlaceOrder = async () => {
    if (!tradingPair || !orderPrice || !orderAmount) {
      toast({
        title: "Error",
        description: "Please fill in all order details",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingOrder(true);
    try {
      const response = await fetch('/api/exchange/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          side: orderSide,
          pair: tradingPair.symbol,
          market_type: marketType,
          price: parseFloat(orderPrice),
          amount: parseFloat(orderAmount),
          order_type: orderType,
          leverage: marketType !== 'spot' ? leverage : undefined,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `${orderSide.toUpperCase()} order placed successfully`,
        });
        
        // Reset form
        setOrderPrice('');
        setOrderAmount('');
        setOrderTotal('');
        
        // Refresh data
        fetchOrderBook();
        fetchUserBalances();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Quick order buttons
  const handleQuickOrder = (side: 'buy' | 'sell', percentage: number) => {
    setOrderSide(side);
    if (orderBook) {
      const bestPrice = side === 'buy' ? orderBook.asks[0]?.price : orderBook.bids[0]?.price;
      if (bestPrice) {
        setOrderPrice(bestPrice.toString());
      }
    }
  };

  if (!tradingPair) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Loading trading pair data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{tradingPair.symbol}</h1>
          <p className="text-muted-foreground">
            {tradingPair.base_currency} / {tradingPair.quote_currency} • {marketType.toUpperCase()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {marketData?.last_price ? `$${marketData.last_price.toLocaleString()}` : '--'}
          </div>
          <div className={`text-sm ${marketData?.price_change_percent_24h && marketData.price_change_percent_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {marketData?.price_change_percent_24h ? `${marketData.price_change_percent_24h >= 0 ? '+' : ''}${marketData.price_change_percent_24h.toFixed(2)}%` : '--'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Order Book */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Order Book</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Asks (Sell Orders) */}
              <div className="space-y-1">
                {orderBook?.asks.slice(0, 10).map((ask, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-red-600">{ask.price.toFixed(tradingPair.price_precision)}</span>
                    <span>{ask.amount.toFixed(tradingPair.quantity_precision)}</span>
                    <span className="text-muted-foreground">{ask.count}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Bids (Buy Orders) */}
              <div className="space-y-1">
                {orderBook?.bids.slice(0, 10).map((bid, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-green-600">{bid.price.toFixed(tradingPair.price_precision)}</span>
                    <span>{bid.amount.toFixed(tradingPair.quantity_precision)}</span>
                    <span className="text-muted-foreground">{bid.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Price Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Chart Integration</p>
                <p className="text-sm text-muted-foreground">TradingView or custom chart will be integrated here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Placement */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Place Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Market Type Selector */}
            <div className="space-y-2">
              <Label>Market Type</Label>
              <Select value={marketType} onValueChange={(value: any) => setMarketType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spot">Spot</SelectItem>
                  <SelectItem value="perpetual">Perpetual</SelectItem>
                  <SelectItem value="futures">Futures</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order Type */}
            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="market">Market</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leverage (for derivatives) */}
            {marketType !== 'spot' && (
              <div className="space-y-2">
                <Label>Leverage</Label>
                <Select value={leverage.toString()} onValueChange={(value) => setLeverage(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 5, 10, 20, 50, 100, 125].map(lev => (
                      <SelectItem key={lev} value={lev.toString()}>{lev}x</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quick Order Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickOrder('buy', 25)}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Buy 25%
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickOrder('sell', 25)}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Sell 25%
              </Button>
            </div>

            {/* Order Side */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={orderSide === 'buy' ? 'default' : 'outline'}
                onClick={() => setOrderSide('buy')}
                className={orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                Buy
              </Button>
              <Button
                variant={orderSide === 'sell' ? 'default' : 'outline'}
                onClick={() => setOrderSide('sell')}
                className={orderSide === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Sell
              </Button>
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <Label>Price ({tradingPair.quote_currency})</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={orderPrice}
                onChange={(e) => setOrderPrice(e.target.value)}
                step={1 / Math.pow(10, tradingPair.price_precision)}
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label>Amount ({tradingPair.base_currency})</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={orderAmount}
                onChange={(e) => setOrderAmount(e.target.value)}
                step={1 / Math.pow(10, tradingPair.quantity_precision)}
              />
            </div>

            {/* Total */}
            <div className="space-y-2">
              <Label>Total ({tradingPair.quote_currency})</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={orderTotal}
                readOnly
                className="bg-muted"
              />
            </div>

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || !orderPrice || !orderAmount}
              className={`w-full ${orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isPlacingOrder ? 'Placing...' : `${orderSide.toUpperCase()} ${tradingPair.base_currency}`}
            </Button>

            {/* Balance Display */}
            <div className="text-sm text-muted-foreground">
              <div>Available {tradingPair.base_currency}: {userBalances[tradingPair.base_currency]?.toFixed(8) || '0.00000000'}</div>
              <div>Available {tradingPair.quote_currency}: {userBalances[tradingPair.quote_currency]?.toFixed(2) || '0.00'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">24h High</div>
            <div className="text-lg font-semibold">{marketData?.high_24h ? `$${marketData.high_24h.toLocaleString()}` : '--'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">24h Low</div>
            <div className="text-lg font-semibold">{marketData?.low_24h ? `$${marketData.low_24h.toLocaleString()}` : '--'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">24h Volume</div>
            <div className="text-lg font-semibold">{marketData?.volume_24h ? `${marketData.volume_24h.toLocaleString()} ${tradingPair.base_currency}` : '--'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Funding Rate</div>
            <div className="text-lg font-semibold">
              {marketData?.funding_rate ? `${(marketData.funding_rate * 100).toFixed(4)}%` : '--'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentTrades.length > 0 ? (
              recentTrades.map((trade, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className={trade.side === 'buy' ? 'text-green-600' : 'text-red-600'}>
                    ${trade.price.toLocaleString()}
                  </span>
                  <span>{trade.amount.toFixed(6)}</span>
                  <span className="text-muted-foreground">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No recent trades
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 