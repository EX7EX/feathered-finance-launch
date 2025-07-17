import { createAdminSupabaseClient } from '@/integrations/supabase/client';

export interface TradingPair {
  id: string;
  base_currency: string;
  quote_currency: string;
  symbol: string;
  market_type: 'spot' | 'perpetual' | 'futures' | 'options';
  contract_type?: 'linear' | 'inverse' | 'quanto';
  leverage_max?: number;
  leverage_min?: number;
  is_active: boolean;
  min_order_size: number;
  max_order_size: number;
  price_precision: number;
  quantity_precision: number;
  maker_fee: number;
  taker_fee: number;
  funding_rate?: number;
  funding_interval?: number; // hours
  settlement_time?: string;
  underlying_asset?: string;
  strike_price?: number;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  side: 'buy' | 'sell';
  pair: string;
  market_type: 'spot' | 'perpetual' | 'futures' | 'options';
  price: number;
  amount: number;
  filled: number;
  status: 'open' | 'filled' | 'cancelled' | 'partial' | 'rejected';
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'take_profit' | 'take_profit_limit';
  time_in_force: 'GTC' | 'IOC' | 'FOK' | 'GTX';
  stop_price?: number;
  iceberg_amount?: number;
  fee: number;
  leverage?: number;
  margin_type?: 'isolated' | 'cross';
  reduce_only?: boolean;
  close_on_trigger?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  buy_order_id: string;
  sell_order_id: string;
  pair: string;
  market_type: 'spot' | 'perpetual' | 'futures' | 'options';
  price: number;
  amount: number;
  taker_side: 'buy' | 'sell';
  fee: number;
  fee_currency: string;
  leverage?: number;
  liquidation?: boolean;
  created_at: string;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  count: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: string;
  sequence_number: number;
}

export interface MarketData {
  pair: string;
  market_type: 'spot' | 'perpetual' | 'futures' | 'options';
  last_price: number;
  bid: number;
  ask: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
  price_change_24h: number;
  price_change_percent_24h: number;
  funding_rate?: number;
  next_funding_time?: string;
  open_interest?: number;
  long_short_ratio?: number;
  liquidation_24h?: number;
  updated_at: string;
}

export interface UserPosition {
  id: string;
  user_id: string;
  pair: string;
  market_type: 'perpetual' | 'futures' | 'options';
  side: 'long' | 'short';
  size: number;
  entry_price: number;
  mark_price: number;
  unrealized_pnl: number;
  realized_pnl: number;
  margin: number;
  leverage: number;
  margin_type: 'isolated' | 'cross';
  liquidation_price?: number;
  created_at: string;
  updated_at: string;
}

export class ExchangeEngine {
  private supabase = createAdminSupabaseClient();

  // Trading Pairs Management - Unlimited Pairs
  async getTradingPairs(marketType?: 'spot' | 'perpetual' | 'futures' | 'options'): Promise<TradingPair[]> {
    let query = this.supabase
      .from('trading_pairs')
      .select('*')
      .eq('is_active', true)
      .order('symbol');

    if (marketType) {
      query = query.eq('market_type', marketType);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch trading pairs: ${error.message}`);
    return data || [];
  }

  async createTradingPair(pair: Omit<TradingPair, 'id' | 'created_at' | 'updated_at'>): Promise<TradingPair> {
    const { data, error } = await this.supabase
      .from('trading_pairs')
      .insert([pair])
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create trading pair: ${error.message}`);
    return data;
  }

