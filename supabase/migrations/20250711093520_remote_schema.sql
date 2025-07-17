create extension if not exists "pgjwt" with schema "extensions";


create sequence "public"."blockchains_id_seq";

create sequence "public"."supported_currencies_id_seq";

revoke delete on table "public"."participants" from "anon";

revoke insert on table "public"."participants" from "anon";

revoke references on table "public"."participants" from "anon";

revoke select on table "public"."participants" from "anon";

revoke trigger on table "public"."participants" from "anon";

revoke truncate on table "public"."participants" from "anon";

revoke update on table "public"."participants" from "anon";

revoke delete on table "public"."participants" from "authenticated";

revoke insert on table "public"."participants" from "authenticated";

revoke references on table "public"."participants" from "authenticated";

revoke select on table "public"."participants" from "authenticated";

revoke trigger on table "public"."participants" from "authenticated";

revoke truncate on table "public"."participants" from "authenticated";

revoke update on table "public"."participants" from "authenticated";

revoke delete on table "public"."participants" from "service_role";

revoke insert on table "public"."participants" from "service_role";

revoke references on table "public"."participants" from "service_role";

revoke select on table "public"."participants" from "service_role";

revoke trigger on table "public"."participants" from "service_role";

revoke truncate on table "public"."participants" from "service_role";

revoke update on table "public"."participants" from "service_role";

revoke delete on table "public"."projects" from "anon";

revoke insert on table "public"."projects" from "anon";

revoke references on table "public"."projects" from "anon";

revoke select on table "public"."projects" from "anon";

revoke trigger on table "public"."projects" from "anon";

revoke truncate on table "public"."projects" from "anon";

revoke update on table "public"."projects" from "anon";

revoke delete on table "public"."projects" from "authenticated";

revoke insert on table "public"."projects" from "authenticated";

revoke references on table "public"."projects" from "authenticated";

revoke select on table "public"."projects" from "authenticated";

revoke trigger on table "public"."projects" from "authenticated";

revoke truncate on table "public"."projects" from "authenticated";

revoke update on table "public"."projects" from "authenticated";

revoke delete on table "public"."projects" from "service_role";

revoke insert on table "public"."projects" from "service_role";

revoke references on table "public"."projects" from "service_role";

revoke select on table "public"."projects" from "service_role";

revoke trigger on table "public"."projects" from "service_role";

revoke truncate on table "public"."projects" from "service_role";

revoke update on table "public"."projects" from "service_role";

revoke delete on table "public"."wallets" from "anon";

revoke insert on table "public"."wallets" from "anon";

revoke references on table "public"."wallets" from "anon";

revoke select on table "public"."wallets" from "anon";

revoke trigger on table "public"."wallets" from "anon";

revoke truncate on table "public"."wallets" from "anon";

revoke update on table "public"."wallets" from "anon";

revoke delete on table "public"."wallets" from "authenticated";

revoke insert on table "public"."wallets" from "authenticated";

revoke references on table "public"."wallets" from "authenticated";

revoke select on table "public"."wallets" from "authenticated";

revoke trigger on table "public"."wallets" from "authenticated";

revoke truncate on table "public"."wallets" from "authenticated";

revoke update on table "public"."wallets" from "authenticated";

revoke delete on table "public"."wallets" from "service_role";

revoke insert on table "public"."wallets" from "service_role";

revoke references on table "public"."wallets" from "service_role";

revoke select on table "public"."wallets" from "service_role";

revoke trigger on table "public"."wallets" from "service_role";

revoke truncate on table "public"."wallets" from "service_role";

revoke update on table "public"."wallets" from "service_role";

alter table "public"."participants" drop constraint "participants_project_id_fkey";

alter table "public"."participants" drop constraint "participants_user_id_fkey";

alter table "public"."projects" drop constraint "projects_owner_id_fkey";

alter table "public"."transactions" drop constraint "transactions_project_id_fkey";

alter table "public"."wallets" drop constraint "wallets_user_id_fkey";

alter table "public"."participants" drop constraint "participants_pkey";

alter table "public"."projects" drop constraint "projects_pkey";

alter table "public"."wallets" drop constraint "wallets_pkey";

drop index if exists "public"."participants_pkey";

drop index if exists "public"."projects_pkey";

drop index if exists "public"."wallets_pkey";

drop table "public"."participants";

drop table "public"."projects";

drop table "public"."wallets";

create table "public"."audit_logs" (
    "id" uuid not null default gen_random_uuid(),
    "table_name" text not null,
    "record_id" uuid not null,
    "operation" text not null,
    "old_data" jsonb,
    "new_data" jsonb,
    "changed_by" uuid,
    "changed_at" timestamp with time zone default now()
);


