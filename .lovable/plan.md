## Testnet Launch Plan — SimplMonie on Base Sepolia

If this were my business, "going to testnet" isn't a deploy script — it's a **public beta**. The goal is to prove the product works end-to-end with real users, gather telemetry, and exit testnet with confidence (and a waitlist) for mainnet. Below is the plan I'd actually run.

---

### Strategic framing

Three outcomes we must hit before declaring testnet a success:
1. **Technical proof** — a stranger can connect a wallet, get test funds, place an order, and have it settle without us holding their hand.
2. **Behavioral proof** — we can see what they did (analytics, error rates, drop-off) and fix what breaks.
3. **Narrative proof** — we have screenshots, a public leaderboard, and a story that makes mainnet launch feel inevitable.

Anything that doesn't serve those three is deferred.

---

### Phase A — Contract & Infra Hardening (day 1–2)

**A1. Contracts**
- Deploy `OrderBook.sol` to **Base Sepolia** (chainId 84532). Goerli is dead; the existing `DEPLOY_AND_TEST.md` is stale.
- Deploy two test ERC20s with **open `mint(to, amount)`** — `tWBTC`, `tUSDC` — so onboarding doesn't depend on third-party faucets for tokens (only ETH for gas).
- Verify all three contracts on **Basescan Sepolia** so users can inspect them. Trust is the entire pitch vs. Binance/Bybit.
- Run `slither` / `solhint` on `OrderBook.sol` once before deploy; fix any high-severity findings. Document accepted risks.
- Transfer `operator` role to a dedicated matching-engine wallet (not the deployer).

**A2. Secrets & config**
- Build secrets the user must add in Workspace Settings: `DEPLOYER_PRIVATE_KEY`, `BASE_SEPOLIA_RPC_URL` (Alchemy preferred — public RPC will rate-limit under load), `OPERATOR_PRIVATE_KEY`.
- Runtime secrets (Lovable Cloud) for the matching engine if we host it as an edge function: same operator key + RPC.

**A3. Matching engine hosting**
- Today it lives in `services/matching-engine` and assumes a long-running Node process. Two options:
  - **Option 1 (recommended for testnet):** convert it to a Supabase scheduled edge function that runs every 15s, reads open orders, finds matches, and submits settlement txs. No server to babysit.
  - **Option 2:** keep the Bun process and run it on a $5 Fly.io / Railway box. Faster to ship but ongoing ops cost.

---

### Phase B — Frontend Web3 Correctness (day 2–3)

**B1. Fix silent broken env reads**
- `src/integrations/web3/contracts.ts` uses `process.env.VITE_*` — Vite **does not expose this to the browser**, so addresses are always empty strings. Replace with `import.meta.env.VITE_*` and add typed entries to `src/vite-env.d.ts`.
- Hardcode deployed Base Sepolia addresses as fallbacks so the app works even before env is configured.

**B2. Network guard (currently missing)**
- In `Web3Provider`, detect `chainId !== 84532` and trigger `wallet_switchEthereumChain` / `wallet_addEthereumChain` automatically.
- Persistent banner: "You're on Base Sepolia testnet — no real funds at risk."
- Block order placement when on the wrong chain (today nothing stops a user from sending a tx to mainnet by accident).

**B3. ERC20 approve flow (currently missing — orders will silently fail)**
- Before `createOrder`, read `allowance(user, OrderBook)`. If insufficient, prompt `approve` first.
- Two-step toast UX: "Approving tWBTC…" → "Placing order…".

**B4. Real-time order book**
- Subscribe to `OrderCreated` / `OrderCancelled` / `OrderFilled` events via `provider.on(...)` so the book updates without a refetch button. Today `useOrderBook` only refetches on cancel.

---

### Phase C — Onboarding That Doesn't Suck (day 3–4)

This is where most testnet launches die. Plan for a user with a fresh wallet and zero context.