  // Advanced Order Management
  async placeOrder(orderData: {
    user_id: string;
    side: 'buy' | 'sell';
    pair: string;
    market_type: 'spot' | 'perpetual' | 'futures' | 'options';
    price: number;
    amount: number;
    order_type?: 'market' | 'limit' | 'stop' | 'stop_limit' | 'take_profit' | 'take_profit_limit';
    time_in_force?: 'GTC' | 'IOC' | 'FOK' | 'GTX';
    stop_price?: number;
    leverage?: number;
    margin_type?: 'isolated' | 'cross';
    reduce_only?: boolean;
    close_on_trigger?: boolean;
  }): Promise<{ order: Order; trades: Trade[] }> {
    const { 
      user_id, side, pair, market_type, price, amount, 
      order_type = 'limit', time_in_force = 'GTC', stop_price,
      leverage, margin_type, reduce_only, close_on_trigger 
    } = orderData;

    // Validate trading pair
    const tradingPair = await this.getTradingPairBySymbol(pair, market_type);
    if (!tradingPair || !tradingPair.is_active) {
      throw new Error(`Invalid or inactive trading pair: ${pair}`);
    }

    // Validate order size
    if (amount < tradingPair.min_order_size || amount > tradingPair.max_order_size) {
      throw new Error(`Order size must be between ${tradingPair.min_order_size} and ${tradingPair.max_order_size}`);
    }

    // Handle different market types
    if (market_type === 'spot') {
      return this.handleSpotOrder(orderData, tradingPair);
    } else if (market_type === 'perpetual' || market_type === 'futures') {
      return this.handleDerivativesOrder(orderData, tradingPair);
    } else if (market_type === 'options') {
      return this.handleOptionsOrder(orderData, tradingPair);
    }

    throw new Error(`Unsupported market type: ${market_type}`);
  }

