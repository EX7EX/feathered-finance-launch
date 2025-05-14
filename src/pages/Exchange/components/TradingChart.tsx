
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  Area, 
  AreaChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { formatCryptoValue } from "../ExchangePage";
import { MarketChartData } from "@/hooks/useMarketData";

interface TradingChartProps {
  chartData: MarketChartData[];
  selectedCoin: string;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  loading: boolean;
}

const TradingChart = ({ 
  chartData, 
  selectedCoin,
  timeframe,
  setTimeframe,
  loading
}: TradingChartProps) => {
  // Format timestamp for display in chart
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    
    if (timeframe === "1H" || timeframe === "4H") {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === "1D") {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-[400px] w-full bg-crypto-blue/10 rounded-lg border border-gray-800 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 flex justify-between p-4">
        <div className="flex gap-2">
          {["1H", "4H", "1D", "1W", "1M"].map((tf) => (
            <Button 
              key={tf}
              size="sm" 
              variant={timeframe === tf ? "secondary" : "ghost"}
              className={timeframe === tf 
                ? "bg-gray-800 hover:bg-gray-700 text-xs" 
                : "text-xs"}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p>Loading chart data...</p>
        </div>
      ) : (
        <ChartContainer
          className="p-4 pt-14"
          config={{
            BTC: { theme: { light: "#644DFF", dark: "#644DFF" } },
            ETH: { theme: { light: "#3E7BF6", dark: "#3E7BF6" } },
            SOL: { theme: { light: "#14F195", dark: "#14F195" } },
            ADA: { theme: { light: "#7A5CD0", dark: "#7A5CD0" } },
          }}
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorBTC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#644DFF" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#644DFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="timestamp" 
              scale="time"
              type="number" 
              domain={['dataMin', 'dataMax']} 
              tickFormatter={formatTimestamp}
              tickLine={false}
              axisLine={{ stroke: '#333' }}
              tick={{ fill: '#999' }}
            />
            <YAxis 
              domain={['dataMin - 100', 'dataMax + 100']} 
              tickFormatter={(value) => `$${formatCryptoValue(value)}`}
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#999' }}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const coinKey = selectedCoin.substring(0, 3).toUpperCase();
                  return (
                    <div className="rounded-md bg-gray-800 p-3 border border-gray-700 shadow-lg">
                      <p className="text-gray-300">
                        {new Date(data.timestamp).toLocaleString()}
                      </p>
                      <p className="font-bold text-white">
                        ${formatCryptoValue(data[coinKey])}
                      </p>
                    </div>
                  );
                }
                return null;
              }} 
            />
            <Area 
              type="monotone" 
              dataKey={selectedCoin.substring(0, 3).toUpperCase()} 
              stroke="#644DFF" 
              fillOpacity={1} 
              fill="url(#colorBTC)" 
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
};

export default TradingChart;