alter table "public"."audit_logs" enable row level security;

create table "public"."blockchains" (
    "id" integer not null default nextval('blockchains_id_seq'::regclass),
    "name" text not null,
    "symbol" text not null,
    "is_active" boolean default true,
    "withdrawal_fee" numeric(36,18) default 0,
    "min_withdrawal" numeric(36,18) default 0,
    "confirmation_blocks" integer default 1,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "updated_by" uuid
);


create table "public"."crypto_wallets" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "crypto_code" text not null,
    "balance" numeric(36,18) not null default 0,
    "address" text,
    "address_verified" boolean default false,
    "blockchain" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."crypto_wallets" enable row level security;

create table "public"."fiat_accounts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "currency_code" text not null,
    "balance" numeric(36,18) not null default 0,
    "available_balance" numeric(36,18) not null default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."fiat_accounts" enable row level security;

create table "public"."p2p_offers" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "offer_type" text not null,
    "crypto_currency" text not null,
    "fiat_currency" text not null,
    "price" numeric(36,18) not null,
    "min_amount" numeric(36,18) not null,
    "max_amount" numeric(36,18) not null,
    "available_amount" numeric(36,18) not null,
    "payment_methods" jsonb not null,
    "terms" text,
    "status" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."p2p_offers" enable row level security;

create table "public"."p2p_trades" (
    "id" uuid not null default gen_random_uuid(),
    "offer_id" uuid not null,
    "buyer_id" uuid not null,
    "seller_id" uuid not null,
    "crypto_currency" text not null,
    "fiat_currency" text not null,
    "amount" numeric(36,18) not null,
    "price" numeric(36,18) not null,
    "total_amount" numeric(36,18) not null,
    "payment_method_id" uuid,
    "status" text not null,
    "dispute_reason" text,
    "dispute_resolved" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."p2p_trades" enable row level security;

create table "public"."payment_methods" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "method_type" text not null,
    "currency_code" text not null,
    "name" text not null,
    "details" jsonb not null,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."payment_methods" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "username" text,
    "full_name" text,
    "avatar_url" text,
    "kyc_level" text default 'none'::text,
    "kyc_verified" boolean default false,
    "kyc_reference_id" text,
    "country" text,
    "phone" text,
    "locale" text default 'en'::text,
    "timezone" text default 'UTC'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "last_login" timestamp with time zone,
    "two_factor_enabled" boolean default false
);


alter table "public"."profiles" enable row level security;

create table "public"."supported_currencies" (
    "id" integer not null default nextval('supported_currencies_id_seq'::regclass),
    "code" text not null,
    "name" text not null,
    "symbol" text not null,
    "currency_type" text not null,
    "is_active" boolean not null default true,
    "exchange_rate_to_usd" numeric(36,18) not null,
    "precision" integer not null default 2,
    "last_updated" timestamp with time zone default now()
);


alter table "public"."transactions" drop column "project_id";

alter table "public"."transactions" drop column "tx_time";

alter table "public"."transactions" drop column "type";

alter table "public"."transactions" drop column "value";

alter table "public"."transactions" add column "blockchain" text;

alter table "public"."transactions" add column "created_at" timestamp with time zone default now();

alter table "public"."transactions" add column "currency_code" text not null;

alter table "public"."transactions" add column "fee" numeric(36,18) default 0;

alter table "public"."transactions" add column "metadata" jsonb;

alter table "public"."transactions" add column "related_entity_id" uuid;

alter table "public"."transactions" add column "related_entity_type" text;

alter table "public"."transactions" add column "status" text not null;

alter table "public"."transactions" add column "transaction_hash" text;

alter table "public"."transactions" add column "transaction_type" text not null;

alter table "public"."transactions" add column "updated_at" timestamp with time zone default now();

alter table "public"."transactions" alter column "amount" set data type numeric(36,18) using "amount"::numeric(36,18);

alter table "public"."transactions" enable row level security;

alter sequence "public"."blockchains_id_seq" owned by "public"."blockchains"."id";

alter sequence "public"."supported_currencies_id_seq" owned by "public"."supported_currencies"."id";

CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

CREATE UNIQUE INDEX blockchains_name_key ON public.blockchains USING btree (name);

CREATE UNIQUE INDEX blockchains_pkey ON public.blockchains USING btree (id);

CREATE UNIQUE INDEX crypto_wallets_pkey ON public.crypto_wallets USING btree (id);

CREATE UNIQUE INDEX crypto_wallets_user_id_crypto_code_key ON public.crypto_wallets USING btree (user_id, crypto_code);

