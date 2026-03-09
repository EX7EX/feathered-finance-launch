import React, { useState, useEffect } from "react";
import { BrowserProvider, parseUnits } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Order } from "../ExchangePage";
import { CryptoPrice } from "@/hooks/useCryptoData";
import { ORDER_BOOK_ABI, ORDER_BOOK_ADDRESS, ERC20_ABI } from "@/integrations/web3/contracts";

import { http, createPublicClient, encodeFunctionData, Hex } from "viem";
import { base } from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";

// --- Configuration for Paymaster ---
const PAYMASTER_URL = `https://api.pimlico.io/v2/${base.id}/rpc?apikey=${import.meta.env.VITE_PIMLICO_API_KEY}`;
const BUNDLER_URL = `https://api.pimlico.io/v1/${base.id}/rpc?apikey=${import.meta.env.VITE_PIMLICO_API_KEY}`;

const publicClient = createPublicClient({
  transport: http("https://mainnet.base.org"),
});

const paymasterClient = createPimlicoPaymasterClient({
  transport: http(PAYMASTER_URL),
});

interface PlaceOrderCardProps {
  selectedPair: string;
  selectedCryptoData: CryptoPrice;
  onOrderPlaced: (order?: Order) => void;
  tokenA?: string;
  tokenB?: string;
}

const PlaceOrderCard = ({ 
  selectedPair, 
  selectedCryptoData,
  onOrderPlaced,
  tokenA,
  tokenB
}: PlaceOrderCardProps) => {
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (selectedCryptoData) {
      const currentPrice = selectedCryptoData.price.toString();
      setBuyPrice(currentPrice);
      setSellPrice(currentPrice);
    }
  }, [selectedCryptoData]);
  
  const calculateBuyTotal = () => {
    if (!buyAmount || !buyPrice) return "";
    return (parseFloat(buyAmount) * parseFloat(buyPrice)).toLocaleString();
  };
  
  const calculateSellTotal = () => {
    if (!sellAmount || !sellPrice) return "";
    return (parseFloat(sellAmount) * parseFloat(sellPrice)).toLocaleString();
  };
  
  const handlePlaceOrder = async (action: 'buy' | 'sell') => {
    if (!tokenA || !tokenB) {
      toast({ title: "Pair not selected", variant: "destructive" });
      return;
    }
    if (!window.ethereum) {
        toast({ title: "Wallet not connected", variant: "destructive" });
        return;
    }

    setIsPlacingOrder(true);
    try {
      const ethersProvider = new BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();

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

      const amount = action === 'buy' ? buyAmount : sellAmount;
      const price = action === 'buy' ? buyPrice : sellPrice;

      if (!amount || !price || parseFloat(amount) <= 0 || parseFloat(price) <= 0) {
        toast({ title: "Invalid input", description: "Please enter a valid amount and price.", variant: "destructive" });
        setIsPlacingOrder(false);
        return;
      }

      const amountA = parseUnits(amount, 18);
      const amountB = parseUnits((parseFloat(amount) * parseFloat(price)).toString(), 18);
      const tokenToApproveAddress = action === 'buy' ? tokenB : tokenA;
      const amountToApprove = action === 'buy' ? amountB : amountA;

      const approveCallData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ORDER_BOOK_ADDRESS as Hex, amountToApprove],
      });

      const orderTypeEnum = action === 'buy' ? 0 : 1;
      const createOrderCallData = encodeFunctionData({
        abi: ORDER_BOOK_ABI,
        functionName: "createOrder",
        args: [orderTypeEnum, tokenA as Hex, tokenB as Hex, amountA, amountB],
      });

      toast({ title: "Preparing gasless transaction..." });

      await smartAccountClient.sendTransactions({
        transactions: [
          {
            to: tokenToApproveAddress as Hex,
            data: approveCallData,
            value: 0n,
          },
          {
            to: ORDER_BOOK_ADDRESS as Hex,
            data: createOrderCallData,
            value: 0n,
          },
        ],
      });

      toast({ title: "Order submitted!", description: "Your gasless transaction is being processed." });

      onOrderPlaced();
      if (action === 'buy') setBuyAmount("");
      else setSellAmount("");

    } catch (error) {
      console.error("Error placing gasless order:", error);
      toast({ title: "Error placing order", description: (error as any).message || "An unknown error occurred.", variant: "destructive" });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle>Place Order</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy" className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between mb-2"><label>Price (USDT)</label></div>
              <Input value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className="bg-muted border-border" />
            </div>
            <div>
              <div className="flex justify-between mb-2"><label>Amount ({selectedPair.split('/')[0]})</label></div>
              <Input value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} placeholder="0.0000" className="bg-muted border-border" />
            </div>
            <div>
              <div className="flex justify-between mb-2"><label>Total (USDT)</label></div>
              <Input value={calculateBuyTotal()} readOnly placeholder="0.00" className="bg-muted border-border" />
            </div>
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handlePlaceOrder('buy')} disabled={isPlacingOrder}>
              {isPlacingOrder ? "Placing Order..." : `Buy ${selectedPair.split('/')[0]}`}
            </Button>
          </TabsContent>
          
          <TabsContent value="sell" className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between mb-2"><label>Price (USDT)</label></div>
              <Input value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} className="bg-muted border-border" />
            </div>
            <div>
              <div className="flex justify-between mb-2"><label>Amount ({selectedPair.split('/')[0]})</label></div>
              <Input value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} placeholder="0.0000" className="bg-muted border-border" />
            </div>
            <div>
              <div className="flex justify-between mb-2"><label>Total (USDT)</label></div>
              <Input value={calculateSellTotal()} readOnly placeholder="0.00" className="bg-muted border-border" />
            </div>
            <Button className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handlePlaceOrder('sell')} disabled={isPlacingOrder}>
              {isPlacingOrder ? "Placing Order..." : `Sell ${selectedPair.split('/')[0]}`}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlaceOrderCard;
