
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowDownIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Exchange = () => {
  const [orderType, setOrderType] = useState("market");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const { toast } = useToast();
  
  const handlePlaceOrder = (action: string) => {
    toast({
      title: `${action} order placed`,
      description: "This is a demo. No actual order has been executed.",
    });
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exchange</h1>
          <p className="text-gray-400">Trade cryptocurrencies securely with low fees.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>BTC/USDT</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">$48,351.25</span>
                    <span className="text-crypto-green flex items-center">
                      <TrendingUpIcon className="h-4 w-4 mr-1" /> 2.4%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full bg-crypto-blue/50 rounded-lg border border-gray-800 relative overflow-hidden">
                  {/* Mock trading chart */}
                  <div className="absolute inset-0 flex items-end">
                    <svg viewBox="0 0 800 300" className="w-full h-full" preserveAspectRatio="none">
                      <path
                        d="M0,150 C60,120 120,180 180,150 C240,120 300,180 360,150 C420,120 480,180 540,150 C600,120 660,180 720,150 C780,120 840,180 900,150"
                        fill="none"
                        stroke="#644DFF"
                        strokeWidth="3"
                      />
                      <path
                        d="M0,150 C60,120 120,180 180,150 C240,120 300,180 360,150 C420,120 480,180 540,150 C600,120 660,180 720,150 C780,120 840,180 900,150"
                        fill="url(#gradient)"
                        fillOpacity="0.2"
                        stroke="none"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#644DFF" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#644DFF" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="absolute top-0 left-0 right-0 flex justify-between p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="bg-gray-800 hover:bg-gray-700 text-xs">1H</Button>
                      <Button size="sm" variant="ghost" className="text-xs">4H</Button>
                      <Button size="sm" variant="ghost" className="text-xs">1D</Button>
                      <Button size="sm" variant="ghost" className="text-xs">1W</Button>
                      <Button size="sm" variant="ghost" className="text-xs">1M</Button>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-xs">
                        <TrendingUpIcon className="h-4 w-4 mr-1" /> Indicators
                      </Button>
                    </div>
                  </div>
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
                    <span className="text-center">Amount (BTC)</span>
                    <span className="text-right">Total</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { price: "48,386.50", amount: "0.4231", total: "20,314.22", type: "sell" },
                      { price: "48,372.25", amount: "0.1880", total: "9,094.76", type: "sell" },
                      { price: "48,351.25", amount: "0.5620", total: "27,173.17", type: "sell" },
                    ].map((order, i) => (
                      <div key={`sell-${i}`} className="grid grid-cols-3 text-sm">
                        <span className="text-crypto-red">{order.price}</span>
                        <span className="text-center">{order.amount}</span>
                        <span className="text-right">{order.total}</span>
                      </div>
                    ))}
                    
                    <div className="py-2 text-center text-crypto-purple font-medium">
                      48,351.25
                    </div>
                    
                    {[
                      { price: "48,340.00", amount: "0.2548", total: "12,325.05", type: "buy" },
                      { price: "48,328.75", amount: "0.7532", total: "36,399.38", type: "buy" },
                      { price: "48,315.50", amount: "0.3219", total: "15,552.81", type: "buy" },
                    ].map((order, i) => (
                      <div key={`buy-${i}`} className="grid grid-cols-3 text-sm">
                        <span className="text-crypto-green">{order.price}</span>
                        <span className="text-center">{order.amount}</span>
                        <span className="text-right">{order.total}</span>
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
                    <span className="text-center">Amount (BTC)</span>
                    <span className="text-right">Time</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { price: "48,351.25", amount: "0.0212", time: "15:32:01", type: "buy" },
                      { price: "48,349.50", amount: "0.0311", time: "15:31:47", type: "sell" },
                      { price: "48,351.25", amount: "0.0185", time: "15:31:32", type: "buy" },
                      { price: "48,348.75", amount: "0.0425", time: "15:31:15", type: "sell" },
                      { price: "48,352.00", amount: "0.0193", time: "15:31:09", type: "buy" },
                      { price: "48,353.75", amount: "0.0278", time: "15:30:55", type: "buy" },
                      { price: "48,349.00", amount: "0.0512", time: "15:30:41", type: "sell" },
                      { price: "48,345.25", amount: "0.0309", time: "15:30:28", type: "sell" },
                    ].map((trade, i) => (
                      <div key={i} className="grid grid-cols-3 text-sm">
                        <span className={trade.type === "buy" ? "text-crypto-green" : "text-crypto-red"}>
                          {trade.price}
                        </span>
                        <span className="text-center">{trade.amount}</span>
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
                        value="48,351.25" 
                        readOnly={orderType === "market"} 
                        className="bg-gray-800/50 border-gray-700"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-gray-400">Amount</label>
                        <span className="text-sm text-gray-400">BTC</span>
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
                        value={buyAmount ? (Number(buyAmount) * 48351.25).toLocaleString() : ""} 
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
                      onClick={() => handlePlaceOrder("Buy")}
                    >
                      Buy BTC
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="sell" className="mt-2 space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-gray-400">Price</label>
                        <span className="text-sm text-gray-400">USDT</span>
                      </div>
                      <Input 
                        value="48,351.25" 
                        readOnly={orderType === "market"} 
                        className="bg-gray-800/50 border-gray-700"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-gray-400">Amount</label>
                        <span className="text-sm text-gray-400">BTC</span>
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
                        value={sellAmount ? (Number(sellAmount) * 48351.25).toLocaleString() : ""} 
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
                      onClick={() => handlePlaceOrder("Sell")}
                    >
                      Sell BTC
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
                  <span>$942.5B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">24h Volume</span>
                  <span>$28.4B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Circulating Supply</span>
                  <span>19.5M BTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">All-time High</span>
                  <span>$69,045</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exchange;
