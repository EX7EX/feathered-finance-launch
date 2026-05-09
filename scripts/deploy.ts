import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

/**
 * Deploys OrderBook + two open-mint test ERC20s (tWBTC, tUSDC) to Base Sepolia.
 * Writes addresses to ./deployed-addresses.json so they can be copied into .env.
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  // 1. Test tokens (open-mint, testnet only)
  const TestToken = await ethers.getContractFactory("TestToken");

  console.log("Deploying tWBTC (8 decimals)...");
  // maxMintPerCall = 100 BTC per call
  const wbtc = await TestToken.deploy("Test Wrapped Bitcoin", "tWBTC", 8, ethers.parseUnits("100", 8));
  await wbtc.waitForDeployment();
  const wbtcAddr = await wbtc.getAddress();

  console.log("Deploying tUSDC (6 decimals)...");
  // maxMintPerCall = 1,000,000 USDC per call
  const usdc = await TestToken.deploy("Test USD Coin", "tUSDC", 6, ethers.parseUnits("1000000", 6));
  await usdc.waitForDeployment();
  const usdcAddr = await usdc.getAddress();

  // 2. Order book
  console.log("Deploying OrderBook...");
  const OrderBook = await ethers.getContractFactory("OrderBook");
  const orderBook = await OrderBook.deploy();
  await orderBook.waitForDeployment();
  const orderBookAddr = await orderBook.getAddress();

  const addresses = {
    network: "baseSepolia",
    chainId: 84532,
    deployer: deployer.address,
    OrderBook: orderBookAddr,
    tWBTC: wbtcAddr,
    tUSDC: usdcAddr,
    deployedAt: new Date().toISOString(),
  };

  const outPath = join(__dirname, "..", "deployed-addresses.json");
  writeFileSync(outPath, JSON.stringify(addresses, null, 2));

  console.log("\n----------------------------------------------------");
  console.log("Deployment complete. Addresses written to deployed-addresses.json");
  console.log(JSON.stringify(addresses, null, 2));
  console.log("\nAdd these to your .env (and Lovable env):");
  console.log(`  VITE_ORDER_BOOK_ADDRESS=${orderBookAddr}`);
  console.log(`  VITE_TEST_WBTC_ADDRESS=${wbtcAddr}`);
  console.log(`  VITE_TEST_USDC_ADDRESS=${usdcAddr}`);
  console.log("\nNext: verify on Basescan and transfer OrderBook operator to your matching-engine wallet.");
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
