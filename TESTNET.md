# SimplMonie — Base Sepolia Testnet Guide

This is the public-beta playbook for our DEX on Base Sepolia (chainId **84532**).
No real funds are at risk — everything here uses test tokens.

---

## For users

### 1. Add Base Sepolia to your wallet
The app prompts you automatically. If your wallet doesn't add it for you,
use these settings:

- **Network name:** Base Sepolia
- **RPC URL:** https://sepolia.base.org
- **Chain ID:** 84532
- **Currency symbol:** ETH
- **Block explorer:** https://sepolia.basescan.org

### 2. Get free Base Sepolia ETH for gas
You only need a tiny amount (< 0.001 ETH) to place orders.

- https://www.alchemy.com/faucets/base-sepolia
- https://portal.cdp.coinbase.com/products/faucet

### 3. Mint test trading tokens
On the Exchange page, the **Testnet Faucet** card mints `tWBTC` and `tUSDC`
to your wallet in one click. Default amounts: 1 tWBTC and 50,000 tUSDC.

### 4. Place an order
Buy or sell tWBTC priced in tUSDC. Two confirmations are needed:
1. **Approve** — lets the OrderBook contract pull your tokens.
2. **Place order** — creates the on-chain order.

Settlement is automatic when a matching counter-order arrives.

---

## For operators (deploy + run)

### Prerequisites
- Node 18+, `bun`, and a wallet funded with ~0.05 Base Sepolia ETH for the deployer.

### Build secrets (Workspace Settings → Build Secrets)
- `DEPLOYER_PRIVATE_KEY` — funded Base Sepolia wallet
- `BASE_SEPOLIA_RPC_URL` — Alchemy/Infura URL (the public RPC works but rate-limits)
- `OPERATOR_PRIVATE_KEY` — wallet that runs the matching engine (can be the same as deployer for now)

### Deploy
```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

The script deploys `OrderBook`, `tWBTC`, and `tUSDC`, then writes addresses to
`deployed-addresses.json`. Copy them into your `.env`:

```
VITE_ORDER_BOOK_ADDRESS=0x...
VITE_TEST_WBTC_ADDRESS=0x...
VITE_TEST_USDC_ADDRESS=0x...
```

### Verify on Basescan
```bash
npx hardhat verify --network baseSepolia <ORDER_BOOK_ADDRESS>
npx hardhat verify --network baseSepolia <WBTC_ADDRESS> "Test Wrapped Bitcoin" "tWBTC" 8 10000000000
npx hardhat verify --network baseSepolia <USDC_ADDRESS> "Test USD Coin" "tUSDC" 6 1000000000000
```

### Hand off operator to the matching engine
If you used a different wallet for the matching engine, transfer operator rights:
```js
await orderBook.setOperator("0xYourOperatorWallet");
```

### Run the matching engine
```bash
cd services/matching-engine
bun run start
```
It polls every 15s, finds exact-match buy/sell pairs, and submits `executeTrade`.

---

## Out of scope for testnet
- Gasless txs (Pimlico paymaster) — coming pre-mainnet.
- External smart-contract audit — scheduled before mainnet.
- Real KYC, fiat on-ramp, advanced order types.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Wrong network" banner | Wallet not on Base Sepolia | Click **Switch network** in the banner |
| Faucet button says "address not configured" | Test token addresses missing in env | Run the deploy script and add VITE_TEST_*_ADDRESS to env |
| Order placement reverts on `safeTransferFrom` | Approval not given | The UI sends `approve` first; if you canceled it, retry |
| Matching engine logs "address not set" | Missing env vars | Set `OPERATOR_PRIVATE_KEY`, `VITE_ORDER_BOOK_ADDRESS`, `VITE_TEST_*_ADDRESS` |