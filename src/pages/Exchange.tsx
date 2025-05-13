
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  ArrowDownIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  InfoIcon,
  WalletIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCryptoData, CryptoPrice } from "@/hooks/useCryptoData";
import { useMarketData } from "@/hooks/useMarketData";
import { formatCurrency, formatCryptoValue } from "@/lib/auth-utils";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { 
  Area, 
  AreaChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { useUserAssets } from "@/hooks/use-user-assets";
import WalletModal from "@/components/WalletModal";

// Custom order type
interface Order {
  id: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  date: Date;
  status: 'open' | 'filled' | 'canceled';
  pair: string;
}

const Exchange = () => {
  // State management
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [orderType, setOrderType] = useState("market");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [timeframe, setTimeframe] = useState("1D");
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  // Get data from hooks
  const { toast } = useToast();
  const { data: cryptoData, loading: loadingCrypto } = useCryptoData(['bitcoin', 'ethereum', 'solana', 'cardano']);
  const { chartData, loading: loadingChart } = useMarketData([selectedCoin], getTimeframeParam(timeframe));
  const { cryptoWallets, fiatAccounts } = useUserAssets();
  
  // Find the selected cryptocurrency in the data
  const selectedCryptoData = cryptoData.find(
    (crypto) => crypto.symbol === selectedPair
  ) || {
    symbol: "BTC/USDT",
    price: 48351.25,
    change24h: "+2.4%",
    volume24h: 24500000000,
    marketCap: 950000000000,
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
  };
  
  // Update price inputs when cryptocurrency selection changes
  useEffect(() => {
    if (selectedCryptoData) {
      const currentPrice = selectedCryptoData.price.toString();
      setBuyPrice(currentPrice);
      setSellPrice(currentPrice);
    }
  }, [selectedCryptoData]);
  
  // Convert timeframe to useMarketData parameter
  function getTimeframeParam(timeframe: string) {
    switch (timeframe) {
      case "1H": return "1h";
      case "4H": return "1d";
      case "1D": return "1d";
      case "1W": return "7d";
      case "1M": return "30d";
      default: return "7d";
    }
  }
  
  // Format timestamp for display in chart
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    
    if (timeframe === "1H" || timeframe === "4H") {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === "1D") {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  // Handle order placement
  const handlePlaceOrder = (action: 'buy' | 'sell') => {
    try {
      // Get the values from the appropriate form
      const amount = action === 'buy' ? Number(buyAmount) : Number(sellAmount);
      const price = action === 'buy' 
        ? (orderType === "market" ? selectedCryptoData.price : Number(buyPrice))
        : (orderType === "market" ? selectedCryptoData.price : Number(sellPrice));
      
      // Validate input
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount greater than 0",
          variant: "destructive",
        });
        return;
      }
      
      if (orderType !== "market" && (isNaN(price) || price <= 0)) {
        toast({
          title: "Invalid price",
          description: "Please enter a valid price greater than 0",
          variant: "destructive",
        });
        return;
      }
      
      const total = amount * price;
      
      // Create a new order
      const newOrder: Order = {
        id: Math.random().toString(36).substring(2, 15),
        type: action,
        price,
        amount,
        total,
        date: new Date(),
        status: orderType === "market" ? "filled" : "open",
        pair: selectedPair
      };
      
      // Add to order history
      setOrderHistory(prev => [newOrder, ...prev].slice(0, 50));
      
      // Reset form
      if (action === 'buy') {
        setBuyAmount("");
      } else {
        setSellAmount("");
      }
      
      toast({
        title: `${action === 'buy' ? 'Buy' : 'Sell'} order ${orderType === "market" ? "executed" : "placed"}`,
        description: `${formatCryptoValue(amount)} ${selectedPair.split('/')[0]} at ${formatCurrency(price)}`,
      });
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error placing order",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Generate realistic buy orders for display
  const generateBuyOrders = () => {
    if (!selectedCryptoData || !selectedCryptoData.price) return [];
    
    const basePrice = selectedCryptoData.price;
    const orders = [];
    
    for (let i = 0; i < 8; i++) {
      const priceDiff = (Math.random() * 0.01 + 0.001) * i;
      const price = basePrice * (1 - priceDiff);
      const amount = Math.random() * 2 + 0.1;
      orders.push({
        price: price,
        amount: Number(amount.toFixed(4)),
        total: Number((price * amount).toFixed(2))
      });
    }
    
    return orders.sort((a, b) => b.price - a.price);
  };
  
  // Generate realistic sell orders for display
  const generateSellOrders = () => {
    if (!selectedCryptoData || !selectedCryptoData.price) return [];
    
    const basePrice = selectedCryptoData.price;
    const orders = [];
    
    for (let i = 0; i < 8; i++) {
      const priceDiff = (Math.random() * 0.01 + 0.001) * i;
      const price = basePrice * (1 + priceDiff);
      const amount = Math.random() * 2 + 0.1;
      orders.push({
        price: price,
        amount: Number(amount.toFixed(4)),
        total: Number((price * amount).toFixed(2))
      });
    }
    
    return orders.sort((a, b) => a.price - b.price);
  };
  
  // Generate recent trades
  const generateRecentTrades = () => {
    if (!selectedCryptoData || !selectedCryptoData.price) return [];
    
    const basePrice = selectedCryptoData.price;
    const trades = [];
    const now = new Date();
    
    for (let i = 0; i < 10; i++) {
      const priceDiff = (Math.random() * 0.002 - 0.001);
      const price = basePrice * (1 + priceDiff);
      const amount = Math.random() * 0.1 + 0.01;
      const tradeTime = new Date(now.getTime() - (i * 15000));
      
      trades.push({
        price: price,
        amount: Number(amount.toFixed(4)),
        time: tradeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: Math.random() > 0.5 ? "buy" : "sell"
      });
    }
    
    return trades;
  };
  
  // Generate data for the different coin pairs
  const availablePairs = [
    { value: "BTC/USDT", label: "BTC/USDT", coinId: "bitcoin" },
    { value: "ETH/USDT", label: "ETH/USDT", coinId: "ethereum" },
    { value: "SOL/USDT", label: "SOL/USDT", coinId: "solana" },
    { value: "ADA/USDT", label: "ADA/USDT", coinId: "cardano" }
  ];

  // Handle pair change
  const handlePairChange = (pair: string) => {
    setSelectedPair(pair);
    const selectedPairData = availablePairs.find(p => p.value === pair);
    if (selectedPairData) {
      setSelectedCoin(selectedPairData.coinId);
    }
  };
  
  // Get the buy orders, sell orders, and recent trades
  const buyOrders = generateBuyOrders();
  const sellOrders = generateSellOrders();
  const recentTrades = generateRecentTrades();
  
  // Calculate the buy total
  const calculateBuyTotal = () => {
    if (!buyAmount) return "";
    const price = orderType === "market" ? selectedCryptoData.price : parseFloat(buyPrice);
    if (isNaN(price)) return "";
    return (parseFloat(buyAmount) * price).toLocaleString();
  };
  
  // Calculate the sell total
  const calculateSellTotal = () => {
    if (!sellAmount) return "";
    const price = orderType === "market" ? selectedCryptoData.price : parseFloat(sellPrice);
    if (isNaN(price)) return "";
    return (parseFloat(sellAmount) * price).toLocaleString();
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exchange</h1>
            <p className="text-gray-400">Trade cryptocurrencies securely with low fees.</p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-gray-700"
            onClick={() => setIsWalletModalOpen(true)}
          >
            <WalletIcon className="h-4 w-4" />
            Connect Wallet
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Select value={selectedPair} onValueChange={handlePairChange}>
                      <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700">
                        <SelectValue placeholder="Select pair" />
                      </SelectTrigger>
                      <SelectContent className="bg-crypto-blue border-gray-700">
                        {availablePairs.map((pair) => (
                          <SelectItem key={pair.value} value={pair.value}>
                            {pair.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">
                      {loadingCrypto 
                        ? "Loading..." 
                        : `$${formatCryptoValue(selectedCryptoData.price)}`}
                    </span>
                    <span className={`flex items-center ${selectedCryptoData.change24h.startsWith('-') ? 'text-crypto-red' : 'text-crypto-green'}`}>
                      {selectedCryptoData.change24h.startsWith('-') 
                        ? <TrendingDownIcon className="h-4 w-4 mr-1" /> 
                        : <TrendingUpIcon className="h-4 w-4 mr-1" />} 
                      {selectedCryptoData.change24h}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full bg-crypto-blue/10 rounded-lg border border-gray-800 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 flex justify-between p-4">
                    <div className="flex gap-2">
                      {["1H", "4H", "1D", "1W", "1M"].map((tf) => (
                        <Button 
                          key={tf}
                          size="sm" 
                          variant={timeframe === tf ? "secondary" : "ghost"}
                          className={timeframe === tf 
                            ? "bg-gray-800 hover:bg-gray-700 text-xs" 
                            : "text-xs"}
                          onClick={() => setTimeframe(tf)}
                        >
                          {tf}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {loadingChart ? (
                    <div className="flex items-center justify-center h-full">
                      <p>Loading chart data...</p>
                    </div>
                  ) : (
                    <ChartContainer
                      className="p-4 pt-14"
                      config={{
                        BTC: { theme: { light: "#644DFF", dark: "#644DFF" } },
                        ETH: { theme: { light: "#3E7BF6", dark: "#3E7BF6" } },
                        SOL: { theme: { light: "#14F195", dark: "#14F195" } },
                        ADA: { theme: { light: "#7A5CD0", dark: "#7A5CD0" } },
                      }}
                    >
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorBTC" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#644DFF" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#644DFF" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="timestamp" 
                          scale="time"
                          type="number" 
                          domain={['dataMin', 'dataMax']} 
                          tickFormatter={formatTimestamp}
                          tickLine={false}
                          axisLine={{ stroke: '#333' }}
                          tick={{ fill: '#999' }}
                        />
                        <YAxis 
                          domain={['dataMin - 100', 'dataMax + 100']} 
                          tickFormatter={(value) => `$${formatCryptoValue(value)}`}
                          orientation="right"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#999' }}
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const coinKey = selectedCoin.substring(0, 3).toUpperCase();
                              return (
                                <div className="rounded-md bg-gray-800 p-3 border border-gray-700 shadow-lg">
                                  <p className="text-gray-300">
                                    {new Date(data.timestamp).toLocaleString()}
                                  </p>
                                  <p className="font-bold text-white">
                                    ${formatCryptoValue(data[coinKey])}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey={selectedCoin.substring(0, 3).toUpperCase()} 
                          stroke="#644DFF" 
                          fillOpacity={1} 
                          fill="url(#colorBTC)" 
                        />
                      </AreaChart>
                    </ChartContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card className="bg-crypto-card border-gray-800">
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg">Order Book</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 text-xs text-gray-400 pb-2">
                    <span>Price (USDT)</span>
                    <span className="text-center">Amount ({selectedPair.split('/')[0]})</span>
                    <span className="text-right">Total</span>
                  </div>
                  <div className="space-y-1">
                    {sellOrders.map((order, i) => (
                      <div key={`sell-${i}`} className="grid grid-cols-3 text-sm">
                        <span className="text-crypto-red">{formatCryptoValue(order.price)}</span>
                        <span className="text-center">{order.amount.toFixed(4)}</span>
                        <span className="text-right">{order.total.toLocaleString()}</span>
                      </div>
                    ))}
                    
                    <div className="py-2 text-center text-crypto-purple font-medium">
                      {formatCryptoValue(selectedCryptoData.price)}
                    </div>
                    
                    {buyOrders.map((order, i) => (
                      <div key={`buy-${i}`} className="grid grid-cols-3 text-sm">
                        <span className="text-crypto-green">{formatCryptoValue(order.price)}</span>
                        <span className="text-center">{order.amount.toFixed(4)}</span>
                        <span className="text-right">{order.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-crypto-card border-gray-800">
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg">Recent Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 text-xs text-gray-400 pb-2">
                    <span>Price (USDT)</span>
                    <span className="text-center">Amount ({selectedPair.split('/')[0]})</span>
                    <span className="text-right">Time</span>
                  </div>
                  <div className="space-y-1">
                    {recentTrades.map((trade, i) => (
                      <div key={i} className="grid grid-cols-3 text-sm">
                        <span className={trade.type === "buy" ? "text-crypto-green" : "text-crypto-red"}>
                          {formatCryptoValue(trade.price)}
                        </span>
                        <span className="text-center">{trade.amount.toFixed(4)}</span>
                        <span className="text-right text-gray-400">{trade.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div>
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle>Place Order</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="buy" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="sell">Sell</TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-4 pb-2">
                    <Select defaultValue={orderType} onValueChange={setOrderType}>
                      <SelectTrigger className="bg-gray-800/50 border-gray-700">
                        <SelectValue placeholder="Order Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-crypto-blue border-gray-700">
                        <SelectItem value="market">Market Order</SelectItem>
                        <SelectItem value="limit">Limit Order</SelectItem>
                        <SelectItem value="stop">Stop Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <TabsContent value="buy" className="mt-2 space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-gray-400">Price</label>
                        <span className="text-sm text-gray-400">USDT</span>
                      </div>
                      <Input 
                        value={buyPrice}
                        onChange={(e) => setBuyPrice(e.target.value)} 
                        readOnly={orderType === "market"} 
                        disabled={orderType === "market"}
                        className="bg-gray-800/50 border-gray-700"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-gray-400">Amount</label>
                        <span className="text-sm text-gray-400">{selectedPair.split('/')[0]}</span>
                      </div>
                      <Input 
                        value={buyAmount} 
                        onChange={(e) => setBuyAmount(e.target.value)} 
                        placeholder="0.0000" 
                        className="bg-gray-800/50 border-gray-700"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-gray-400">Total</label>
                        <span className="text-sm text-gray-400">USDT</span>
                      </div>
                      <Input 
                        value={calculateBuyTotal()} 
                        readOnly 
                        placeholder="0.00" 
                        className="bg-gray-800/50 border-gray-700"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <label className="text-sm text-gray-400 mb-4 block">Order Size</label>
                      <Slider defaultValue={[0]} max={100} step={25} />
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-crypto-green hover:bg-crypto-green/90" 
                      onClick={() => handlePlaceOrder('buy')}
                    >
                      Buy {selectedPair.split('/')[0]}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="sell" className="mt-2 space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-gray-400">Price</label>
                        <span className="text-sm text-gray-400">USDT</span>
                      </div>
                      <Input 
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)} 
                        readOnly={orderType === "market"} 
                        disabled={orderType === "market"}
                        className="bg-gray-800/50 border-gray-700"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-gray-400">Amount</label>
                        <span className="text-sm text-gray-400">{selectedPair.split('/')[0]}</span>
                      </div>
                      <Input 
                        value={sellAmount} 
                        onChange={(e) => setSellAmount(e.target.value)} 
                        placeholder="0.0000" 
                        className="bg-gray-800/50 border-gray-700"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-gray-400">Total</label>
                        <span className="text-sm text-gray-400">USDT</span>
                      </div>
                      <Input 
                        value={calculateSellTotal()} 
                        readOnly 
                        placeholder="0.00" 
                        className="bg-gray-800/50 border-gray-700"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <label className="text-sm text-gray-400 mb-4 block">Order Size</label>
                      <Slider defaultValue={[0]} max={100} step={25} />
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-crypto-red hover:bg-crypto-red/90" 
                      onClick={() => handlePlaceOrder('sell')}
                    >
                      Sell {selectedPair.split('/')[0]}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="bg-crypto-card border-gray-800 mt-4">
              <CardHeader className="pb-2">
                <CardTitle>Coin Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Market Cap</span>
                  <span>{formatCurrency(selectedCryptoData.marketCap)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">24h Volume</span>
                  <span>{formatCurrency(selectedCryptoData.volume24h)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Circulating Supply</span>
                  <span>
                    {selectedPair.startsWith("BTC") ? "19.5M BTC" : 
                     selectedPair.startsWith("ETH") ? "120.3M ETH" : 
                     selectedPair.startsWith("SOL") ? "429.5M SOL" : 
                     "35.2B ADA"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">All-time High</span>
                  <span>
                    {selectedPair.startsWith("BTC") ? "$69,045" : 
                     selectedPair.startsWith("ETH") ? "$4,892" : 
                     selectedPair.startsWith("SOL") ? "$260" : 
                     "$3.10"}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-crypto-card border-gray-800 mt-4">
              <CardHeader className="pb-2">
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {orderHistory.length > 0 ? (
                  <div className="space-y-3">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="border-b border-gray-800 pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className={order.type === 'buy' ? 'text-crypto-green' : 'text-crypto-red'}>
                              {order.type === 'buy' ? 'Buy' : 'Sell'} {order.pair.split('/')[0]}
                            </span>
                            <span className="text-gray-400 ml-2 text-xs">
                              {order.date.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCryptoValue(order.amount)} {order.pair.split('/')[0]}</div>
                            <div className="text-xs text-gray-400">
                              @ {formatCurrency(order.price)}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            order.status === 'filled' 
                              ? 'bg-crypto-green/20 text-crypto-green' 
                              : order.status === 'canceled' 
                                ? 'bg-crypto-red/20 text-crypto-red' 
                                : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-gray-400 text-xs">
                            Total: {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-6">
                    <p>No orders yet</p>
                    <p className="text-sm mt-2">Place a trade to see your order history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </div>
  );
};

export default Exchange;
