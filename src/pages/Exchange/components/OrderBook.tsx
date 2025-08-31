import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCryptoValue } from "../ExchangePage";
import { CryptoPrice } from "@/hooks/useCryptoData";
import { useOrderBook } from "@/hooks/useOrderBook";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderBookProps {
  selectedPair: string;
  selectedCryptoData: CryptoPrice;
  tokenA?: string;
  tokenB?: string;
}

const OrderBook = ({ selectedPair, selectedCryptoData, tokenA, tokenB }: OrderBookProps) => {
  const { buyOrders, sellOrders, loading } = useOrderBook(tokenA || "", tokenB || "");

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
        {loading ? (
          <div className="space-y-2 mt-2">
            {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default OrderBook;
