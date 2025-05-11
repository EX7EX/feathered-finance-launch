
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChartIcon, 
  TrendingUpIcon, 
  TrendingDownIcon, 
  DollarSignIcon,
  ArrowRightIcon,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's an overview of your portfolio.</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
              Deposit
            </Button>
            <Button className="bg-crypto-purple hover:bg-crypto-purple/90">
              Trade Now
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-crypto-card border-gray-800">
            <CardHeader className="pb-2">
              <CardDescription>Total Balance</CardDescription>
              <CardTitle className="text-2xl">$12,680.24</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-crypto-green">
                <TrendingUpIcon className="h-4 w-4 mr-1" /> +5.23% today
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-crypto-card border-gray-800">
            <CardHeader className="pb-2">
              <CardDescription>24h Trading Volume</CardDescription>
              <CardTitle className="text-2xl">$3,452.87</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-crypto-red">
                <TrendingDownIcon className="h-4 w-4 mr-1" /> -1.12% from yesterday
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-crypto-card border-gray-800">
            <CardHeader className="pb-2">
              <CardDescription>Total Assets</CardDescription>
              <CardTitle className="text-2xl">7</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="link" className="p-0 h-auto text-crypto-purple">
                View all assets <ArrowRightIcon className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-crypto-card border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChartIcon className="mr-2 h-5 w-5 text-crypto-purple" />
              Market Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="watchlist" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-800/50">
                <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
                <TabsTrigger value="gainers">Gainers</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
              </TabsList>
              <TabsContent value="watchlist" className="mt-4">
                <div className="space-y-1">
                  {[
                    { name: "Bitcoin", symbol: "BTC", price: "$48,351.25", change: "+2.4%" },
                    { name: "Ethereum", symbol: "ETH", price: "$3,250.18", change: "+3.1%" },
                    { name: "Cardano", symbol: "ADA", price: "$0.53", change: "-0.8%" },
                    { name: "Solana", symbol: "SOL", price: "$102.72", change: "+5.6%" },
                    { name: "Polkadot", symbol: "DOT", price: "$6.32", change: "-1.2%" }
                  ].map((coin, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-3 hover:bg-gray-800/50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-700 mr-3 flex items-center justify-center font-bold text-xs">
                          {coin.symbol.substring(0, 1)}
                        </div>
                        <div>
                          <p className="font-medium">{coin.name}</p>
                          <p className="text-sm text-gray-400">{coin.symbol}/USDT</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{coin.price}</p>
                        <p className={`text-sm ${coin.change.startsWith("+") ? "text-crypto-green" : "text-crypto-red"}`}>
                          {coin.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="gainers" className="mt-4">
                <div className="p-6 text-center text-gray-400">
                  Top gainers will be displayed here.
                </div>
              </TabsContent>
              <TabsContent value="trending" className="mt-4">
                <div className="p-6 text-center text-gray-400">
                  Trending assets will be displayed here.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-crypto-card border-gray-800">
            <CardHeader>
              <CardTitle>Your Portfolio</CardTitle>
              <CardDescription>Asset allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[200px]">
                <div className="w-32 h-32 rounded-full border-8 border-crypto-purple relative">
                  <div 
                    className="absolute top-0 right-0 w-1/2 h-full rounded-r-full border-8 border-crypto-teal" 
                    style={{ borderLeft: 0, transform: "rotate(45deg)" }}
                  ></div>
                  <div 
                    className="absolute bottom-0 left-0 w-1/2 h-1/3 rounded-bl-full border-8 border-gray-500" 
                    style={{ borderTop: 0, borderRight: 0 }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-crypto-purple mr-2"></div>
                  <span className="text-sm">BTC (45%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-crypto-teal mr-2"></div>
                  <span className="text-sm">ETH (35%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                  <span className="text-sm">Others (20%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-crypto-card border-gray-800">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 5 transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "Buy", asset: "Bitcoin", amount: "0.025 BTC", value: "$1,208.78", time: "2h ago" },
                  { type: "Sell", asset: "Ethereum", amount: "1.5 ETH", value: "$4,875.27", time: "1d ago" },
                  { type: "Buy", asset: "Solana", amount: "10 SOL", value: "$1,027.20", time: "3d ago" },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full ${tx.type === "Buy" ? "bg-crypto-green/20" : "bg-crypto-red/20"} flex items-center justify-center mr-3`}>
                        <DollarSignIcon className={`h-4 w-4 ${tx.type === "Buy" ? "text-crypto-green" : "text-crypto-red"}`} />
                      </div>
                      <div>
                        <p className="font-medium">{tx.type} {tx.asset}</p>
                        <p className="text-sm text-gray-400">{tx.amount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{tx.value}</p>
                      <p className="text-sm text-gray-400">{tx.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 border-gray-700">
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
