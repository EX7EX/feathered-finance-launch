-- Advanced Exchange Infrastructure

-- Enhanced trading pairs table with market types
alter table public.trading_pairs add column if not exists market_type text not null default 'spot' check (market_type in ('spot', 'perpetual', 'futures', 'options'));
alter table public.trading_pairs add column if not exists contract_type text check (contract_type in ('linear', 'inverse', 'quanto'));
alter table public.trading_pairs add column if not exists leverage_max integer;
alter table public.trading_pairs add column if not exists leverage_min integer default 1;
alter table public.trading_pairs add column if not exists funding_rate numeric(10,8) default 0;
alter table public.trading_pairs add column if not exists funding_interval integer default 8; -- hours
alter table public.trading_pairs add column if not exists settlement_time timestamptz;
alter table public.trading_pairs add column if not exists underlying_asset text;
alter table public.trading_pairs add column if not exists strike_price numeric(36,18);
alter table public.trading_pairs add column if not exists expiry_date timestamptz;

-- Enhanced orders table
alter table public.orders add column if not exists market_type text not null default 'spot' check (market_type in ('spot', 'perpetual', 'futures', 'options'));
alter table public.orders add column if not exists order_type text not null default 'limit' check (order_type in ('market', 'limit', 'stop', 'stop_limit', 'take_profit', 'take_profit_limit'));
alter table public.orders add column if not exists time_in_force text not null default 'GTC' check (time_in_force in ('GTC', 'IOC', 'FOK', 'GTX'));
alter table public.orders add column if not exists stop_price numeric(36,18);
alter table public.orders add column if not exists iceberg_amount numeric(36,18);
alter table public.orders add column if not exists fee numeric(36,18) not null default 0;
alter table public.orders add column if not exists leverage integer;
alter table public.orders add column if not exists margin_type text check (margin_type in ('isolated', 'cross'));
alter table public.orders add column if not exists reduce_only boolean default false;
alter table public.orders add column if not exists close_on_trigger boolean default false;
alter table public.orders add column if not exists status text not null default 'open' check (status in ('open', 'filled', 'cancelled', 'partial', 'rejected'));

-- Enhanced trades table
alter table public.trades add column if not exists market_type text not null default 'spot' check (market_type in ('spot', 'perpetual', 'futures', 'options'));
alter table public.trades add column if not exists fee numeric(36,18) not null default 0;
alter table public.trades add column if not exists fee_currency text not null default 'USDT';
alter table public.trades add column if not exists leverage integer;
alter table public.trades add column if not exists liquidation boolean default false;

-- User positions for derivatives
create table if not exists public.user_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pair text not null,
  market_type text not null check (market_type in ('perpetual', 'futures', 'options')),
  side text not null check (side in ('long', 'short')),
  size numeric(36,18) not null,
  entry_price numeric(36,18) not null,
  mark_price numeric(36,18) not null,
  unrealized_pnl numeric(36,18) not null default 0,
  realized_pnl numeric(36,18) not null default 0,
  margin numeric(36,18) not null,
  leverage integer not null,
  margin_type text not null check (margin_type in ('isolated', 'cross')),
  liquidation_price numeric(36,18),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_positions_user_pair_unique unique (user_id, pair, market_type)
);

-- Enhanced market data table
alter table public.market_data add column if not exists market_type text not null default 'spot' check (market_type in ('spot', 'perpetual', 'futures', 'options'));
alter table public.market_data add column if not exists funding_rate numeric(10,8);
alter table public.market_data add column if not exists next_funding_time timestamptz;
alter table public.market_data add column if not exists open_interest numeric(36,18);
alter table public.market_data add column if not exists long_short_ratio numeric(10,8);
alter table public.market_data add column if not exists liquidation_24h numeric(36,18);

-- Funding rate history
create table if not exists public.funding_rates (
  id uuid primary key default gen_random_uuid(),
  pair text not null,
  funding_rate numeric(10,8) not null,
  funding_time timestamptz not null,
  created_at timestamptz not null default now()
);

-- Liquidation history
create table if not exists public.liquidations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  pair text not null,
  market_type text not null,
  side text not null check (side in ('long', 'short')),
  size numeric(36,18) not null,
  price numeric(36,18) not null,
  pnl numeric(36,18) not null,
  created_at timestamptz not null default now()
);

-- Insurance fund
create table if not exists public.insurance_fund (
  id uuid primary key default gen_random_uuid(),
  currency text not null references supported_currencies(code),
  balance numeric(36,18) not null default 0,
  total_contributions numeric(36,18) not null default 0,
  total_payouts numeric(36,18) not null default 0,
  updated_at timestamptz not null default now()
);

-- Referral system
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id),
  referred_id uuid not null references auth.users(id),
  commission_rate numeric(10,8) not null default 0.3, -- 30% commission
  total_commission numeric(36,18) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  constraint referrals_referred_unique unique (referred_id)
);

-- Staking rewards
create table if not exists public.staking_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  currency text not null references supported_currencies(code),
  amount numeric(36,18) not null,
  reward_type text not null check (reward_type in ('trading_fee', 'referral', 'staking', 'promotion')),
  period_start timestamptz not null,
  period_end timestamptz not null,
  created_at timestamptz not null default now()
);

