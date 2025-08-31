import { ethers } from 'ethers';
import pino from 'pino';
import 'dotenv/config';

// Assuming the ABI is accessible. In a real monorepo, this would be imported
// from a shared package. For this scaffold, we'll redefine it.
const ORDER_BOOK_ABI = [
  "event OrderCreated(uint256 id, address owner, uint8 orderType, address tokenA, address tokenB, uint256 amountA, uint256 amountB)",
  "event OrderCancelled(uint256 id)",
  "event OrderFilled(uint256 id)",
  "constructor()",
  "function createOrder(uint8 orderType, address tokenA, address tokenB, uint256 amountA, uint256 amountB)",
  "function getOrders(address tokenA, address tokenB) view returns (tuple(uint256 id, address owner, uint8 orderType, address tokenA, address tokenB, uint256 amountA, uint256 amountB, bool isFilled, bool isCancelled)[])",
  "function cancelOrder(uint256 orderId)",
  "function executeTrade(uint256 buyOrderId, uint256 sellOrderId)",
  "function operator() view returns (address)",
  "function setOperator(address newOperator)"
];
const ORDER_BOOK_ADDRESS = process.env.VITE_ORDER_BOOK_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// --- Setup ---
const logger = pino();
const RPC_URL = process.env.BASE_GOERLI_RPC_URL || 'https://goerli.base.org';
const OPERATOR_PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY;

if (!OPERATOR_PRIVATE_KEY) {
  logger.error('OPERATOR_PRIVATE_KEY is not set in environment variables.');
  process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const operatorWallet = new ethers.Wallet(OPERATOR_PRIVATE_KEY, provider);
const orderBookContract = new ethers.Contract(ORDER_BOOK_ADDRESS, ORDER_BOOK_ABI, operatorWallet);

logger.info(`Matching engine starting. Operator address: ${operatorWallet.address}`);

// --- Core Logic ---

// A simple in-memory store to prevent re-processing of already matched orders in the same batch
const processedOrderIds = new Set<string>();

async function matchAndSettle() {
  logger.info('--- Running matching cycle ---');

  try {
    // 1. Fetch all orders for a specific pair.
    // In a real engine, this would iterate over many pairs.
    // We'll use the hardcoded BTC/USDT addresses from the frontend for this example.
    const tokenA = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
    const tokenB = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

    const allOrders = await orderBookContract.getOrders(tokenA, tokenB);

    const openOrders = allOrders.filter((order: any) => !order.isFilled && !order.isCancelled);

    if (openOrders.length === 0) {
      logger.info('No open orders to match.');
      return;
    }

    const buys = openOrders
      .filter((order: any) => order.orderType === 0) // 0 = Buy
      .sort((a: any, b: any) => b.amountB - a.amountB); // Highest price first

    const sells = openOrders
      .filter((order: any) => order.orderType === 1) // 1 = Sell
      .sort((a: any, b: any) => a.amountB - b.amountB); // Lowest price first

    logger.info(`Found ${openOrders.length} open orders: ${buys.length} buys, ${sells.length} sells.`);

    // 2. Match orders
    for (const buy of buys) {
      for (const sell of sells) {
        // Skip if either order has already been processed in this cycle
        if (processedOrderIds.has(buy.id.toString()) || processedOrderIds.has(sell.id.toString())) {
          continue;
        }

        // Check for exact match (for this simplified engine)
        if (buy.amountA.eq(sell.amountA) && buy.amountB.eq(sell.amountB)) {
          logger.info(`MATCH FOUND: Buy Order #${buy.id} and Sell Order #${sell.id}`);

          // Mark as processed for this cycle
          processedOrderIds.add(buy.id.toString());
          processedOrderIds.add(sell.id.toString());

          // 3. Settle matched orders
          try {
            const tx = await orderBookContract.executeTrade(buy.id, sell.id);
            logger.info(`Submitting settlement transaction: ${tx.hash}`);
            const receipt = await tx.wait();
            logger.info(`Settlement successful. Gas used: ${receipt.gasUsed.toString()}`);
          } catch (settleError) {
            logger.error(settleError, `Failed to settle match for orders #${buy.id} and #${sell.id}`);
            // If settlement fails, remove from processed set to allow retry
            processedOrderIds.delete(buy.id.toString());
            processedOrderIds.delete(sell.id.toString());
          }

          // Since we found a match for this buy order, break the inner loop and move to the next buy order
          break;
        }
      }
    }

  } catch (error) {
    logger.error(error, 'An error occurred during the matching cycle.');
  } finally {
    // Clear the processed set for the next cycle
    processedOrderIds.clear();
    logger.info('--- Matching cycle finished ---');
  }
}

// --- Main Loop ---
const POLLING_INTERVAL_MS = 15000; // 15 seconds
logger.info(`Polling for orders every ${POLLING_INTERVAL_MS / 1000} seconds.`);
setInterval(matchAndSettle, POLLING_INTERVAL_MS);

// Run once on startup
matchAndSettle();
