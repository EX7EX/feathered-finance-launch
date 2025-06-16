
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PairSelectorProps {
  selectedPair: string;
  pairs: {
    value: string;
    label: string;
    coinId: string;
  }[];
  onPairChange: (pair: string) => void;
}

const PairSelector = ({ selectedPair, pairs, onPairChange }: PairSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Select value={selectedPair} onValueChange={onPairChange}>
        <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700">
          <SelectValue placeholder="Select pair" />
        </SelectTrigger>
        <SelectContent className="bg-crypto-blue border-gray-700">
          {pairs.map((pair) => (
            <SelectItem key={pair.value} value={pair.value}>
              {pair.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PairSelector;