-- Advanced order types
create table if not exists public.conditional_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  pair text not null,
  market_type text not null,
  order_type text not null check (order_type in ('stop', 'stop_limit', 'take_profit', 'take_profit_limit')),
  side text not null check (side in ('buy', 'sell')),
  trigger_price numeric(36,18) not null,
  order_price numeric(36,18),
  amount numeric(36,18) not null,
  status text not null default 'pending' check (status in ('pending', 'triggered', 'cancelled', 'expired')),
  triggered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_trading_pairs_market_type on public.trading_pairs(market_type);
create index if not exists idx_trading_pairs_symbol_market on public.trading_pairs(symbol, market_type);
create index if not exists idx_orders_market_type on public.orders(market_type);
create index if not exists idx_orders_pair_market_side on public.orders(pair, market_type, side);
create index if not exists idx_trades_market_type on public.trades(market_type);
create index if not exists idx_user_positions_user_market on public.user_positions(user_id, market_type);
create index if not exists idx_user_positions_pair on public.user_positions(pair);
create index if not exists idx_market_data_pair_market on public.market_data(pair, market_type);
create index if not exists idx_funding_rates_pair_time on public.funding_rates(pair, funding_time);
create index if not exists idx_liquidations_user_time on public.liquidations(user_id, created_at);
create index if not exists idx_conditional_orders_user_status on public.conditional_orders(user_id, status);
create index if not exists idx_conditional_orders_trigger_price on public.conditional_orders(trigger_price);

-- Functions for advanced features

-- Calculate funding rate
create or replace function calculate_funding_rate(p_pair text)
returns numeric as $$
declare
  v_premium numeric;
  v_funding_rate numeric;
begin
  -- Simplified funding rate calculation
  -- In reality, this would be based on premium/discount to spot price
  select random() * 0.0002 - 0.0001 into v_premium;
  return v_premium;
end;
$$ language plpgsql;

-- Update mark prices for all positions
create or replace function update_mark_prices()
returns void as $$
declare
  position_record record;
begin
  for position_record in select * from user_positions where market_type in ('perpetual', 'futures')
  loop
    update user_positions
    set mark_price = (
      select last_price from market_data 
      where pair = position_record.pair 
      and market_type = position_record.market_type
      limit 1
    ),
    unrealized_pnl = case 
      when side = 'long' then (mark_price - entry_price) * size
      else (entry_price - mark_price) * size
    end,
    updated_at = now()
    where id = position_record.id;
  end loop;
end;
$$ language plpgsql;

-- Check and trigger conditional orders
create or replace function check_conditional_orders()
returns void as $$
declare
  order_record record;
  v_mark_price numeric;
begin
  for order_record in select * from conditional_orders where status = 'pending'
  loop
    select last_price into v_mark_price
    from market_data
    where pair = order_record.pair
    and market_type = order_record.market_type
    limit 1;
    
    if v_mark_price is not null then
      -- Check if trigger condition is met
      if (order_record.order_type in ('stop', 'stop_limit') and 
          ((order_record.side = 'sell' and v_mark_price <= order_record.trigger_price) or
           (order_record.side = 'buy' and v_mark_price >= order_record.trigger_price))) or
         (order_record.order_type in ('take_profit', 'take_profit_limit') and
          ((order_record.side = 'sell' and v_mark_price >= order_record.trigger_price) or
           (order_record.side = 'buy' and v_mark_price <= order_record.trigger_price))) then
        
        -- Trigger the order
        update conditional_orders
        set status = 'triggered',
            triggered_at = now(),
            updated_at = now()
        where id = order_record.id;
        
        -- Create actual order (this would call the order placement logic)
        -- For now, just log it
        insert into audit_logs (table_name, record_id, operation, new_data)
        values ('conditional_orders', order_record.id, 'TRIGGER', 
                jsonb_build_object('trigger_price', order_record.trigger_price, 'mark_price', v_mark_price));
      end if;
    end if;
  end loop;
end;
$$ language plpgsql;

-- Liquidation check function
create or replace function check_liquidations()
returns void as $$
declare
  position_record record;
  v_liquidation_price numeric;
  v_mark_price numeric;
begin
  for position_record in select * from user_positions where market_type in ('perpetual', 'futures')
  loop
    select last_price into v_mark_price
    from market_data
    where pair = position_record.pair
    and market_type = position_record.market_type
    limit 1;
    
    if v_mark_price is not null then
      -- Calculate liquidation price (simplified)
      v_liquidation_price = case 
        when position_record.side = 'long' then 
          position_record.entry_price * (1 - 1.0 / position_record.leverage + 0.005)
        else 
          position_record.entry_price * (1 + 1.0 / position_record.leverage - 0.005)
      end;
      
      -- Check if liquidation is needed
      if (position_record.side = 'long' and v_mark_price <= v_liquidation_price) or
         (position_record.side = 'short' and v_mark_price >= v_liquidation_price) then
        
        -- Record liquidation
        insert into liquidations (user_id, pair, market_type, side, size, price, pnl)
        values (position_record.user_id, position_record.pair, position_record.market_type,
                position_record.side, position_record.size, v_mark_price, position_record.unrealized_pnl);
        
        -- Close position
        delete from user_positions where id = position_record.id;
      end if;
    end if;
  end loop;
end;
$$ language plpgsql;

-- Scheduled jobs (using pg_cron if available)
-- select cron.schedule('update-mark-prices', '*/5 * * * *', 'select update_mark_prices();');
-- select cron.schedule('check-conditional-orders', '*/1 * * * *', 'select check_conditional_orders();');
-- select cron.schedule('check-liquidations', '*/10 * * * *', 'select check_liquidations();');
-- select cron.schedule('update-funding-rates', '0 */8 * * *', 'select update_funding_rates();'); 