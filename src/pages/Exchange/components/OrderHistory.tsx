import React, { useState } from "react";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/auth-utils";
import { OrderWithOwner } from "@/hooks/useOrderBook";
import { ORDER_BOOK_ABI, ORDER_BOOK_ADDRESS } from "@/integrations/web3/contracts";

import { http, createPublicClient, encodeFunctionData, Hex } from "viem";
import { base } from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";

// --- Configuration for Paymaster ---
const PAYMASTER_URL = `https://api.pimlico.io/v2/${base.id}/rpc?apikey=${process.env.VITE_PIMLICO_API_KEY}`;
const BUNDLER_URL = `https://api.pimlico.io/v1/${base.id}/rpc?apikey=${process.env.VITE_PIMLICO_API_KEY}`;

const publicClient = createPublicClient({
  transport: http("https://mainnet.base.org"),
});

const paymasterClient = createPimlicoPaymasterClient({
  transport: http(PAYMASTER_URL),
});
// ------------------------------------

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

      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      const ethersSigner = ethersProvider.getSigner();

      const smartAccount = await signerToSimpleSmartAccount(publicClient, {
        signer: ethersSigner as any,
        factoryAddress: "0x9406Cc6185a346906296840746125a0E44976454",
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      });

      const smartAccountClient = createSmartAccountClient({
        account: smartAccount,
        chain: base,
        transport: http(BUNDLER_URL),
        sponsorUserOperation: paymasterClient.sponsorUserOperation,
      });

      const cancelCallData = encodeFunctionData({
        abi: ORDER_BOOK_ABI,
        functionName: "cancelOrder",
        args: [BigInt(orderId)],
      });

      toast({ title: "Cancelling order (gasless)..." });

      await smartAccountClient.sendTransaction({
        to: ORDER_BOOK_ADDRESS as Hex,
        data: cancelCallData,
        value: 0n,
      });

      toast({ title: "Order cancelled successfully!" });
      onCancelOrder();

    } catch (error) {
      console.error("Error cancelling order:", error);
      toast({ title: "Error cancelling order", description: (error as any).message, variant: "destructive" });
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
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCryptoValue(order.amount)} {order.pair.split('/')[0]}</div>
                    <div className="text-xs text-gray-400">
                      @ {formatCurrency(order.price)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    order.status === 'filled' ? 'bg-crypto-green/20 text-crypto-green' :
                    order.status === 'canceled' ? 'bg-crypto-red/20 text-crypto-red' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {order.status}
                  </span>
                  {order.status === 'open' && (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs text-crypto-red"
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
          <div className="text-center text-gray-400 py-6">
            <p>No orders yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
