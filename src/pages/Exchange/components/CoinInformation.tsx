
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/auth-utils";
import { CryptoPrice } from "@/hooks/useCryptoData";

interface CoinInformationProps {
  selectedPair: string;
  selectedCryptoData: CryptoPrice;
}

const CoinInformation = ({ selectedPair, selectedCryptoData }: CoinInformationProps) => {
  return (
    <Card className="bg-crypto-card border-gray-800 mt-4">
      <CardHeader className="pb-2">
        <CardTitle>Coin Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Market Cap</span>
          <span>{formatCurrency(selectedCryptoData.marketCap)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">24h Volume</span>
          <span>{formatCurrency(selectedCryptoData.volume24h)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Circulating Supply</span>
          <span>
            {selectedPair.startsWith("BTC") ? "19.5M BTC" : 
             selectedPair.startsWith("ETH") ? "120.3M ETH" : 
             selectedPair.startsWith("SOL") ? "429.5M SOL" : 
             "35.2B ADA"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">All-time High</span>
          <span>
            {selectedPair.startsWith("BTC") ? "$69,045" : 
             selectedPair.startsWith("ETH") ? "$4,892" : 
             selectedPair.startsWith("SOL") ? "$260" : 
             "$3.10"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoinInformation;