CREATE UNIQUE INDEX fiat_accounts_pkey ON public.fiat_accounts USING btree (id);

CREATE UNIQUE INDEX fiat_accounts_user_id_currency_code_key ON public.fiat_accounts USING btree (user_id, currency_code);

CREATE INDEX idx_crypto_wallets_user_id ON public.crypto_wallets USING btree (user_id);

CREATE INDEX idx_fiat_accounts_user_id ON public.fiat_accounts USING btree (user_id);

CREATE INDEX idx_p2p_offers_status ON public.p2p_offers USING btree (status);

CREATE INDEX idx_p2p_offers_user_id ON public.p2p_offers USING btree (user_id);

CREATE INDEX idx_p2p_trades_buyer_id ON public.p2p_trades USING btree (buyer_id);

CREATE INDEX idx_p2p_trades_seller_id ON public.p2p_trades USING btree (seller_id);

CREATE INDEX idx_payment_methods_user_id ON public.payment_methods USING btree (user_id);

CREATE INDEX idx_transactions_status ON public.transactions USING btree (status);

CREATE INDEX idx_transactions_user_id ON public.transactions USING btree (user_id);

CREATE UNIQUE INDEX p2p_offers_pkey ON public.p2p_offers USING btree (id);

CREATE UNIQUE INDEX p2p_trades_pkey ON public.p2p_trades USING btree (id);

CREATE UNIQUE INDEX payment_methods_pkey ON public.payment_methods USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX supported_currencies_code_key ON public.supported_currencies USING btree (code);

CREATE UNIQUE INDEX supported_currencies_pkey ON public.supported_currencies USING btree (id);

alter table "public"."audit_logs" add constraint "audit_logs_pkey" PRIMARY KEY using index "audit_logs_pkey";

alter table "public"."blockchains" add constraint "blockchains_pkey" PRIMARY KEY using index "blockchains_pkey";

alter table "public"."crypto_wallets" add constraint "crypto_wallets_pkey" PRIMARY KEY using index "crypto_wallets_pkey";

alter table "public"."fiat_accounts" add constraint "fiat_accounts_pkey" PRIMARY KEY using index "fiat_accounts_pkey";

alter table "public"."p2p_offers" add constraint "p2p_offers_pkey" PRIMARY KEY using index "p2p_offers_pkey";

alter table "public"."p2p_trades" add constraint "p2p_trades_pkey" PRIMARY KEY using index "p2p_trades_pkey";

alter table "public"."payment_methods" add constraint "payment_methods_pkey" PRIMARY KEY using index "payment_methods_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."supported_currencies" add constraint "supported_currencies_pkey" PRIMARY KEY using index "supported_currencies_pkey";

alter table "public"."audit_logs" add constraint "audit_logs_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES auth.users(id) not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_changed_by_fkey";

alter table "public"."audit_logs" add constraint "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text]))) not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_operation_check";

alter table "public"."blockchains" add constraint "blockchains_name_key" UNIQUE using index "blockchains_name_key";

alter table "public"."blockchains" add constraint "blockchains_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."blockchains" validate constraint "blockchains_updated_by_fkey";

alter table "public"."crypto_wallets" add constraint "address_valid" CHECK (((address IS NULL) OR (length(address) > 20))) not valid;

alter table "public"."crypto_wallets" validate constraint "address_valid";

alter table "public"."crypto_wallets" add constraint "crypto_wallets_balance_check" CHECK ((balance >= (0)::numeric)) not valid;

alter table "public"."crypto_wallets" validate constraint "crypto_wallets_balance_check";

alter table "public"."crypto_wallets" add constraint "crypto_wallets_blockchain_fkey" FOREIGN KEY (blockchain) REFERENCES blockchains(name) not valid;

alter table "public"."crypto_wallets" validate constraint "crypto_wallets_blockchain_fkey";

alter table "public"."crypto_wallets" add constraint "crypto_wallets_crypto_code_fkey" FOREIGN KEY (crypto_code) REFERENCES supported_currencies(code) not valid;

alter table "public"."crypto_wallets" validate constraint "crypto_wallets_crypto_code_fkey";

alter table "public"."crypto_wallets" add constraint "crypto_wallets_user_id_crypto_code_key" UNIQUE using index "crypto_wallets_user_id_crypto_code_key";

alter table "public"."crypto_wallets" add constraint "crypto_wallets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."crypto_wallets" validate constraint "crypto_wallets_user_id_fkey";

alter table "public"."fiat_accounts" add constraint "fiat_accounts_available_balance_check" CHECK ((available_balance >= (0)::numeric)) not valid;

