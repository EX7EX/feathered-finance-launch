
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCryptoValue } from "../ExchangePage";
import { CryptoPrice } from "@/hooks/useCryptoData";

interface OrderBookProps {
  selectedPair: string;
  selectedCryptoData: CryptoPrice;
}

interface Order {
  price: number;
  amount: number;
  total: number;
}

const OrderBook = ({ selectedPair, selectedCryptoData }: OrderBookProps) => {
  // Generate realistic buy orders for display
  const generateBuyOrders = (): Order[] => {
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
  const generateSellOrders = (): Order[] => {
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
  
  const buyOrders = generateBuyOrders();
  const sellOrders = generateSellOrders();

  return (
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
  );
};

export default OrderBook;
