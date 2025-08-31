import { ethers } from "hardhat";

async function main() {
  console.log("Deploying OrderBook contract...");
  const orderBookFactory = await ethers.getContractFactory("OrderBook");
  const orderBook = await orderBookFactory.deploy();

  await orderBook.waitForDeployment();

  const contractAddress = await orderBook.getAddress();
  console.log(`OrderBook contract deployed to: ${contractAddress}`);
  console.log("\n----------------------------------------------------");
  console.log("Action Required:");
  console.log(`1. Copy this address to your .env file as VITE_ORDER_BOOK_ADDRESS`);
  console.log("2. The deployer wallet is the initial operator. You may want to transfer operator status to your matching engine's wallet.");
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
