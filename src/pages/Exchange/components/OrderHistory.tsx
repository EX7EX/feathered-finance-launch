import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/auth-utils";
import { OrderWithOwner } from "@/hooks/useOrderBook";
import { ORDER_BOOK_ABI, ORDER_BOOK_ADDRESS } from "@/integrations/web3/contracts";

interface OrderHistoryProps {
  orderHistory: OrderWithOwner[];
  onCancelOrder: () => void;
}

const OrderHistory = ({ orderHistory, onCancelOrder }: OrderHistoryProps) => {
  const { toast } = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      if (!window.ethereum) throw new Error("No crypto wallet found");

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(ORDER_BOOK_ADDRESS, ORDER_BOOK_ABI, signer);

      toast({ title: "Cancelling order..." });
      const tx = await contract.cancelOrder(BigInt(orderId));
      await tx.wait();

      toast({ title: "Order cancelled successfully!" });
      onCancelOrder();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast({ title: "Error cancelling order", description: (error as Error).message, variant: "destructive" });
    } finally {
      setCancellingId(null);
    }
  };

  const formatCryptoValue = (value: number) => {
    if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (value >= 1) return value.toFixed(2);
    return value.toFixed(value < 0.0001 ? 8 : 4);
  };

  return (
    <Card className="bg-card border-border mt-4">
      <CardHeader className="pb-2">
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        {orderHistory.length > 0 ? (
          <div className="space-y-3">
            {orderHistory.map((order) => (
              <div key={order.id} className="border-b border-border pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className={order.type === 'buy' ? 'text-accent' : 'text-destructive'}>
                      {order.type === 'buy' ? 'Buy' : 'Sell'} {order.pair.split('/')[0]}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCryptoValue(order.amount)} {order.pair.split('/')[0]}</div>
                    <div className="text-xs text-muted-foreground">
                      @ {formatCurrency(order.price)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    order.status === 'filled' ? 'bg-accent/20 text-accent' :
                    order.status === 'canceled' ? 'bg-destructive/20 text-destructive' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {order.status}
                  </span>
                  {order.status === 'open' && (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs text-destructive"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingId === order.id}
                    >
                      {cancellingId === order.id ? "Cancelling..." : "Cancel"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-6">
            <p>No orders yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
