import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TradingChartProps {
  pair: string;
  marketType: 'spot' | 'perpetual' | 'futures' | 'options';
}

export default function TradingChart({ pair, marketType }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = React.useState('1D');
  const [chartType, setChartType] = React.useState('candlestick');

  useEffect(() => {
    // Initialize TradingView widget
    if (chartContainerRef.current && typeof window !== 'undefined') {
      // Clear previous chart
      chartContainerRef.current.innerHTML = '';

      // Create TradingView widget
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        if (window.TradingView && chartContainerRef.current) {
          new window.TradingView.widget({
            container_id: chartContainerRef.current.id,
            symbol: `BINANCE:${pair.replace('/', '')}`,
            interval: timeframe,
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: chartType === 'candlestick' ? '1' : '2',
            locale: 'en',
            toolbar_bg: '#f1f3f6',
            enable_publishing: false,
            allow_symbol_change: false,
            hide_side_toolbar: false,
            hide_legend: false,
            save_image: false,
            backgroundColor: 'rgba(19, 23, 34, 1)',
            gridColor: 'rgba(240, 243, 250, 0.07)',
            width: '100%',
            height: '100%',
            studies: [
              'MACD@tv-basicstudies',
              'RSI@tv-basicstudies',
              'Volume@tv-basicstudies'
            ],
            show_popup_button: true,
            popup_width: '1000',
            popup_height: '650',
          });
        }
      };
      document.head.appendChild(script);

      return () => {
        // Cleanup
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [pair, timeframe, chartType]);

  const timeframes = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1H', label: '1H' },
    { value: '4H', label: '4H' },
    { value: '1D', label: '1D' },
    { value: '1W', label: '1W' },
  ];

  const chartTypes = [
    { value: 'candlestick', label: 'Candlestick' },
    { value: 'line', label: 'Line' },
    { value: 'area', label: 'Area' },
    { value: 'bars', label: 'Bars' },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Price Chart</CardTitle>
          <div className="flex items-center space-x-2">
            {/* Chart Type Selector */}
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Timeframe Selector */}
            <div className="flex border rounded-md">
              {timeframes.map((tf) => (
                <Button
                  key={tf.value}
                  variant={timeframe === tf.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeframe(tf.value)}
                  className="px-2 py-1 text-xs"
                >
                  {tf.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          id={`tradingview-chart-${pair}`}
          ref={chartContainerRef}
          className="w-full h-96"
        />
      </CardContent>
    </Card>
  );
}

// Add TradingView types to window object
declare global {
  interface Window {
    TradingView: any;
  }
} 