alter table "public"."fiat_accounts" validate constraint "fiat_accounts_available_balance_check";

alter table "public"."fiat_accounts" add constraint "fiat_accounts_balance_check" CHECK ((balance >= (0)::numeric)) not valid;

alter table "public"."fiat_accounts" validate constraint "fiat_accounts_balance_check";

alter table "public"."fiat_accounts" add constraint "fiat_accounts_currency_code_fkey" FOREIGN KEY (currency_code) REFERENCES supported_currencies(code) not valid;

alter table "public"."fiat_accounts" validate constraint "fiat_accounts_currency_code_fkey";

alter table "public"."fiat_accounts" add constraint "fiat_accounts_user_id_currency_code_key" UNIQUE using index "fiat_accounts_user_id_currency_code_key";

alter table "public"."fiat_accounts" add constraint "fiat_accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."fiat_accounts" validate constraint "fiat_accounts_user_id_fkey";

alter table "public"."p2p_offers" add constraint "p2p_offers_available_amount_check" CHECK ((available_amount >= (0)::numeric)) not valid;

alter table "public"."p2p_offers" validate constraint "p2p_offers_available_amount_check";

alter table "public"."p2p_offers" add constraint "p2p_offers_check" CHECK ((max_amount >= min_amount)) not valid;

alter table "public"."p2p_offers" validate constraint "p2p_offers_check";

alter table "public"."p2p_offers" add constraint "p2p_offers_crypto_currency_fkey" FOREIGN KEY (crypto_currency) REFERENCES supported_currencies(code) not valid;

alter table "public"."p2p_offers" validate constraint "p2p_offers_crypto_currency_fkey";

alter table "public"."p2p_offers" add constraint "p2p_offers_fiat_currency_fkey" FOREIGN KEY (fiat_currency) REFERENCES supported_currencies(code) not valid;

alter table "public"."p2p_offers" validate constraint "p2p_offers_fiat_currency_fkey";

alter table "public"."p2p_offers" add constraint "p2p_offers_min_amount_check" CHECK ((min_amount > (0)::numeric)) not valid;

alter table "public"."p2p_offers" validate constraint "p2p_offers_min_amount_check";

alter table "public"."p2p_offers" add constraint "p2p_offers_offer_type_check" CHECK ((offer_type = ANY (ARRAY['buy'::text, 'sell'::text]))) not valid;

alter table "public"."p2p_offers" validate constraint "p2p_offers_offer_type_check";

alter table "public"."p2p_offers" add constraint "p2p_offers_price_check" CHECK ((price > (0)::numeric)) not valid;

alter table "public"."p2p_offers" validate constraint "p2p_offers_price_check";

alter table "public"."p2p_offers" add constraint "p2p_offers_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."p2p_offers" validate constraint "p2p_offers_status_check";

alter table "public"."p2p_offers" add constraint "p2p_offers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."p2p_offers" validate constraint "p2p_offers_user_id_fkey";

alter table "public"."p2p_trades" add constraint "p2p_trades_amount_check" CHECK ((amount > (0)::numeric)) not valid;

alter table "public"."p2p_trades" validate constraint "p2p_trades_amount_check";

alter table "public"."p2p_trades" add constraint "p2p_trades_buyer_id_fkey" FOREIGN KEY (buyer_id) REFERENCES auth.users(id) not valid;

alter table "public"."p2p_trades" validate constraint "p2p_trades_buyer_id_fkey";

alter table "public"."p2p_trades" add constraint "p2p_trades_crypto_currency_fkey" FOREIGN KEY (crypto_currency) REFERENCES supported_currencies(code) not valid;

alter table "public"."p2p_trades" validate constraint "p2p_trades_crypto_currency_fkey";

alter table "public"."p2p_trades" add constraint "p2p_trades_fiat_currency_fkey" FOREIGN KEY (fiat_currency) REFERENCES supported_currencies(code) not valid;

alter table "public"."p2p_trades" validate constraint "p2p_trades_fiat_currency_fkey";

alter table "public"."p2p_trades" add constraint "p2p_trades_offer_id_fkey" FOREIGN KEY (offer_id) REFERENCES p2p_offers(id) not valid;

alter table "public"."p2p_trades" validate constraint "p2p_trades_offer_id_fkey";

alter table "public"."p2p_trades" add constraint "p2p_trades_payment_method_id_fkey" FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) not valid;

alter table "public"."p2p_trades" validate constraint "p2p_trades_payment_method_id_fkey";

alter table "public"."p2p_trades" add constraint "p2p_trades_price_check" CHECK ((price > (0)::numeric)) not valid;

