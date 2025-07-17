-- projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  token_symbol text not null,
  token_price numeric not null,
  total_tokens numeric not null,
  tokens_sold numeric not null default 0,
  start_time timestamptz not null,
  end_time timestamptz not null,
  owner_id uuid references auth.users(id),
  status text not null default 'draft'
);

-- participants table
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) not null,
  user_id uuid references auth.users(id) not null,
  tokens_bought numeric not null,
  amount_paid numeric not null,
  tx_time timestamptz not null default now()
);

-- transactions table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  project_id uuid references public.projects(id),
  type text not null,
  amount numeric not null,
  value numeric not null,
  tx_time timestamptz not null default now()
);

-- wallets table
create table if not exists public.wallets (
  user_id uuid references auth.users(id) not null,
  token_symbol text not null,
  balance numeric not null default 0,
  primary key (user_id, token_symbol)
);
