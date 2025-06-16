import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCryptoValue } from "../exchange";

interface RecentTradesProps {
  selectedPair: string;
}

interface Trade {
  price: number;
  amount: number;
  time: string;
  type: 'buy' | 'sell';
}

const RecentTrades = ({ selectedPair }: RecentTradesProps) => {
  // Generate recent trades
  const generateRecentTrades = (): Trade[] => {
    const trades = [];
    const now = new Date();
    const basePrice = selectedPair.startsWith("BTC") ? 48351.25 : 
                    selectedPair.startsWith("ETH") ? 3254.60 : 
                    selectedPair.startsWith("SOL") ? 152.30 : 
                    0.45;
    
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
  
  const recentTrades = generateRecentTrades();

  return (
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
  );
};

export default RecentTrades;