alter table "public"."p2p_trades" validate constraint "p2p_trades_price_check";

alter table "public"."p2p_trades" add constraint "p2p_trades_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES auth.users(id) not valid;

alter table "public"."p2p_trades" validate constraint "p2p_trades_seller_id_fkey";

alter table "public"."p2p_trades" add constraint "p2p_trades_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'completed'::text, 'cancelled'::text, 'disputed'::text]))) not valid;

alter table "public"."p2p_trades" validate constraint "p2p_trades_status_check";

alter table "public"."p2p_trades" add constraint "p2p_trades_total_amount_check" CHECK ((total_amount > (0)::numeric)) not valid;

alter table "public"."p2p_trades" validate constraint "p2p_trades_total_amount_check";

alter table "public"."payment_methods" add constraint "payment_methods_currency_code_fkey" FOREIGN KEY (currency_code) REFERENCES supported_currencies(code) not valid;

alter table "public"."payment_methods" validate constraint "payment_methods_currency_code_fkey";

alter table "public"."payment_methods" add constraint "payment_methods_method_type_check" CHECK ((method_type = ANY (ARRAY['bank_transfer'::text, 'credit_card'::text, 'paypal'::text, 'other'::text]))) not valid;

alter table "public"."payment_methods" validate constraint "payment_methods_method_type_check";

alter table "public"."payment_methods" add constraint "payment_methods_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."payment_methods" validate constraint "payment_methods_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_kyc_level_check" CHECK ((kyc_level = ANY (ARRAY['none'::text, 'basic'::text, 'standard'::text, 'advanced'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_kyc_level_check";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."supported_currencies" add constraint "supported_currencies_code_key" UNIQUE using index "supported_currencies_code_key";

alter table "public"."supported_currencies" add constraint "supported_currencies_currency_type_check" CHECK ((currency_type = ANY (ARRAY['fiat'::text, 'crypto'::text]))) not valid;

alter table "public"."supported_currencies" validate constraint "supported_currencies_currency_type_check";

alter table "public"."transactions" add constraint "transactions_blockchain_fkey" FOREIGN KEY (blockchain) REFERENCES blockchains(name) not valid;

alter table "public"."transactions" validate constraint "transactions_blockchain_fkey";

alter table "public"."transactions" add constraint "transactions_currency_code_fkey" FOREIGN KEY (currency_code) REFERENCES supported_currencies(code) not valid;

alter table "public"."transactions" validate constraint "transactions_currency_code_fkey";

