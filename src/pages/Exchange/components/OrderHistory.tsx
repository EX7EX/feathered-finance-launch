
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/auth-utils";
import { Order } from "../ExchangePage";

interface OrderHistoryProps {
  orderHistory: Order[];
}

const OrderHistory = ({ orderHistory }: OrderHistoryProps) => {
  const formatCryptoValue = (value: number) => {
    if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (value >= 1) return value.toFixed(2);
    return value.toFixed(value < 0.0001 ? 8 : 4);
  };

  return (
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
  );
};

export default OrderHistory;