  private async handleSpotOrder(orderData: any, tradingPair: TradingPair): Promise<{ order: Order; trades: Trade[] }> {
    const { user_id, side, pair, price, amount } = orderData;
    const [baseCurrency, quoteCurrency] = pair.split('/');
    const requiredAmount = side === 'buy' ? price * amount : amount;

    // Lock balance for spot trading
    const balanceLocked = await this.lockBalance(user_id, side === 'buy' ? quoteCurrency : baseCurrency, requiredAmount);
    if (!balanceLocked) {
      throw new Error('Insufficient balance');
    }

    // Create order
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .insert([{
        user_id,
        side,
        pair,
        market_type: 'spot',
        price,
        amount,
        filled: 0,
        status: 'open',
        order_type: orderData.order_type,
        time_in_force: orderData.time_in_force,
        stop_price: orderData.stop_price,
        fee: 0
      }])
      .select()
      .single();

    if (orderError) {
      await this.unlockBalance(user_id, side === 'buy' ? quoteCurrency : baseCurrency, requiredAmount);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    const trades = await this.matchOrder(order.id);
    return { order, trades };
  }

  private async handleDerivativesOrder(orderData: any, tradingPair: TradingPair): Promise<{ order: Order; trades: Trade[] }> {
    const { user_id, side, pair, price, amount, leverage, margin_type, reduce_only, close_on_trigger } = orderData;
    
    // Calculate required margin
    const requiredMargin = this.calculateRequiredMargin(price, amount, leverage || 1, margin_type || 'cross');
    
    // Check margin availability
    const marginAvailable = await this.checkMarginAvailability(user_id, requiredMargin, margin_type || 'cross');
    if (!marginAvailable) {
      throw new Error('Insufficient margin');
    }

    // Lock margin
    await this.lockMargin(user_id, requiredMargin, margin_type || 'cross');

    // Create order
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .insert([{
        user_id,
        side,
        pair,
        market_type: orderData.market_type,
        price,
        amount,
        filled: 0,
        status: 'open',
        order_type: orderData.order_type,
        time_in_force: orderData.time_in_force,
        stop_price: orderData.stop_price,
        fee: 0,
        leverage,
        margin_type,
        reduce_only,
        close_on_trigger
      }])
      .select()
      .single();

    if (orderError) {
      await this.unlockMargin(user_id, requiredMargin, margin_type || 'cross');
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    const trades = await this.matchOrder(order.id);
    return { order, trades };
  }

  private async handleOptionsOrder(orderData: any, tradingPair: TradingPair): Promise<{ order: Order; trades: Trade[] }> {
    // Options-specific logic
    // This would include strike price validation, expiry checks, etc.
    throw new Error('Options trading not yet implemented');
  }

  // Advanced Order Matching Engine
  private async matchOrder(orderId: string): Promise<Trade[]> {
    const { data: order } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order || order.status !== 'open') return [];

    const trades: Trade[] = [];
    let remainingAmount = order.amount - order.filled;

    while (remainingAmount > 0) {
      const matchingOrders = await this.findMatchingOrders(order);
      if (matchingOrders.length === 0) break;

      for (const matchingOrder of matchingOrders) {
        if (remainingAmount <= 0) break;

        const tradeAmount = Math.min(remainingAmount, matchingOrder.amount - matchingOrder.filled);
        const tradePrice = this.determineTradePrice(order, matchingOrder);

        // Create trade
        const trade = await this.createTrade(order, matchingOrder, tradeAmount, tradePrice);
        trades.push(trade);

        // Update order fills
        await this.updateOrderFills(order.id, tradeAmount);
        await this.updateOrderFills(matchingOrder.id, tradeAmount);

        // Update balances/positions based on market type
        if (order.market_type === 'spot') {
          await this.settleSpotTrade(trade);
        } else if (order.market_type === 'perpetual' || order.market_type === 'futures') {
          await this.settleDerivativesTrade(trade);
        }

        remainingAmount -= tradeAmount;
      }
    }

    return trades;
  }

  private async findMatchingOrders(order: Order): Promise<Order[]> {
    const oppositeSide = order.side === 'buy' ? 'sell' : 'buy';

    const { data: matchingOrders } = await this.supabase
      .from('orders')
      .select('*')
      .eq('pair', order.pair)
      .eq('market_type', order.market_type)
      .eq('side', oppositeSide)
      .eq('status', 'open')
      .order('price', { ascending: order.side === 'buy' })
      .order('created_at', { ascending: true })
      .limit(20);

    return matchingOrders || [];
  }

  private determineTradePrice(order1: Order, order2: Order): number {
    if (new Date(order1.created_at) < new Date(order2.created_at)) {
      return order1.price;
    } else {
      return order2.price;
    }
  }

  private async createTrade(buyOrder: Order, sellOrder: Order, amount: number, price: number): Promise<Trade> {
    const tradingPair = await this.getTradingPairBySymbol(buyOrder.pair, buyOrder.market_type);
    const fee = amount * price * (tradingPair?.taker_fee || 0.001);

    const { data: trade, error } = await this.supabase
      .from('trades')
      .insert([{
        buy_order_id: buyOrder.side === 'buy' ? buyOrder.id : sellOrder.id,
        sell_order_id: buyOrder.side === 'sell' ? buyOrder.id : sellOrder.id,
        pair: buyOrder.pair,
        market_type: buyOrder.market_type,
        price,
        amount,
        taker_side: buyOrder.side,
        fee,
        fee_currency: buyOrder.market_type === 'spot' ? 'USDT' : 'USDT',
        leverage: buyOrder.leverage,
        liquidation: false
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create trade: ${error.message}`);
    return trade;
  }

  private async updateOrderFills(orderId: string, fillAmount: number): Promise<void> {
    const { data: order } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order) return;

    const newFilled = order.filled + fillAmount;
    const newStatus = newFilled >= order.amount ? 'filled' : 'partial';

    await this.supabase
      .from('orders')
      .update({
        filled: newFilled,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
  }

  // Balance Management
  private async lockBalance(userId: string, currency: string, amount: number): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('lock_balance_for_order', {
      p_user_id: userId,
      p_currency: currency,
      p_amount: amount
    });

    return !error;
  }

  private async unlockBalance(userId: string, currency: string, amount: number): Promise<void> {
    await this.supabase.rpc('unlock_balance_for_order', {
      p_user_id: userId,
      p_currency: currency,
      p_amount: amount
    });
  }

  // Margin Management for Derivatives
  private calculateRequiredMargin(price: number, amount: number, leverage: number, marginType: string): number {
    const notionalValue = price * amount;
    return notionalValue / leverage;
  }

  private async checkMarginAvailability(userId: string, requiredMargin: number, marginType: string): Promise<boolean> {
    const { data: balance } = await this.supabase
      .from('user_balances')
      .select('available_balance')
      .eq('user_id', userId)
      .eq('currency', 'USDT')
      .single();

    return balance ? Number(balance.available_balance) >= requiredMargin : false;
  }

  private async lockMargin(userId: string, amount: number, marginType: string): Promise<void> {
    await this.supabase.rpc('lock_balance_for_order', {
      p_user_id: userId,
      p_currency: 'USDT',
      p_amount: amount
    });
  }

  private async unlockMargin(userId: string, amount: number, marginType: string): Promise<void> {
    await this.supabase.rpc('unlock_balance_for_order', {
      p_user_id: userId,
      p_currency: 'USDT',
      p_amount: amount
    });
  }

  // Trade Settlement
  private async settleSpotTrade(trade: Trade): Promise<void> {
    const { data: buyOrder } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', trade.buy_order_id)
      .single();

    const { data: sellOrder } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', trade.sell_order_id)
      .single();

    if (!buyOrder || !sellOrder) return;

    const [baseCurrency, quoteCurrency] = trade.pair.split('/');
    const tradeValue = trade.amount * trade.price;

    // Update balances
    await this.supabase.rpc('atomic_update_balance', {
      p_user_id: buyOrder.user_id,
      p_currency: baseCurrency,
      p_amount: trade.amount - trade.fee,
      p_reason: 'trade',
      p_trade_id: trade.id
    });

    await this.supabase.rpc('atomic_update_balance', {
      p_user_id: sellOrder.user_id,
      p_currency: quoteCurrency,
      p_amount: tradeValue - trade.fee,
      p_reason: 'trade',
      p_trade_id: trade.id
    });
  }

  private async settleDerivativesTrade(trade: Trade): Promise<void> {
    const { data: buyOrder } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', trade.buy_order_id)
      .single();

    const { data: sellOrder } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', trade.sell_order_id)
      .single();

    if (!buyOrder || !sellOrder) return;

    // Update or create positions
    await this.updatePosition(buyOrder.user_id, trade.pair, 'long', trade.amount, trade.price, trade.leverage || 1);
    await this.updatePosition(sellOrder.user_id, trade.pair, 'short', trade.amount, trade.price, trade.leverage || 1);

    // Update margin
    const marginUsed = (trade.amount * trade.price) / (trade.leverage || 1);
    await this.supabase.rpc('atomic_update_balance', {
      p_user_id: buyOrder.user_id,
      p_currency: 'USDT',
      p_amount: -marginUsed,
      p_reason: 'margin_used',
      p_trade_id: trade.id
    });

    await this.supabase.rpc('atomic_update_balance', {
      p_user_id: sellOrder.user_id,
      p_currency: 'USDT',
      p_amount: -marginUsed,
      p_reason: 'margin_used',
      p_trade_id: trade.id
    });
  }

  // Position Management
  private async updatePosition(userId: string, pair: string, side: 'long' | 'short', size: number, price: number, leverage: number): Promise<void> {
    const { data: existingPosition } = await this.supabase
      .from('user_positions')
      .select('*')
      .eq('user_id', userId)
      .eq('pair', pair)
      .single();

    if (existingPosition) {
      // Update existing position
      const newSize = side === 'long' ? existingPosition.size + size : existingPosition.size - size;
      const newEntryPrice = (existingPosition.entry_price * existingPosition.size + price * size) / (existingPosition.size + size);

      await this.supabase
        .from('user_positions')
        .update({
          size: newSize,
          entry_price: newEntryPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPosition.id);
    } else {
      // Create new position
      await this.supabase
        .from('user_positions')
        .insert([{
          user_id: userId,
          pair,
          market_type: 'perpetual',
          side,
          size,
          entry_price: price,
          mark_price: price,
          unrealized_pnl: 0,
          realized_pnl: 0,
          margin: (size * price) / leverage,
          leverage,
          margin_type: 'cross'
        }]);
    }
  }

  // Order Book Management
  async getOrderBook(pair: string, marketType: 'spot' | 'perpetual' | 'futures' | 'options', depth: number = 50): Promise<OrderBook> {
    const { data: bids } = await this.supabase
      .from('orders')
      .select('price, amount')
      .eq('pair', pair)
      .eq('market_type', marketType)
      .eq('side', 'buy')
      .eq('status', 'open')
      .order('price', { ascending: false })
      .limit(depth);

    const { data: asks } = await this.supabase
      .from('orders')
      .select('price, amount')
      .eq('pair', pair)
      .eq('market_type', marketType)
      .eq('side', 'sell')
      .eq('status', 'open')
      .order('price', { ascending: true })
      .limit(depth);

    const bidLevels = this.aggregateOrderBookLevels(bids || [], 'buy');
    const askLevels = this.aggregateOrderBookLevels(asks || [], 'sell');

    return {
      bids: bidLevels,
      asks: askLevels,
      timestamp: new Date().toISOString(),
      sequence_number: Date.now()
    };
  }

  private aggregateOrderBookLevels(orders: any[], side: 'buy' | 'sell'): OrderBookLevel[] {
    const levels = new Map<number, { amount: number; count: number }>();

    for (const order of orders) {
      const price = Number(order.price);
      const amount = Number(order.amount);
      
      if (levels.has(price)) {
        levels.get(price)!.amount += amount;
        levels.get(price)!.count += 1;
      } else {
        levels.set(price, { amount, count: 1 });
      }
    }

    return Array.from(levels.entries())
      .map(([price, { amount, count }]) => ({ price, amount, count }))
      .sort((a, b) => side === 'buy' ? b.price - a.price : a.price - b.price);
  }

  // Market Data
  async updateMarketData(pair: string, marketType: 'spot' | 'perpetual' | 'futures' | 'options'): Promise<void> {
    const { data: trades } = await this.supabase
      .from('trades')
      .select('price, amount, created_at')
      .eq('pair', pair)
      .eq('market_type', marketType)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (!trades || trades.length === 0) return;

    const prices = trades.map(t => Number(t.price));
    const volumes = trades.map(t => Number(t.amount));
    
    const lastPrice = prices[0];
    const high24h = Math.max(...prices);
    const low24h = Math.min(...prices);
    const volume24h = volumes.reduce((sum, vol) => sum + vol, 0);
    const priceChange24h = lastPrice - prices[prices.length - 1];
    const priceChangePercent24h = (priceChange24h / prices[prices.length - 1]) * 100;

    const orderBook = await this.getOrderBook(pair, marketType, 1);
    const bestBid = orderBook.bids[0]?.price;
    const bestAsk = orderBook.asks[0]?.price;

    // Calculate additional metrics for derivatives
    let fundingRate = 0;
    let openInterest = 0;
    let longShortRatio = 1;

    if (marketType === 'perpetual') {
      fundingRate = this.calculateFundingRate(pair);
      openInterest = await this.calculateOpenInterest(pair);
      longShortRatio = await this.calculateLongShortRatio(pair);
    }

    await this.supabase
      .from('market_data')
      .upsert([{
        pair,
        market_type: marketType,
        last_price: lastPrice,
        bid: bestBid,
        ask: bestAsk,
        high_24h: high24h,
        low_24h: low24h,
        volume_24h: volume24h,
        price_change_24h: priceChange24h,
        price_change_percent_24h: priceChangePercent24h,
        funding_rate: fundingRate,
        open_interest: openInterest,
        long_short_ratio: longShortRatio,
        updated_at: new Date().toISOString()
      }]);
  }

  private calculateFundingRate(pair: string): number {
    // Simplified funding rate calculation
    // In reality, this would be based on premium/discount to spot price
    return 0.0001; // 0.01% per 8 hours
  }

  private async calculateOpenInterest(pair: string): Promise<number> {
    const { data: positions } = await this.supabase
      .from('user_positions')
      .select('size')
      .eq('pair', pair);

    return positions?.reduce((sum, pos) => sum + Number(pos.size), 0) || 0;
  }

  private async calculateLongShortRatio(pair: string): Promise<number> {
    const { data: positions } = await this.supabase
      .from('user_positions')
      .select('side, size')
      .eq('pair', pair);

    if (!positions || positions.length === 0) return 1;

    const longSize = positions
      .filter(p => p.side === 'long')
      .reduce((sum, pos) => sum + Number(pos.size), 0);

    const shortSize = positions
      .filter(p => p.side === 'short')
      .reduce((sum, pos) => sum + Number(pos.size), 0);

    return shortSize > 0 ? longSize / shortSize : 1;
  }

  // Helper methods
  private async getTradingPairBySymbol(symbol: string, marketType: string): Promise<TradingPair | null> {
    const { data, error } = await this.supabase
      .from('trading_pairs')
      .select('*')
      .eq('symbol', symbol)
      .eq('market_type', marketType)
      .single();

    if (error) return null;
    return data;
  }

  async getUserOrders(userId: string, pair?: string, marketType?: string): Promise<Order[]> {
    let query = this.supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (pair) {
      query = query.eq('pair', pair);
    }

    if (marketType) {
      query = query.eq('market_type', marketType);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch user orders: ${error.message}`);
    return data || [];
  }

  async getUserPositions(userId: string): Promise<UserPosition[]> {
    const { data, error } = await this.supabase
      .from('user_positions')
      .select('*')
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to fetch user positions: ${error.message}`);
    return data || [];
  }

  async getUserBalance(userId: string, currency: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('user_balances')
      .select('available_balance')
      .eq('user_id', userId)
      .eq('currency', currency)
      .single();

    if (error || !data) return 0;
    return Number(data.available_balance);
  }

  // Liquidation Engine
  async checkLiquidation(userId: string): Promise<void> {
    const positions = await this.getUserPositions(userId);
    
    for (const position of positions) {
      const markPrice = await this.getMarkPrice(position.pair);
      const liquidationPrice = this.calculateLiquidationPrice(position);
      
      if ((position.side === 'long' && markPrice <= liquidationPrice) ||
          (position.side === 'short' && markPrice >= liquidationPrice)) {
        await this.liquidatePosition(position.id);
      }
    }
  }

  private async getMarkPrice(pair: string): Promise<number> {
    const { data } = await this.supabase
      .from('market_data')
      .select('last_price')
      .eq('pair', pair)
      .single();

    return data?.last_price || 0;
  }

  private calculateLiquidationPrice(position: UserPosition): number {
    const maintenanceMargin = 0.005; // 0.5% maintenance margin
    const notionalValue = position.size * position.entry_price;
    const maintenanceAmount = notionalValue * maintenanceMargin;
    
    if (position.side === 'long') {
      return position.entry_price - (maintenanceAmount / position.size);
    } else {
      return position.entry_price + (maintenanceAmount / position.size);
    }
  }

  private async liquidatePosition(positionId: string): Promise<void> {
    // Create liquidation order
    const { data: position } = await this.supabase
      .from('user_positions')
      .select('*')
      .eq('id', positionId)
      .single();

    if (!position) return;

    const liquidationSide = position.side === 'long' ? 'sell' : 'buy';
    
    await this.supabase
      .from('orders')
      .insert([{
        user_id: position.user_id,
        side: liquidationSide,
        pair: position.pair,
        market_type: position.market_type,
        price: 0, // Market order
        amount: position.size,
        filled: 0,
        status: 'open',
        order_type: 'market',
        time_in_force: 'IOC',
        fee: 0,
        leverage: position.leverage,
        margin_type: position.margin_type,
        reduce_only: true
      }]);
  }
} 
} 