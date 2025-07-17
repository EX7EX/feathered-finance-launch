-- Trading pairs table
create table if not exists public.trading_pairs (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null references supported_currencies(code),
  quote_currency text not null references supported_currencies(code),
  symbol text not null unique, -- e.g., 'BTC/USDT'
  is_active boolean not null default true,
  min_order_size numeric(36,18) not null default 0.0001,
  max_order_size numeric(36,18) not null default 1000000,
  price_precision integer not null default 8,
  quantity_precision integer not null default 8,
  maker_fee numeric(10,8) not null default 0.001, -- 0.1%
  taker_fee numeric(10,8) not null default 0.001, -- 0.1%
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trading_pairs_base_quote_unique unique (base_currency, quote_currency)
);

-- Enhanced orders table with more fields
alter table public.orders add column if not exists order_type text not null default 'limit' check (order_type in ('market', 'limit', 'stop', 'stop_limit'));
alter table public.orders add column if not exists time_in_force text not null default 'GTC' check (time_in_force in ('GTC', 'IOC', 'FOK'));
alter table public.orders add column if not exists stop_price numeric(36,18);
alter table public.orders add column if not exists iceberg_amount numeric(36,18);
alter table public.orders add column if not exists fee numeric(36,18) not null default 0;

-- Order book snapshots for performance
create table if not exists public.order_book_snapshots (
  id uuid primary key default gen_random_uuid(),
  pair text not null,
  bids jsonb not null, -- [{price, amount, count}]
  asks jsonb not null, -- [{price, amount, count}]
  timestamp timestamptz not null default now(),
  sequence_number bigint not null
);

-- Market data cache
create table if not exists public.market_data (
  id uuid primary key default gen_random_uuid(),
  pair text not null,
  last_price numeric(36,18),
  bid numeric(36,18),
  ask numeric(36,18),
  high_24h numeric(36,18),
  low_24h numeric(36,18),
  volume_24h numeric(36,18),
  price_change_24h numeric(36,18),
  price_change_percent_24h numeric(10,8),
  updated_at timestamptz not null default now()
);

-- User balances with atomic updates
create table if not exists public.user_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  currency text not null references supported_currencies(code),
  balance numeric(36,18) not null default 0,
  available_balance numeric(36,18) not null default 0,
  locked_balance numeric(36,18) not null default 0,
  updated_at timestamptz not null default now(),
  constraint user_balances_user_currency_unique unique (user_id, currency)
);

-- Balance history for audit
create table if not exists public.balance_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  currency text not null references supported_currencies(code),
  change_amount numeric(36,18) not null,
  balance_before numeric(36,18) not null,
  balance_after numeric(36,18) not null,
  reason text not null, -- 'trade', 'deposit', 'withdrawal', 'fee'
  related_trade_id uuid references public.trades(id),
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_trading_pairs_symbol on public.trading_pairs(symbol);
create index if not exists idx_trading_pairs_active on public.trading_pairs(is_active);
create index if not exists idx_orders_pair_side_price_type on public.orders(pair, side, price, order_type);
create index if not exists idx_orders_user_status on public.orders(user_id, status);
create index if not exists idx_order_book_snapshots_pair_time on public.order_book_snapshots(pair, timestamp);
create index if not exists idx_market_data_pair on public.market_data(pair);
create index if not exists idx_user_balances_user_currency on public.user_balances(user_id, currency);
create index if not exists idx_balance_history_user_currency on public.balance_history(user_id, currency); 