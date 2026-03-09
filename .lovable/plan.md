

# Next Steps for Feathered Finance

All P0-P2 items from the production readiness plan are complete. Here's what to tackle next, ordered by impact:

## 1. Seed Supported Currencies
The `supported_currencies` table is empty. The Dashboard's asset views depend on this data. Seed it with BTC, ETH, SOL, ADA and fiat currencies (USD, EUR, GBP) via a database migration.

## 2. CoinGecko Price Caching Edge Function
Direct browser-to-CoinGecko calls hit rate limits fast. Create a backend function that:
- Fetches prices from CoinGecko server-side
- Caches results in a `price_cache` table (or in-memory with 60s TTL)
- Frontend calls the edge function instead of CoinGecko directly

## 3. Connect Game Scores to Database
The Game page currently stores scores in React state only. Wire it up to the `game_scores` table we already created so scores persist and feed the Leaderboard.

## 4. Auth Flow Polish
- Update the e2e tests (`tests/e2e/auth.spec.ts`) to match the current SignIn page selectors (tests use `getByPlaceholderText('you@example.com')` but the actual form may differ)
- Add a "forgot password" flow if not present

## 5. Design Token Cleanup
Replace hardcoded color classes (`bg-gray-800/50`, `text-gray-400`, `border-gray-700/50`) with Tailwind design tokens from the theme so the app supports theming consistently.

---

## Implementation Order

| Task | Effort |
|---|---|
| Seed supported currencies | 5 min |
| CoinGecko caching edge function | 20 min |
| Connect game scores to DB | 15 min |
| Fix e2e test selectors | 10 min |
| Design token cleanup | 30 min |

I recommend starting with the currency seeding + CoinGecko caching since those directly fix broken UI on the Dashboard and Exchange pages.

