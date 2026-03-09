

# Comprehensive Production Readiness Plan for Feathered Finance (SimplMonie)

## Current State Assessment

After a thorough codebase review, here is every issue that needs fixing, organized by severity.

---

## Phase 1: Critical Build & Runtime Fixes

These must be resolved first -- the app cannot run without them.

### 1.1 Fix tsconfig files (build errors)
The two build errors are in read-only system files (`tsconfig.json` and `tsconfig.node.json`). The workaround:
- Update `tsconfig.app.json` to be the sole build config with correct `paths` (use `"@/*": ["./src/*"]`) and proper project references
- Ensure `tsconfig.node.json` has `"noEmit": false` (it needs `composite: true` which requires emit)

### 1.2 Fix Supabase client env variable mismatch
`src/integrations/supabase/client.ts` reads `VITE_SUPABASE_KEY` but the auto-generated `.env` provides `VITE_SUPABASE_PUBLISHABLE_KEY`. This causes the app to crash on load. Fix the client to use the correct variable name.

### 1.3 Fix ethers v5 vs v6 API mismatch
The project installs `ethers@^6.15.0` but all code uses ethers v5 APIs (`ethers.providers.Web3Provider`, `ethers.utils.formatUnits`, `ethers.BigNumber`). These do not exist in v6. Fix all Web3 files:
- `src/integrations/web3/provider.tsx` -- use `ethers.BrowserProvider` instead of `ethers.providers.Web3Provider`
- `src/hooks/useOrderBook.tsx` -- use `ethers.formatUnits`, `BigInt` instead of `ethers.BigNumber`
- `src/integrations/web3/hooks.ts` -- update `ethers.utils.parseUnits` to `ethers.parseUnits`
- `src/pages/Exchange/ExchangePage.tsx` -- update provider usage

### 1.4 Fix ProfilePage AuthContext import
`ProfilePage.tsx` line 9 does `useContext(AuthContext)` but `AuthContext` is not exported as a value -- only `useAuth` is the public API. Also uses `useUserProfile(userId)` from a different hook than Dashboard's `useUserProfile()`. Standardize to one hook.

---

## Phase 2: Database & Security (Lovable Cloud)

### 2.1 Enable RLS on all tables
Currently NO tables have RLS enabled. This is a critical security gap -- any authenticated user can read/modify any other user's data.

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiat_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supported_currencies ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Crypto wallets: users can read their own
CREATE POLICY "Users can view own wallets" ON public.crypto_wallets FOR SELECT USING (auth.uid() = user_id);

-- Fiat accounts: users can read their own
CREATE POLICY "Users can view own fiat" ON public.fiat_accounts FOR SELECT USING (auth.uid() = user_id);

-- Supported currencies: public read
CREATE POLICY "Anyone can view currencies" ON public.supported_currencies FOR SELECT TO authenticated USING (true);

-- Leaderboard view: grant select to authenticated
GRANT SELECT ON public.leaderboard TO authenticated;
```

### 2.2 Auto-create profile on signup
Add a database trigger so a profile row is created when a user signs up:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2.3 Add game scores table
Game scores are currently only in React state. Persist them:

```sql
CREATE TABLE public.game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL,
  level integer NOT NULL,
  chickens_defeated integer DEFAULT 0,
  longest_combo integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own scores" ON public.game_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view all scores" ON public.game_scores FOR SELECT TO authenticated USING (true);
```

### 2.4 Add trade history table
For recording trades from the exchange:

```sql
CREATE TABLE public.trade_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pair text NOT NULL,
  side text CHECK (side IN ('buy', 'sell')) NOT NULL,
  price numeric NOT NULL,
  amount numeric NOT NULL,
  total numeric NOT NULL,
  tx_hash text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.trade_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own trades" ON public.trade_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trade_history FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## Phase 3: Smart Contract Fixes

### 3.1 Fix OrderBook.sol vulnerabilities
- Add `ReentrancyGuard` from OpenZeppelin
- Use `SafeERC20` for all token transfers (handles non-standard ERC20s)
- Fix the stale `orderBook` mapping -- it stores copies, not references, so `cancelOrder` and `executeTrade` only update `orders` mapping but the `orderBook` array stays stale
- Add order expiry timestamps
- Add events for better off-chain indexing

### 3.2 Update network configuration
- Replace deprecated Base Goerli with Base Sepolia in `hardhat.config.ts`
- Update RPC URLs and chain IDs

---

## Phase 4: Frontend Production Polish

### 4.1 Consolidate duplicate hooks
Two `useUserProfile` hooks exist:
- `src/hooks/use-user-profile.tsx` (used by Dashboard)
- `src/hooks/useUserProfile.tsx` (used by ProfilePage)

Merge into one consistent hook.

### 4.2 Add error boundaries
Wrap major route sections in React error boundaries so a crash in Exchange does not bring down the entire app.

### 4.3 Fix CoinGecko rate limiting
Direct browser calls to CoinGecko hit rate limits quickly. Create a backend function that caches prices and serves them to the frontend, or add proper caching with stale-while-revalidate.

### 4.4 Move QueryClient outside component
`App.tsx` creates a new `QueryClient` on every render. Move it outside the component to prevent cache loss.

### 4.5 Add 2FA profile field
The `profiles` table schema in the migration lacks `two_factor_enabled` but the `UserProfile` interface expects it. Add the column.

---

## Phase 5: Production Infrastructure

### 5.1 Seed supported currencies
The `supported_currencies` table is empty. Seed it with BTC, ETH, SOL, ADA, and USD/EUR/GBP so the Dashboard asset views actually work.

### 5.2 Add proper loading/empty states
Many pages silently fail when data is missing. Add explicit empty states and retry buttons.

### 5.3 Security hardening
- Remove `cleanupAuthState` localStorage clearing on every sign-in (aggressive, causes issues)
- Add CSRF protection headers
- Validate all form inputs with zod schemas (partially done)

---

## Implementation Order

```text
Priority  | Task                              | Effort
----------|-----------------------------------|--------
P0        | Fix Supabase client env var        | 5 min
P0        | Fix tsconfig build errors          | 10 min
P0        | Fix ethers v5->v6 API migration    | 30 min
P0        | Enable RLS on all tables           | 15 min
P0        | Add profile creation trigger       | 10 min
P1        | Consolidate useUserProfile hooks   | 15 min
P1        | Fix ProfilePage AuthContext usage  | 5 min
P1        | Move QueryClient outside component | 5 min
P1        | Add game_scores table              | 10 min
P1        | Add trade_history table            | 10 min
P1        | Seed supported_currencies          | 10 min
P1        | Add two_factor_enabled column      | 5 min
P2        | Fix OrderBook.sol vulnerabilities  | 45 min
P2        | Cache CoinGecko via edge function  | 30 min
P2        | Add error boundaries               | 15 min
P2        | Update to Base Sepolia             | 10 min
```

Total estimated: ~4 hours of implementation across multiple messages.

I recommend starting with P0 items (build fixes + security) in the first implementation pass, then P1 (data layer), then P2 (smart contracts + polish).

