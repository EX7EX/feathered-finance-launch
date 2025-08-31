# Deployment and Testing Guide (Base Goerli)

This guide provides step-by-step instructions to deploy, configure, and test the full application stack on the Base Goerli testnet.

## 1. Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en) (v18 or higher)
- [bun](https://bun.sh/)
- A web3 wallet like [MetaMask](https://metamask.io/)

You should also have the project dependencies installed by running `bun install` in the root directory.

## 2. Getting Testnet Funds

You will need Base Goerli ETH to deploy the smart contract and to act as the operator for the matching engine.

- **Get Goerli ETH:** You can use a public faucet like [goerlifaucet.com](https://goerlifaucet.com/) to get ETH on the Goerli test network.
- **Bridge to Base Goerli:** Use the official [Base Bridge](https://bridge.base.org/) to transfer your Goerli ETH to Base Goerli.

## 3. Deploying the Smart Contract

We will use Hardhat to compile and deploy the `OrderBook.sol` contract.

**A. Set up your Deployer Wallet:**
   - Open the `.env` file at the root of the project (create it from `.env.example` if it doesn't exist).
   - Add the following line, replacing `YOUR_PRIVATE_KEY` with the private key of the wallet you funded with Base Goerli ETH. **WARNING: Be careful with your private keys.**
     ```
     DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY
     ```
   - Also, ensure your Base Goerli RPC URL is set. You can get one from Infura, Alchemy, or use the public one.
     ```
     BASE_GOERLI_RPC_URL=https://goerli.base.org
     ```

**B. Run the Deployment Script:**
   - Open your terminal and run the following command from the project root:
     ```bash
     npx hardhat run scripts/deploy.ts --network baseGoerli
     ```
   - The script will compile the contract and deploy it. On success, it will print the address of the newly deployed contract.

## 4. Configuring the Environment

**A. Update Frontend Environment:**
   - Copy the deployed contract address from the terminal output.
   - Open the `.env` file again and set the following variable:
     ```
     VITE_ORDER_BOOK_ADDRESS=THE_DEPLOYED_CONTRACT_ADDRESS
     ```
   - You will also need a Pimlico API key for the Paymaster service. Get one from the [Pimlico Dashboard](https://dashboard.pimlico.io/) and add it to your `.env` file:
     ```
     VITE_PIMLICO_API_KEY=YOUR_PIMLICO_API_KEY
     ```

**B. Update Matching Engine Environment:**
   - The matching engine needs its own operator wallet to pay for gas when settling trades. For testing, you can use the same wallet as the deployer or a different one.
   - Add the private key for this wallet to your `.env` file:
     ```
     OPERATOR_PRIVATE_KEY=YOUR_ENGINE_OPERATOR_PRIVATE_KEY
     ```
   - **Important:** The deployer wallet is the initial `operator` of the smart contract. If you use a different wallet for the matching engine, you will need to transfer ownership by calling the `setOperator` function on the `OrderBook` contract.

## 5. Running the Full Application

You will need to run two processes in separate terminals.

**A. Run the Frontend:**
   - In your first terminal, from the project root, run:
     ```bash
     bun run dev
     ```
   - This will start the React application, usually on `http://localhost:5173`.

**B. Run the Matching Engine:**
   - In your second terminal, navigate to the service directory and start the engine:
     ```bash
     cd services/matching-engine
     bun run start
     ```
   - You should see logs indicating that the engine has started and is polling for orders.

## 6. End-to-End Testing Checklist

With both the frontend and matching engine running, use two different browser profiles or wallets to test the full trading loop.

- [ ] **Place an Order:**
  - [ ] Use Wallet A to connect to the app.
  - [ ] Navigate to the Exchange page.
  - [ ] Place a "Buy" order for one of the token pairs.
  - [ ] The transaction should be sponsored (gasless).
  - [ ] The new order should appear in the "Order History" section for Wallet A with "open" status.
  - [ ] The new order should appear in the main "Order Book".

- [ ] **Place a Matching Order:**
  - [ ] Use Wallet B to connect to the app in a different browser.
  - [ ] Navigate to the Exchange page.
  - [ ] Place a "Sell" order that exactly matches the price and amount of the "Buy" order from Wallet A.
  - [ ] This transaction should also be gasless.

- [ ] **Verify Matching and Settlement:**
  - [ ] In the matching engine terminal, you should see logs indicating a "MATCH FOUND".
  - [ ] Shortly after, a "Submitting settlement transaction" log should appear, followed by "Settlement successful".
  - [ ] In the app, the Order Book should update, and the two matched orders should disappear from it.
  - [ ] In the "Order History" for both Wallet A and Wallet B, the status of their respective orders should change from "open" to "filled".

- [ ] **Verify Profile Stats:**
  - [ ] Navigate to the "Profile" page for both Wallet A and Wallet B.
  - [ ] Verify that the `Total Trades` and `Total Volume` stats have been updated correctly. (Note: This feature is planned but the logic to update stats post-trade is not yet implemented).

- [ ] **Verify Order Cancellation:**
  - [ ] Place a new, non-matching order with Wallet A.
  - [ ] In the "Order History", click the "Cancel" button.
  - [ ] The cancellation transaction should be gasless.
  - [ ] The order's status should change to "canceled".

Congratulations! You have successfully deployed and tested the decentralized exchange.
