
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useUserAssets } from "@/hooks/use-user-assets";
import { useMarketData } from "@/hooks/useMarketData";

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('7d');
  const { profile, isLoading: isLoadingProfile } = useUserProfile();
  const { 
    cryptoWallets, 
    fiatAccounts, 
    isLoading: isLoadingAssets,
    totalPortfolioValueUsd 
  } = useUserAssets();
  
  const { chartData, loading: isChartLoading } = useMarketData(['bitcoin', 'ethereum'], timeframe);

  const isLoading = isLoadingProfile || isLoadingAssets;

  // Format number to currency
  const formatCurrency = (value: number, symbol = "$", decimals = 2) => {
    return `${symbol}${value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  // Format crypto amount with appropriate precision
  const formatCrypto = (value: number, symbol: string, decimals = 8) => {
    return `${value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })} ${symbol}`;
  };

  const getTimeframeLabel = () => {
    switch(timeframe) {
      case '1d': return '1D';
      case '7d': return '1W';
      case '30d': return '1M';
      case '90d': return '3M';
      default: return '1W';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1 border-gray-800 bg-crypto-blue/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Portfolio Balance</CardTitle>
            <CardDescription>Your total assets value</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse h-20 bg-gray-800/50 rounded"></div>
            ) : (
              <>
                <div className="text-3xl font-bold mb-2">
                  {formatCurrency(totalPortfolioValueUsd)}
                </div>
                <div className="text-sm text-green-400">
                  +2.4% ($563.39) today
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1 border-gray-800 bg-crypto-blue/20 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Market Overview</CardTitle>
              <CardDescription>Top cryptocurrency prices</CardDescription>
            </div>
            <Tabs defaultValue={getTimeframeLabel()} className="w-32">
              <TabsList className="grid grid-cols-4 h-7">
                <TabsTrigger 
                  value="1D" 
                  className="text-xs"
                  onClick={() => setTimeframe('1d')}
                >
                  1D
                </TabsTrigger>
                <TabsTrigger 
                  value="1W" 
                  className="text-xs"
                  onClick={() => setTimeframe('7d')}
                >
                  1W
                </TabsTrigger>
                <TabsTrigger 
                  value="1M" 
                  className="text-xs"
                  onClick={() => setTimeframe('30d')}
                >
                  1M
                </TabsTrigger>
                <TabsTrigger 
                  value="3M" 
                  className="text-xs"
                  onClick={() => setTimeframe('90d')}
                >
                  3M
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {isChartLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full border-2 border-crypto-purple/30 border-t-crypto-purple animate-spin"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorBTC" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#644DFF" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#644DFF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorETH" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      stroke="#6B7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#6B7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#374151"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        borderColor: "#374151",
                        borderRadius: "0.5rem",
                        color: "#F9FAFB",
                      }}
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, undefined]}
                    />
                    <Area
                      type="monotone"
                      dataKey="BIT"
                      name="Bitcoin"
                      stroke="#644DFF"
                      fillOpacity={1}
                      fill="url(#colorBTC)"
                    />
                    <Area
                      type="monotone"
                      dataKey="ETH"
                      name="Ethereum"
                      stroke="#38BDF8"
                      fillOpacity={1}
                      fill="url(#colorETH)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Tabs defaultValue="crypto" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Assets</h2>
            <TabsList>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
              <TabsTrigger value="fiat">Fiat</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="crypto">
            <div className="bg-crypto-blue/20 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Asset</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Balance</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {isLoading ? (
                      Array(3).fill(0).map((_, i) => (
                        <tr key={`loading-${i}`}>
                          <td colSpan={3} className="px-4 py-4">
                            <div className="animate-pulse h-6 bg-gray-800/50 rounded"></div>
                          </td>
                        </tr>
                      ))
                    ) : cryptoWallets && cryptoWallets.length > 0 ? (
                      cryptoWallets.map((wallet) => {
                        const value = Number(wallet.balance) * (wallet.currency_details?.exchange_rate_to_usd || 0);
                        return (
                          <tr key={wallet.id}>
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-crypto-purple/20 flex items-center justify-center mr-3">
                                  <span className="font-bold text-sm text-crypto-purple">
                                    {wallet.crypto_code.substring(0, 2)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{wallet.currency_details?.name || wallet.crypto_code}</div>
                                  <div className="text-sm text-gray-400">{wallet.crypto_code}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {formatCrypto(Number(wallet.balance), wallet.crypto_code)}
                            </td>
                            <td className="px-4 py-4 text-right">
                              {formatCurrency(value)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                          You don't have any crypto assets yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fiat">
            <div className="bg-crypto-blue/20 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Currency</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Balance</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {isLoading ? (
                      Array(3).fill(0).map((_, i) => (
                        <tr key={`loading-${i}`}>
                          <td colSpan={3} className="px-4 py-4">
                            <div className="animate-pulse h-6 bg-gray-800/50 rounded"></div>
                          </td>
                        </tr>
                      ))
                    ) : fiatAccounts && fiatAccounts.length > 0 ? (
                      fiatAccounts.map((account) => {
                        const value = Number(account.balance) * (account.currency_details?.exchange_rate_to_usd || 0);
                        return (
                          <tr key={account.id}>
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                                  <span className="font-bold text-sm text-green-500">
                                    {account.currency_details?.symbol || account.currency_code.substring(0, 1)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{account.currency_details?.name || account.currency_code}</div>
                                  <div className="text-sm text-gray-400">{account.currency_code}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {formatCurrency(Number(account.balance), account.currency_details?.symbol, 2)}
                            </td>
                            <td className="px-4 py-4 text-right">
                              {formatCurrency(value)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                          You don't have any fiat balances yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
