import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-viem";
import "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    baseGoerli: {
      url: process.env.BASE_GOERLI_RPC_URL || "https://goerli.base.org",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};

export default config;
