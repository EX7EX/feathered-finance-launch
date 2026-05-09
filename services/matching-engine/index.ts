import { JsonRpcProvider, Wallet, Contract } from 'ethers';
import pino from 'pino';
import 'dotenv/config';

// Order book ABI (matches OrderBook.sol on Base Sepolia).
const ORDER_BOOK_ABI = [
  "function getOrders(address tokenA, address tokenB) view returns (tuple(uint256 id, address owner, uint8 orderType, address tokenA, address tokenB, uint256 amountA, uint256 amountB, uint256 filledAmountA, uint256 expiry, uint8 status)[])",
  "function executeTrade(uint256 buyOrderId, uint256 sellOrderId)",
  "function operator() view returns (address)",
];

const ORDER_BOOK_ADDRESS = process.env.VITE_ORDER_BOOK_ADDRESS || process.env.ORDER_BOOK_ADDRESS;
const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
const OPERATOR_PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY;
const TOKEN_A = process.env.VITE_TEST_WBTC_ADDRESS;
const TOKEN_B = process.env.VITE_TEST_USDC_ADDRESS;

const logger = pino();

if (!OPERATOR_PRIVATE_KEY) {
  logger.error('OPERATOR_PRIVATE_KEY is not set.');
  process.exit(1);
}
if (!ORDER_BOOK_ADDRESS) {
  logger.error('ORDER_BOOK_ADDRESS / VITE_ORDER_BOOK_ADDRESS is not set.');
  process.exit(1);
}
if (!TOKEN_A || !TOKEN_B) {
  logger.error('VITE_TEST_WBTC_ADDRESS and VITE_TEST_USDC_ADDRESS must be set.');
  process.exit(1);
}

const provider = new JsonRpcProvider(RPC_URL);
const operatorWallet = new Wallet(OPERATOR_PRIVATE_KEY, provider);
const orderBookContract = new Contract(ORDER_BOOK_ADDRESS, ORDER_BOOK_ABI, operatorWallet);

logger.info(`Matching engine starting. Operator address: ${operatorWallet.address}`);

// --- Core Logic ---

// A simple in-memory store to prevent re-processing of already matched orders in the same batch
const processedOrderIds = new Set<string>();

async function matchAndSettle() {
  logger.info('--- Running matching cycle ---');

  try {
    const allOrders = await orderBookContract.getOrders(TOKEN_A, TOKEN_B);

    // status: 0 Open, 1 Filled, 2 Cancelled
    const openOrders = allOrders.filter((order: any) => Number(order.status) === 0);

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
        if (buy.amountA === sell.amountA && buy.amountB === sell.amountB) {
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
