
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Order } from "../ExchangePage";
import { CryptoPrice } from "@/hooks/useCryptoData";
import { formatCurrency } from "@/lib/auth-utils";

interface PlaceOrderCardProps {
  selectedPair: string;
  selectedCryptoData: CryptoPrice;
  onOrderPlaced: (order: Order) => void;
}

const PlaceOrderCard = ({ 
  selectedPair, 
  selectedCryptoData,
  onOrderPlaced 
}: PlaceOrderCardProps) => {
  const [orderType, setOrderType] = useState("market");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const { toast } = useToast();
  
  // Update price inputs when cryptocurrency selection changes
  useEffect(() => {
    if (selectedCryptoData) {
      const currentPrice = selectedCryptoData.price.toString();
      setBuyPrice(currentPrice);
      setSellPrice(currentPrice);
    }
  }, [selectedCryptoData]);
  
  // Calculate the buy total
  const calculateBuyTotal = () => {
    if (!buyAmount) return "";
    const price = orderType === "market" ? selectedCryptoData.price : parseFloat(buyPrice);
    if (isNaN(price)) return "";
    return (parseFloat(buyAmount) * price).toLocaleString();
  };
  
  // Calculate the sell total
  const calculateSellTotal = () => {
    if (!sellAmount) return "";
    const price = orderType === "market" ? selectedCryptoData.price : parseFloat(sellPrice);
    if (isNaN(price)) return "";
    return (parseFloat(sellAmount) * price).toLocaleString();
  };
  
  // Handle order placement
  const handlePlaceOrder = (action: 'buy' | 'sell') => {
    try {
      // Get the values from the appropriate form
      const amount = action === 'buy' ? Number(buyAmount) : Number(sellAmount);
      const price = action === 'buy' 
        ? (orderType === "market" ? selectedCryptoData.price : Number(buyPrice))
        : (orderType === "market" ? selectedCryptoData.price : Number(sellPrice));
      
      // Validate input
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount greater than 0",
          variant: "destructive",
        });
        return;
      }
      
      if (orderType !== "market" && (isNaN(price) || price <= 0)) {
        toast({
          title: "Invalid price",
          description: "Please enter a valid price greater than 0",
          variant: "destructive",
        });
        return;
      }
      
      const total = amount * price;
      
      // Create a new order
      const newOrder: Order = {
        id: Math.random().toString(36).substring(2, 15),
        type: action,
        price,
        amount,
        total,
        date: new Date(),
        status: orderType === "market" ? "filled" : "open",
        pair: selectedPair
      };
      
      // Add to order history via callback
      onOrderPlaced(newOrder);
      
      // Reset form
      if (action === 'buy') {
        setBuyAmount("");
      } else {
        setSellAmount("");
      }
      
      toast({
        title: `${action === 'buy' ? 'Buy' : 'Sell'} order ${orderType === "market" ? "executed" : "placed"}`,
        description: `${formatCryptoValue(amount)} ${selectedPair.split('/')[0]} at ${formatCurrency(price)}`,
      });
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error placing order",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to format crypto value
  const formatCryptoValue = (value: number) => {
    if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (value >= 1) return value.toFixed(2);
    return value.toFixed(value < 0.0001 ? 8 : 4);
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
          
          <div className="mt-4 pb-2">
            <Select defaultValue={orderType} onValueChange={setOrderType}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Order Type" />
              </SelectTrigger>
              <SelectContent className="bg-crypto-blue border-gray-700">
                <SelectItem value="market">Market Order</SelectItem>
                <SelectItem value="limit">Limit Order</SelectItem>
                <SelectItem value="stop">Stop Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <TabsContent value="buy" className="mt-2 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Price</label>
                <span className="text-sm text-gray-400">USDT</span>
              </div>
              <Input 
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)} 
                readOnly={orderType === "market"} 
                disabled={orderType === "market"}
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Amount</label>
                <span className="text-sm text-gray-400">{selectedPair.split('/')[0]}</span>
              </div>
              <Input 
                value={buyAmount} 
                onChange={(e) => setBuyAmount(e.target.value)} 
                placeholder="0.0000" 
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Total</label>
                <span className="text-sm text-gray-400">USDT</span>
              </div>
              <Input 
                value={calculateBuyTotal()} 
                readOnly 
                placeholder="0.00" 
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
            
            <div className="pt-2">
              <label className="text-sm text-gray-400 mb-4 block">Order Size</label>
              <Slider defaultValue={[0]} max={100} step={25} />
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            
            <Button 
              className="w-full bg-crypto-green hover:bg-crypto-green/90" 
              onClick={() => handlePlaceOrder('buy')}
            >
              Buy {selectedPair.split('/')[0]}
            </Button>
          </TabsContent>
          
          <TabsContent value="sell" className="mt-2 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Price</label>
                <span className="text-sm text-gray-400">USDT</span>
              </div>
              <Input 
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)} 
                readOnly={orderType === "market"} 
                disabled={orderType === "market"}
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Amount</label>
                <span className="text-sm text-gray-400">{selectedPair.split('/')[0]}</span>
              </div>
              <Input 
                value={sellAmount} 
                onChange={(e) => setSellAmount(e.target.value)} 
                placeholder="0.0000" 
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Total</label>
                <span className="text-sm text-gray-400">USDT</span>
              </div>
              <Input 
                value={calculateSellTotal()} 
                readOnly 
                placeholder="0.00" 
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
            
            <div className="pt-2">
              <label className="text-sm text-gray-400 mb-4 block">Order Size</label>
              <Slider defaultValue={[0]} max={100} step={25} />
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            
            <Button 
              className="w-full bg-crypto-red hover:bg-crypto-red/90" 
              onClick={() => handlePlaceOrder('sell')}
            >
              Sell {selectedPair.split('/')[0]}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlaceOrderCard;
