import { createAdminSupabaseClient } from '../src/integrations/supabase/client';

interface MarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

interface CoinGeckoResponse {
  [key: string]: MarketData;
}

class MarketDataService {
  private supabase = createAdminSupabaseClient();
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  async start() {
    if (this.isRunning) return;
    
    console.log('Starting Market Data Service...');
    this.isRunning = true;
    
    // Initial update
    await this.updateMarketData();
    
    // Update every 30 seconds
    this.updateInterval = setInterval(async () => {
      await this.updateMarketData();
    }, 30000);
  }

  async stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('Market Data Service stopped');
  }

  private async updateMarketData() {
    try {
      // Get supported currencies from database
      const { data: currencies, error: currencyError } = await this.supabase
        .from('supported_currencies')
        .select('code, symbol')
        .eq('is_active', true)
        .neq('currency_type', 'fiat');

      if (currencyError) {
        console.error('Error fetching currencies:', currencyError);
        return;
      }

      if (!currencies || currencies.length === 0) {
        console.log('No active currencies found');
        return;
      }

      // Fetch market data from CoinGecko
      const coinIds = currencies.map(c => c.code.toLowerCase()).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&include_last_updated_at=true`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data: CoinGeckoResponse = await response.json();

      // Update prices in database
      for (const currency of currencies) {
        const coinId = currency.code.toLowerCase();
        const marketData = data[coinId];

        if (marketData) {
          await this.updateCurrencyPrice(currency.code, {
            price_usd: marketData.current_price,
            market_cap: marketData.market_cap,
            volume_24h: marketData.total_volume,
            price_change_24h: marketData.price_change_24h,
            price_change_percentage_24h: marketData.price_change_percentage_24h,
            last_updated: new Date(marketData.last_updated * 1000).toISOString()
          });
        }
      }

      // Update market data timestamp
      await this.supabase
        .from('system_health')
        .update({ 
          last_check: new Date().toISOString(),
          next_check: new Date(Date.now() + 30000).toISOString()
        })
        .eq('component', 'market_data');

      console.log(`Market data updated for ${currencies.length} currencies`);

    } catch (error) {
      console.error('Error updating market data:', error);
      
      // Update system health with error
      await this.supabase
        .from('system_health')
        .update({ 
          status: 'error',
          last_check: new Date().toISOString(),
          next_check: new Date(Date.now() + 60000).toISOString()
        })
        .eq('component', 'market_data');
    }
  }

  private async updateCurrencyPrice(currencyCode: string, priceData: {
    price_usd: number;
    market_cap: number;
    volume_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    last_updated: string;
  }) {
    try {
      // Update currency price
      const { error: updateError } = await this.supabase
        .from('supported_currencies')
        .update({
          exchange_rate_to_usd: priceData.price_usd,
          market_cap: priceData.market_cap,
          volume_24h: priceData.volume_24h,
          price_change_24h: priceData.price_change_24h,
          price_change_percentage_24h: priceData.price_change_percentage_24h,
          last_price_update: priceData.last_updated
        })
        .eq('code', currencyCode);

      if (updateError) {
        console.error(`Error updating price for ${currencyCode}:`, updateError);
      }

      // Insert price history
      const { error: historyError } = await this.supabase
        .from('price_history')
        .insert({
          currency: currencyCode,
          price_usd: priceData.price_usd,
          timestamp: priceData.last_updated
        });

      if (historyError) {
        console.error(`Error inserting price history for ${currencyCode}:`, historyError);
      }

    } catch (error) {
      console.error(`Error updating currency price for ${currencyCode}:`, error);
    }
  }

  async getCurrentPrices() {
    const { data, error } = await this.supabase
      .from('supported_currencies')
      .select('code, symbol, exchange_rate_to_usd, price_change_percentage_24h, last_price_update')
      .eq('is_active', true)
      .order('code');

    if (error) {
      console.error('Error fetching current prices:', error);
      return [];
    }

    return data || [];
  }

  async getPriceHistory(currencyCode: string, hours: number = 24) {
    const { data, error } = await this.supabase
      .from('price_history')
      .select('price_usd, timestamp')
      .eq('currency', currencyCode)
      .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('timestamp');

    if (error) {
      console.error('Error fetching price history:', error);
      return [];
    }

    return data || [];
  }
}

// Export singleton instance
export const marketDataService = new MarketDataService();

// Auto-start if running as script
if (require.main === module) {
  marketDataService.start().catch(console.error);
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down Market Data Service...');
    await marketDataService.stop();
    process.exit(0);
  });
} 