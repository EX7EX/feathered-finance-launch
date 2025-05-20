-- This is an empty migration. --

-- Create the supported_currencies table first, as it's referenced by other tables
CREATE TABLE public.supported_currencies (
    id serial PRIMARY KEY,
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    symbol text NOT NULL,
    currency_type text CHECK (currency_type IN ('fiat', 'crypto')) NOT NULL,
    exchange_rate_to_usd numeric,
    precision integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_updated timestamp with time zone
);

-- Create the profiles table
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    kyc_level text,
    kyc_verified boolean DEFAULT false NOT NULL,
    kyc_reference_id text,
    country text,
    phone text,
    locale text,
    timezone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_login timestamp with time zone
);

-- Create the crypto_wallets table
CREATE TABLE public.crypto_wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles NOT NULL,
    crypto_code text REFERENCES public.supported_currencies(code) NOT NULL,
    balance numeric DEFAULT 0 NOT NULL,
    address text UNIQUE,
    address_verified boolean DEFAULT false NOT NULL,
    blockchain text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add a unique constraint to prevent duplicate wallets for the same user and crypto code
ALTER TABLE public.crypto_wallets ADD CONSTRAINT user_crypto_code_unique UNIQUE (user_id, crypto_code);

-- Create the fiat_accounts table
CREATE TABLE public.fiat_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles NOT NULL,
    currency_code text REFERENCES public.supported_currencies(code) NOT NULL,
    balance numeric DEFAULT 0 NOT NULL,
    available_balance numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add a unique constraint to prevent duplicate accounts for the same user and currency code
ALTER TABLE public.fiat_accounts ADD CONSTRAINT user_currency_code_unique UNIQUE (user_id, currency_code);

-- Optional: Add Row Level Security (RLS) policies for basic access control
-- You will need to define specific policies based on your application's access requirements
-- For example, allowing users to view their own profile:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Similarly for other tables, defining insert, update, and delete policies as needed.