alter table "public"."transactions" add constraint "transactions_related_entity_type_check" CHECK ((related_entity_type = ANY (ARRAY['p2p_trade'::text, 'deposit'::text, 'withdrawal'::text, 'transfer'::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_related_entity_type_check";

alter table "public"."transactions" add constraint "transactions_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'cancelled'::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_status_check";

alter table "public"."transactions" add constraint "transactions_transaction_type_check" CHECK ((transaction_type = ANY (ARRAY['deposit'::text, 'withdrawal'::text, 'transfer'::text, 'p2p_trade'::text, 'fee'::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_transaction_type_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.audit_log_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.audit_logs (table_name, record_id, operation, old_data, changed_by)
  VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
  RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.audit_log_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.audit_logs (table_name, record_id, operation, new_data, changed_by)
  VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.audit_log_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.audit_logs (table_name, record_id, operation, old_data, new_data, changed_by)
  VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_crypto_currency()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM supported_currencies 
    WHERE code = NEW.crypto_code AND currency_type = 'crypto'
  ) THEN
    RAISE EXCEPTION 'The currency code % must be a crypto currency', NEW.crypto_code;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_fiat_currency()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM supported_currencies 
    WHERE code = NEW.currency_code AND currency_type = 'fiat'
  ) THEN
    RAISE EXCEPTION 'The currency code % must be a fiat currency', NEW.currency_code;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_p2p_currencies()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  crypto_type TEXT;
  fiat_type TEXT;
BEGIN
  SELECT currency_type INTO crypto_type FROM supported_currencies WHERE code = NEW.crypto_currency;
  SELECT currency_type INTO fiat_type FROM supported_currencies WHERE code = NEW.fiat_currency;
  
  IF crypto_type != 'crypto' THEN
    RAISE EXCEPTION 'The currency code % must be a crypto currency', NEW.crypto_currency;
  END IF;
  
  IF fiat_type != 'fiat' THEN
    RAISE EXCEPTION 'The currency code % must be a fiat currency', NEW.fiat_currency;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, CONCAT('user_', SUBSTRING(new.id::text, 1, 8)));
  RETURN new;
END;
$function$
;

grant delete on table "public"."audit_logs" to "anon";

grant insert on table "public"."audit_logs" to "anon";

grant references on table "public"."audit_logs" to "anon";

grant select on table "public"."audit_logs" to "anon";

grant trigger on table "public"."audit_logs" to "anon";

grant truncate on table "public"."audit_logs" to "anon";

grant update on table "public"."audit_logs" to "anon";

grant delete on table "public"."audit_logs" to "authenticated";

grant insert on table "public"."audit_logs" to "authenticated";

grant references on table "public"."audit_logs" to "authenticated";

grant select on table "public"."audit_logs" to "authenticated";

grant trigger on table "public"."audit_logs" to "authenticated";

grant truncate on table "public"."audit_logs" to "authenticated";

grant update on table "public"."audit_logs" to "authenticated";

grant delete on table "public"."audit_logs" to "service_role";

grant insert on table "public"."audit_logs" to "service_role";

grant references on table "public"."audit_logs" to "service_role";

grant select on table "public"."audit_logs" to "service_role";

grant trigger on table "public"."audit_logs" to "service_role";

grant truncate on table "public"."audit_logs" to "service_role";

grant update on table "public"."audit_logs" to "service_role";

grant delete on table "public"."blockchains" to "anon";

grant insert on table "public"."blockchains" to "anon";

grant references on table "public"."blockchains" to "anon";

grant select on table "public"."blockchains" to "anon";

grant trigger on table "public"."blockchains" to "anon";

grant truncate on table "public"."blockchains" to "anon";

grant update on table "public"."blockchains" to "anon";

grant delete on table "public"."blockchains" to "authenticated";

grant insert on table "public"."blockchains" to "authenticated";

grant references on table "public"."blockchains" to "authenticated";

grant select on table "public"."blockchains" to "authenticated";

grant trigger on table "public"."blockchains" to "authenticated";

grant truncate on table "public"."blockchains" to "authenticated";

grant update on table "public"."blockchains" to "authenticated";

grant delete on table "public"."blockchains" to "service_role";

grant insert on table "public"."blockchains" to "service_role";

grant references on table "public"."blockchains" to "service_role";

grant select on table "public"."blockchains" to "service_role";

grant trigger on table "public"."blockchains" to "service_role";

grant truncate on table "public"."blockchains" to "service_role";

grant update on table "public"."blockchains" to "service_role";

grant delete on table "public"."crypto_wallets" to "anon";

grant insert on table "public"."crypto_wallets" to "anon";

grant references on table "public"."crypto_wallets" to "anon";

grant select on table "public"."crypto_wallets" to "anon";

grant trigger on table "public"."crypto_wallets" to "anon";

grant truncate on table "public"."crypto_wallets" to "anon";

grant update on table "public"."crypto_wallets" to "anon";

grant delete on table "public"."crypto_wallets" to "authenticated";

grant insert on table "public"."crypto_wallets" to "authenticated";

grant references on table "public"."crypto_wallets" to "authenticated";

grant select on table "public"."crypto_wallets" to "authenticated";

grant trigger on table "public"."crypto_wallets" to "authenticated";

grant truncate on table "public"."crypto_wallets" to "authenticated";

grant update on table "public"."crypto_wallets" to "authenticated";

grant delete on table "public"."crypto_wallets" to "service_role";

grant insert on table "public"."crypto_wallets" to "service_role";

grant references on table "public"."crypto_wallets" to "service_role";

grant select on table "public"."crypto_wallets" to "service_role";

grant trigger on table "public"."crypto_wallets" to "service_role";

grant truncate on table "public"."crypto_wallets" to "service_role";

grant update on table "public"."crypto_wallets" to "service_role";

grant delete on table "public"."fiat_accounts" to "anon";

grant insert on table "public"."fiat_accounts" to "anon";

grant references on table "public"."fiat_accounts" to "anon";

grant select on table "public"."fiat_accounts" to "anon";

grant trigger on table "public"."fiat_accounts" to "anon";

grant truncate on table "public"."fiat_accounts" to "anon";

grant update on table "public"."fiat_accounts" to "anon";

grant delete on table "public"."fiat_accounts" to "authenticated";

grant insert on table "public"."fiat_accounts" to "authenticated";

grant references on table "public"."fiat_accounts" to "authenticated";

grant select on table "public"."fiat_accounts" to "authenticated";

grant trigger on table "public"."fiat_accounts" to "authenticated";

grant truncate on table "public"."fiat_accounts" to "authenticated";

grant update on table "public"."fiat_accounts" to "authenticated";

grant delete on table "public"."fiat_accounts" to "service_role";

grant insert on table "public"."fiat_accounts" to "service_role";

grant references on table "public"."fiat_accounts" to "service_role";

grant select on table "public"."fiat_accounts" to "service_role";

grant trigger on table "public"."fiat_accounts" to "service_role";

grant truncate on table "public"."fiat_accounts" to "service_role";

grant update on table "public"."fiat_accounts" to "service_role";

grant delete on table "public"."p2p_offers" to "anon";

grant insert on table "public"."p2p_offers" to "anon";

grant references on table "public"."p2p_offers" to "anon";

grant select on table "public"."p2p_offers" to "anon";

grant trigger on table "public"."p2p_offers" to "anon";

grant truncate on table "public"."p2p_offers" to "anon";

grant update on table "public"."p2p_offers" to "anon";

grant delete on table "public"."p2p_offers" to "authenticated";

grant insert on table "public"."p2p_offers" to "authenticated";

grant references on table "public"."p2p_offers" to "authenticated";

grant select on table "public"."p2p_offers" to "authenticated";

grant trigger on table "public"."p2p_offers" to "authenticated";

grant truncate on table "public"."p2p_offers" to "authenticated";

grant update on table "public"."p2p_offers" to "authenticated";

grant delete on table "public"."p2p_offers" to "service_role";

grant insert on table "public"."p2p_offers" to "service_role";

grant references on table "public"."p2p_offers" to "service_role";

grant select on table "public"."p2p_offers" to "service_role";

grant trigger on table "public"."p2p_offers" to "service_role";

grant truncate on table "public"."p2p_offers" to "service_role";

grant update on table "public"."p2p_offers" to "service_role";

grant delete on table "public"."p2p_trades" to "anon";

grant insert on table "public"."p2p_trades" to "anon";

grant references on table "public"."p2p_trades" to "anon";

grant select on table "public"."p2p_trades" to "anon";

grant trigger on table "public"."p2p_trades" to "anon";

grant truncate on table "public"."p2p_trades" to "anon";

grant update on table "public"."p2p_trades" to "anon";

grant delete on table "public"."p2p_trades" to "authenticated";

grant insert on table "public"."p2p_trades" to "authenticated";

grant references on table "public"."p2p_trades" to "authenticated";

grant select on table "public"."p2p_trades" to "authenticated";

grant trigger on table "public"."p2p_trades" to "authenticated";

grant truncate on table "public"."p2p_trades" to "authenticated";

grant update on table "public"."p2p_trades" to "authenticated";

grant delete on table "public"."p2p_trades" to "service_role";

grant insert on table "public"."p2p_trades" to "service_role";

grant references on table "public"."p2p_trades" to "service_role";

grant select on table "public"."p2p_trades" to "service_role";

grant trigger on table "public"."p2p_trades" to "service_role";

grant truncate on table "public"."p2p_trades" to "service_role";

grant update on table "public"."p2p_trades" to "service_role";

grant delete on table "public"."payment_methods" to "anon";

grant insert on table "public"."payment_methods" to "anon";

grant references on table "public"."payment_methods" to "anon";

grant select on table "public"."payment_methods" to "anon";

grant trigger on table "public"."payment_methods" to "anon";

grant truncate on table "public"."payment_methods" to "anon";

grant update on table "public"."payment_methods" to "anon";

grant delete on table "public"."payment_methods" to "authenticated";

grant insert on table "public"."payment_methods" to "authenticated";

grant references on table "public"."payment_methods" to "authenticated";

grant select on table "public"."payment_methods" to "authenticated";

grant trigger on table "public"."payment_methods" to "authenticated";

grant truncate on table "public"."payment_methods" to "authenticated";

grant update on table "public"."payment_methods" to "authenticated";

grant delete on table "public"."payment_methods" to "service_role";

grant insert on table "public"."payment_methods" to "service_role";

grant references on table "public"."payment_methods" to "service_role";

grant select on table "public"."payment_methods" to "service_role";

grant trigger on table "public"."payment_methods" to "service_role";

grant truncate on table "public"."payment_methods" to "service_role";

grant update on table "public"."payment_methods" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."supported_currencies" to "anon";

grant insert on table "public"."supported_currencies" to "anon";

grant references on table "public"."supported_currencies" to "anon";

grant select on table "public"."supported_currencies" to "anon";

grant trigger on table "public"."supported_currencies" to "anon";

grant truncate on table "public"."supported_currencies" to "anon";

grant update on table "public"."supported_currencies" to "anon";

grant delete on table "public"."supported_currencies" to "authenticated";

grant insert on table "public"."supported_currencies" to "authenticated";

grant references on table "public"."supported_currencies" to "authenticated";

grant select on table "public"."supported_currencies" to "authenticated";

grant trigger on table "public"."supported_currencies" to "authenticated";

grant truncate on table "public"."supported_currencies" to "authenticated";

grant update on table "public"."supported_currencies" to "authenticated";

grant delete on table "public"."supported_currencies" to "service_role";

grant insert on table "public"."supported_currencies" to "service_role";

grant references on table "public"."supported_currencies" to "service_role";

grant select on table "public"."supported_currencies" to "service_role";

grant trigger on table "public"."supported_currencies" to "service_role";

grant truncate on table "public"."supported_currencies" to "service_role";

grant update on table "public"."supported_currencies" to "service_role";

create policy "Admins can view all audit logs"
on "public"."audit_logs"
as permissive
for select
to public
using (false);


create policy "Users can insert their own crypto wallets"
on "public"."crypto_wallets"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can view their own crypto wallets"
on "public"."crypto_wallets"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own fiat accounts"
on "public"."fiat_accounts"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can view their own fiat accounts"
on "public"."fiat_accounts"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can delete their own p2p offers"
on "public"."p2p_offers"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own p2p offers"
on "public"."p2p_offers"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own p2p offers"
on "public"."p2p_offers"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view all active p2p offers"
on "public"."p2p_offers"
as permissive
for select
to public
using ((status = 'active'::text));


create policy "Users can view their own p2p offers regardless of status"
on "public"."p2p_offers"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Buyers can insert p2p trades"
on "public"."p2p_trades"
as permissive
for insert
to public
with check ((auth.uid() = buyer_id));


create policy "Users can update p2p trades they are part of"
on "public"."p2p_trades"
as permissive
for update
to public
using (((auth.uid() = buyer_id) OR (auth.uid() = seller_id)));


create policy "Users can view p2p trades they are part of"
on "public"."p2p_trades"
as permissive
for select
to public
using (((auth.uid() = buyer_id) OR (auth.uid() = seller_id)));


create policy "Users can delete their own payment methods"
on "public"."payment_methods"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own payment methods"
on "public"."payment_methods"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own payment methods"
on "public"."payment_methods"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own payment methods"
on "public"."payment_methods"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own profile"
on "public"."profiles"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "Users can update their own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view their own profile"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "System can insert transactions"
on "public"."transactions"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can view their own transactions"
on "public"."transactions"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER crypto_wallets_audit_delete AFTER DELETE ON public.crypto_wallets FOR EACH ROW EXECUTE FUNCTION audit_log_delete();

CREATE TRIGGER crypto_wallets_audit_insert AFTER INSERT ON public.crypto_wallets FOR EACH ROW EXECUTE FUNCTION audit_log_insert();

CREATE TRIGGER crypto_wallets_audit_update AFTER UPDATE ON public.crypto_wallets FOR EACH ROW EXECUTE FUNCTION audit_log_update();

CREATE TRIGGER validate_crypto_wallet_currency BEFORE INSERT OR UPDATE ON public.crypto_wallets FOR EACH ROW EXECUTE FUNCTION check_crypto_currency();

CREATE TRIGGER fiat_accounts_audit_delete AFTER DELETE ON public.fiat_accounts FOR EACH ROW EXECUTE FUNCTION audit_log_delete();

CREATE TRIGGER fiat_accounts_audit_insert AFTER INSERT ON public.fiat_accounts FOR EACH ROW EXECUTE FUNCTION audit_log_insert();

CREATE TRIGGER fiat_accounts_audit_update AFTER UPDATE ON public.fiat_accounts FOR EACH ROW EXECUTE FUNCTION audit_log_update();

CREATE TRIGGER validate_fiat_account_currency BEFORE INSERT OR UPDATE ON public.fiat_accounts FOR EACH ROW EXECUTE FUNCTION check_fiat_currency();

CREATE TRIGGER validate_p2p_offer_currencies BEFORE INSERT OR UPDATE ON public.p2p_offers FOR EACH ROW EXECUTE FUNCTION check_p2p_currencies();

CREATE TRIGGER validate_p2p_trade_currencies BEFORE INSERT OR UPDATE ON public.p2p_trades FOR EACH ROW EXECUTE FUNCTION check_p2p_currencies();

CREATE TRIGGER validate_payment_method_currency BEFORE INSERT OR UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION check_fiat_currency();

CREATE TRIGGER transactions_audit_insert AFTER INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION audit_log_insert();

CREATE TRIGGER transactions_audit_update AFTER UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION audit_log_update();