**C1. First-run wizard** (modal on first connect)
- Step 1: "Add Base Sepolia to your wallet" → one-click `wallet_addEthereumChain`.
- Step 2: "Get free ETH for gas" → deep link to Alchemy + Coinbase Sepolia faucets, with copy-address button.
- Step 3: "Mint test trading tokens" → calls `mint()` on tWBTC and tUSDC for the connected user (1 BTC, 50,000 USDC). One click, no friction.
- Step 4: "Place your first order" → highlight the buy form.

**C2. Persistent onboarding checklist** in the sidebar until all 4 steps are complete.

**C3. Empty states**
- Order book empty? "Be the first to make a market — place an order."
- Order history empty? Link back to the Exchange.

---

### Phase D — Observability & Trust (day 4)

If we can't see what users do, we can't fix what breaks.

- **Frontend telemetry:** add a `telemetry_events` table + tiny `track(event, props)` helper. Log: wallet connected, chain switch prompted, faucet clicked, mint clicked, approve started/succeeded/failed, order placed/failed, order cancelled, order filled.
- **Tx links everywhere:** every toast that fires a tx must include "View on Basescan ↗" with the actual hash.
- **Status page widget** in the footer: "Matching engine: ✓ Last run 12s ago" (queries a `matching_engine_heartbeat` table the engine writes to).
- **Sentry or simple error logging** to Lovable Cloud — `ErrorBoundary.tsx` already exists; pipe its catches into a `client_errors` table.

---

### Phase E — Growth Hooks (day 5)

This is the part most engineers skip and most founders regret skipping.

- **Public leaderboard** on testnet with PEBL points: trades placed, volume, game score. Already partially built — finish the wiring and make the page **shareable without auth** (route at `/leaderboard` is public).
- **Referral codes** — each user gets a code; referrals earn bonus PEBL. Sets up the mainnet airdrop narrative.
- **Twitter/X share card** generated server-side per user: "I'm rank #34 on @SimplMonie testnet 🪶". OG-image edge function.
- **Waitlist for mainnet** CTA on every page: "Trading goes live on Base mainnet in Q3. Join the waitlist."

---

### Phase F — Documentation & Comms (day 5)

- Rewrite `DEPLOY_AND_TEST.md` → `TESTNET.md`: Base Sepolia, test token mint, faucet links, troubleshooting, contract addresses with Basescan links.
- Public-facing `/docs` page in the app (not just a markdown file in the repo) — same content, but for users.
- Launch checklist for the team:
  - [ ] Contracts deployed + verified on Basescan
  - [ ] Test tokens deployed with open mint
  - [ ] Frontend pointed at testnet addresses
  - [ ] Network guard + approve flow live
  - [ ] First-run wizard ships
  - [ ] Matching engine running (and monitored)
  - [ ] Telemetry events flowing into Cloud
  - [ ] Leaderboard public and populated
  - [ ] TESTNET.md and in-app /docs published
  - [ ] Announcement thread + 30-second demo video drafted

---

### What I am explicitly **not** doing in this phase

- Gasless txs / Pimlico paymaster — was ripped out earlier, revisit pre-mainnet.
- External smart-contract audit — too expensive for testnet; do it before mainnet with the bugs we'll find here.
- Real KYC, fiat on-ramp, advanced order types (stop, OCO) — mainnet concerns.
- Mobile app build via Capacitor — testnet is desktop-first.

---

### Clarifying questions before I implement

1. **Matching engine hosting** — supabase scheduled edge function (zero ops, ~15s latency) or keep the Bun process and you'll host it (~1s latency)?
2. **Test token approach** — deploy our own tWBTC/tUSDC with open mint (best UX, fastest), or use existing Base Sepolia tokens (more "realistic" but onboarding pain)?
3. **Scope of this build pass** — should I ship Phases A–D in the first implementation message and leave E (growth) + F (docs) for a follow-up, or do you want everything in one shot?
4. **Deployer wallet** — do you already have a Base Sepolia–funded private key ready to drop into build secrets, or should the first step of implementation be a clear setup walkthrough?
