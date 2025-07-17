-- orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  side text not null check (side in ('buy', 'sell')),
  pair text not null,
  price numeric(36,18) not null,
  amount numeric(36,18) not null,
  filled numeric(36,18) not null default 0,
  status text not null default 'open', -- open, filled, cancelled, partial
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_pair_side_price on public.orders(pair, side, price);
create index if not exists idx_orders_user_id on public.orders(user_id);

-- trades table
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  buy_order_id uuid references public.orders(id) not null,
  sell_order_id uuid references public.orders(id) not null,
  pair text not null,
  price numeric(36,18) not null,
  amount numeric(36,18) not null,
  taker_side text not null check (taker_side in ('buy', 'sell')),
  created_at timestamptz not null default now()
);
create index if not exists idx_trades_pair on public.trades(pair);
create index if not exists idx_trades_buy_order_id on public.trades(buy_order_id);
create index if not exists idx_trades_sell_order_id on public.trades(sell_order_id); 