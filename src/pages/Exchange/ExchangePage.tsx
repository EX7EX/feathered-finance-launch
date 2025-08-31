import React, { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { WalletIcon } from "lucide-react";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useMarketData } from "@/hooks/useMarketData";
import WalletModal from "@/components/WalletModal";
import { useUserAssets } from "@/hooks/use-user-assets";
import TradingChart from "./components/TradingChart";
import OrderBook from "./components/OrderBook";
import RecentTrades from "./components/RecentTrades";
import PlaceOrderCard from "./components/PlaceOrderCard";
import CoinInformation from "./components/CoinInformation";
import OrderHistory from "./components/OrderHistory";
import PairSelector from "./components/PairSelector";
import { useOrderBook, OrderWithOwner } from "@/hooks/useOrderBook";

// Define available trading pairs
const availablePairs = [
  { value: "BTC/USDT", label: "BTC/USDT", coinId: "bitcoin", tokenA: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", tokenB: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
  { value: "ETH/USDT", label: "ETH/USDT", coinId: "ethereum", tokenA: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", tokenB: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
  { value: "SOL/USDT", label: "SOL/USDT", coinId: "solana", tokenA: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9", tokenB: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
  { value: "ADA/USDT", label: "ADA/USDT", coinId: "cardano", tokenA: "0x9A642d6b33688DEF1325A541dA64C321b1615416", tokenB: "0xdAC17F958D2ee523a2206206994597C13D831ec7" }
];

const ExchangePage = () => {
  // State management
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("1D");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const selectedPairData = availablePairs.find(p => p.value === selectedPair);

  // Get data from hooks
  const { data: cryptoData, loading: loadingCrypto } = useCryptoData(['bitcoin', 'ethereum', 'solana', 'cardano']);
  const { chartData, loading: loadingChart } = useMarketData([selectedCoin], getTimeframeParam(timeframe));
  const { orders, refetch: refetchOrders } = useOrderBook(selectedPairData?.tokenA || "", selectedPairData?.tokenB || "");

  // Get user address
  useEffect(() => {
    const getAddress = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
        } catch (error) {
          console.error("Error getting user address:", error);
        }
      }
    };
    getAddress();
  }, []);

  const userOrders = useMemo(() => {
    if (!userAddress) return [];
    return orders.filter(order => order.owner.toLowerCase() === userAddress.toLowerCase());
  }, [orders, userAddress]);
  
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
  
  const handlePairChange = (pair: string) => {
    setSelectedPair(pair);
    const selectedPairData = availablePairs.find(p => p.value === pair);
    if (selectedPairData) {
      setSelectedCoin(selectedPairData.coinId);
    }
  };
  
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
            {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : "Connect Wallet"}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-crypto-card border-gray-800 rounded-lg border shadow-sm mb-4">
              <div className="flex justify-between items-center p-4 pb-2">
                <PairSelector 
                  selectedPair={selectedPair} 
                  pairs={availablePairs}
                  onPairChange={handlePairChange}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">
                    {loadingCrypto ? "Loading..." : `$${formatCryptoValue(selectedCryptoData.price)}`}
                  </span>
                  <PriceChangeIndicator change={selectedCryptoData.change24h} />
                </div>
              </div>
              <div className="p-4 pt-0">
                <TradingChart 
                  chartData={chartData} 
                  selectedCoin={selectedCoin}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                  loading={loadingChart}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OrderBook
                selectedPair={selectedPair}
                selectedCryptoData={selectedCryptoData}
                tokenA={selectedPairData?.tokenA}
                tokenB={selectedPairData?.tokenB}
              />
              <RecentTrades
                selectedPair={selectedPair}
                tokenA={selectedPairData?.tokenA}
                tokenB={selectedPairData?.tokenB}
              />
            </div>
          </div>
          
          <div>
            <PlaceOrderCard 
              selectedPair={selectedPair}
              selectedCryptoData={selectedCryptoData}
              onOrderPlaced={refetchOrders}
              tokenA={selectedPairData?.tokenA}
              tokenB={selectedPairData?.tokenB}
            />
            
            <CoinInformation 
              selectedPair={selectedPair} 
              selectedCryptoData={selectedCryptoData} 
            />
            
            <OrderHistory orderHistory={userOrders} onCancelOrder={refetchOrders} />
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

// Helper functions
export const formatCryptoValue = (value: number) => {
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(value < 0.0001 ? 8 : 4);
};

// Custom order type
export interface Order {
  id: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  date: Date;
  status: 'open' | 'filled' | 'canceled';
  pair: string;
}

// Price change indicator component
export const PriceChangeIndicator = ({ change }: { change: string }) => {
  const isNegative = change.startsWith('-');
  return (
    <span className={`flex items-center ${isNegative ? 'text-crypto-red' : 'text-crypto-green'}`}>
      {isNegative 
        ? <TrendingDownIcon className="h-4 w-4 mr-1" /> 
        : <TrendingUpIcon className="h-4 w-4 mr-1" />} 
      {change}
    </span>
  );
};

import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

export default ExchangePage;
