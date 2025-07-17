import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TradingPair, MarketData } from '@/lib/exchange-engine';

interface TradingPairWithData extends TradingPair {
  marketData?: MarketData;
}

export default function TradingIndex() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [tradingPairs, setTradingPairs] = useState<TradingPairWithData[]>([]);
  const [filteredPairs, setFilteredPairs] = useState<TradingPairWithData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarketType, setSelectedMarketType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'volume' | 'change' | 'name'>('volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch trading pairs
  useEffect(() => {
    const fetchTradingPairs = async () => {
      try {
        const response = await fetch('/api/exchange/trading-pairs');
        const pairs = await response.json();
        setTradingPairs(pairs);
        setFilteredPairs(pairs);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load trading pairs",
          variant: "destructive",
        });
      }
    };

    fetchTradingPairs();
  }, [toast]);

  // Fetch market data for all pairs
  useEffect(() => {
    const fetchMarketData = async () => {
      const pairsWithData = await Promise.all(
        tradingPairs.map(async (pair) => {
          try {
            const response = await fetch(`/api/exchange/market-data?pair=${pair.symbol}&market_type=${pair.market_type}`);
            const marketData = await response.json();
            return { ...pair, marketData };
          } catch (error) {
            return pair;
          }
        })
      );
      
      setTradingPairs(pairsWithData);
      setFilteredPairs(pairsWithData);
    };

    if (tradingPairs.length > 0) {
      fetchMarketData();
      
      // Update market data every 5 seconds
      const interval = setInterval(fetchMarketData, 5000);
      return () => clearInterval(interval);
    }
  }, [tradingPairs.length]);

  // Filter and sort pairs
  useEffect(() => {
    let filtered = tradingPairs.filter(pair => {
      const matchesSearch = pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pair.base_currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pair.quote_currency.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMarketType = selectedMarketType === 'all' || pair.market_type === selectedMarketType;
      
      return matchesSearch && matchesMarketType;
    });

    // Sort pairs
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case 'volume':
          aValue = a.marketData?.volume_24h || 0;
          bValue = b.marketData?.volume_24h || 0;
          break;
        case 'change':
          aValue = a.marketData?.price_change_percent_24h || 0;
          bValue = b.marketData?.price_change_percent_24h || 0;
          break;
        case 'name':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        default:
          aValue = a.marketData?.volume_24h || 0;
          bValue = b.marketData?.volume_24h || 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

    setFilteredPairs(filtered);
  }, [tradingPairs, searchTerm, selectedMarketType, sortBy, sortOrder]);

  const handlePairClick = (pair: TradingPair) => {
    router.push(`/trading/${pair.symbol}`);
  };

  const getMarketTypeColor = (marketType: string) => {
    switch (marketType) {
      case 'spot': return 'bg-blue-100 text-blue-800';
      case 'perpetual': return 'bg-green-100 text-green-800';
      case 'futures': return 'bg-purple-100 text-purple-800';
      case 'options': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Markets</h1>
          <p className="text-muted-foreground">Trade cryptocurrencies with advanced features</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">Live</Badge>
          <span className="text-sm text-muted-foreground">
            {filteredPairs.length} markets available
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Market Type Filter */}
            <Select value={selectedMarketType} onValueChange={setSelectedMarketType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Market Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                <SelectItem value="spot">Spot</SelectItem>
                <SelectItem value="perpetual">Perpetual</SelectItem>
                <SelectItem value="futures">Futures</SelectItem>
                <SelectItem value="options">Options</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="change">24h Change</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full md:w-auto"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPairs.map((pair) => (
          <Card 
            key={pair.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handlePairClick(pair)}
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{pair.symbol}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pair.base_currency} / {pair.quote_currency}
                  </p>
                </div>
                <Badge className={getMarketTypeColor(pair.market_type)}>
                  {pair.market_type.toUpperCase()}
                </Badge>
              </div>

              {/* Price */}
              <div className="mb-3">
                <div className="text-xl font-bold">
                  ${pair.marketData?.last_price?.toLocaleString() || '--'}
                </div>
                <div className={`text-sm ${pair.marketData?.price_change_percent_24h && pair.marketData.price_change_percent_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {pair.marketData?.price_change_percent_24h ? 
                    `${pair.marketData.price_change_percent_24h >= 0 ? '+' : ''}${pair.marketData.price_change_percent_24h.toFixed(2)}%` : 
                    '--'
                  }
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Volume:</span>
                  <span>{pair.marketData?.volume_24h ? `${pair.marketData.volume_24h.toLocaleString()} ${pair.base_currency}` : '--'}</span>
                </div>
                
                {pair.market_type !== 'spot' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Funding Rate:</span>
                    <span>{pair.marketData?.funding_rate ? `${(pair.marketData.funding_rate * 100).toFixed(4)}%` : '--'}</span>
                  </div>
                )}

                {pair.leverage_max && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Leverage:</span>
                    <span>{pair.leverage_max}x</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fees:</span>
                  <span>{pair.maker_fee * 100}% / {pair.taker_fee * 100}%</span>
                </div>
              </div>

              {/* Action Button */}
              <Button className="w-full mt-3" variant="outline">
                Trade Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPairs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <h3 className="text-lg font-semibold mb-2">No markets found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Type Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="spot">Spot</TabsTrigger>
          <TabsTrigger value="perpetual">Perpetual</TabsTrigger>
          <TabsTrigger value="futures">Futures</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
        </TabsList>
        
        {['all', 'spot', 'perpetual', 'futures', 'options'].map((marketType) => (
          <TabsContent key={marketType} value={marketType}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPairs
                .filter(pair => marketType === 'all' || pair.market_type === marketType)
                .map((pair) => (
                  <Card 
                    key={pair.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handlePairClick(pair)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{pair.symbol}</h3>
                          <p className="text-sm text-muted-foreground">
                            {pair.base_currency} / {pair.quote_currency}
                          </p>
                        </div>
                        <Badge className={getMarketTypeColor(pair.market_type)}>
                          {pair.market_type.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <div className="text-xl font-bold">
                          ${pair.marketData?.last_price?.toLocaleString() || '--'}
                        </div>
                        <div className={`text-sm ${pair.marketData?.price_change_percent_24h && pair.marketData.price_change_percent_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {pair.marketData?.price_change_percent_24h ? 
                            `${pair.marketData.price_change_percent_24h >= 0 ? '+' : ''}${pair.marketData.price_change_percent_24h.toFixed(2)}%` : 
                            '--'
                          }
                        </div>
                      </div>

                      <Button className="w-full" variant="outline">
                        Trade Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 