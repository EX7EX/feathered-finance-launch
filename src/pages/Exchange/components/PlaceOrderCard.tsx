import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
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
// In a real app, these would be managed securely and not hardcoded.
const PAYMASTER_URL = `https://api.pimlico.io/v2/${base.id}/rpc?apikey=${process.env.VITE_PIMLICO_API_KEY}`; // Placeholder for your Pimlico/Paymaster service URL
const BUNDLER_URL = `https://api.pimlico.io/v1/${base.id}/rpc?apikey=${process.env.VITE_PIMLICO_API_KEY}`; // Placeholder for your Bundler service URL

const publicClient = createPublicClient({
  transport: http("https://mainnet.base.org"),
});

const paymasterClient = createPimlicoPaymasterClient({
  transport: http(PAYMASTER_URL),
});
// ------------------------------------

interface PlaceOrderCardProps {
  selectedPair: string;
  selectedCryptoData: CryptoPrice;
  onOrderPlaced: (order?: Order) => void; // Make order optional as we refetch data now
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
      // 1. Create a "Signer" from the user's EOA
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      const ethersSigner = ethersProvider.getSigner();

      // 2. Create a Smart Account
      const smartAccount = await signerToSimpleSmartAccount(publicClient, {
        signer: ethersSigner as any, // Cast needed for compatibility
        factoryAddress: "0x9406Cc6185a346906296840746125a0E44976454", // SimpleAccount Factory
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // EP v0.6
      });

      // 3. Create the Smart Account Client with the Paymaster
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

      const amountA = ethers.utils.parseUnits(amount, 18);
      const amountB = ethers.utils.parseUnits((parseFloat(amount) * parseFloat(price)).toString(), 18);
      const tokenToApproveAddress = action === 'buy' ? tokenB : tokenA;
      const amountToApprove = action === 'buy' ? amountB : amountA;

      // 4. Encode the `approve` and `createOrder` function calls
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

      // 5. Send the transactions in a sponsored, atomic batch
      const userOpHash = await smartAccountClient.sendTransactions({
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

      // Here you would typically wait for the UserOperation to be mined
      // and then call onOrderPlaced() to trigger a refetch.

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
    <Card className="bg-crypto-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle>Place Order</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy" className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between mb-2"><label>Price (USDT)</label></div>
              <Input value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className="bg-gray-800/50 border-gray-700" />
            </div>
            <div>
              <div className="flex justify-between mb-2"><label>Amount ({selectedPair.split('/')[0]})</label></div>
              <Input value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} placeholder="0.0000" className="bg-gray-800/50 border-gray-700" />
            </div>
            <div>
              <div className="flex justify-between mb-2"><label>Total (USDT)</label></div>
              <Input value={calculateBuyTotal()} readOnly placeholder="0.00" className="bg-gray-800/50 border-gray-700" />
            </div>
            <Button className="w-full bg-crypto-green hover:bg-crypto-green/90" onClick={() => handlePlaceOrder('buy')} disabled={isPlacingOrder}>
              {isPlacingOrder ? "Placing Order..." : `Buy ${selectedPair.split('/')[0]}`}
            </Button>
          </TabsContent>
          
          <TabsContent value="sell" className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between mb-2"><label>Price (USDT)</label></div>
              <Input value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} className="bg-gray-800/50 border-gray-700" />
            </div>
            <div>
              <div className="flex justify-between mb-2"><label>Amount ({selectedPair.split('/')[0]})</label></div>
              <Input value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} placeholder="0.0000" className="bg-gray-800/50 border-gray-700" />
            </div>
            <div>
              <div className="flex justify-between mb-2"><label>Total (USDT)</label></div>
              <Input value={calculateSellTotal()} readOnly placeholder="0.00" className="bg-gray-800/50 border-gray-700" />
            </div>
            <Button className="w-full bg-crypto-red hover:bg-crypto-red/90" onClick={() => handlePlaceOrder('sell')} disabled={isPlacingOrder}>
              {isPlacingOrder ? "Placing Order..." : `Sell ${selectedPair.split('/')[0]}`}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlaceOrderCard;
