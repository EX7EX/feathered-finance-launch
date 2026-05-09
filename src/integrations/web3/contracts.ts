// Web3 contract ABIs and addresses

// Token Factory Contract
export const TOKEN_FACTORY_ABI = [
  'function createToken(string name, string symbol, uint8 decimals, uint256 totalSupply) returns (address)',
  'function getTokenAddress(string symbol) view returns (address)',
];

export const TOKEN_FACTORY_ADDRESS = import.meta.env.VITE_TOKEN_FACTORY_ADDRESS || '';

// Launchpad Contract
export const LAUNCHPAD_ABI = [
  'function createSale(address token, uint256 startTime, uint256 endTime, uint256 price, uint256 minContribution, uint256 maxContribution, uint256 softCap, uint256 hardCap) returns (uint256)',
  'function configureVesting(uint256 saleId, uint256 tgePercentage, uint256 cliffMonths, uint256 vestingMonths)',
  'function enableWhitelist(uint256 saleId)',
  'function requireKYC(uint256 saleId)',
  'function addToWhitelist(uint256 saleId, address[] accounts)',
];

export const LAUNCHPAD_ADDRESS = import.meta.env.VITE_LAUNCHPAD_ADDRESS || '';

// Token Distribution Contract
export const DISTRIBUTION_ABI = [
  'function distributeTokens(address token, address[] recipients, uint256[] amounts)',
  'function distributeWithVesting(address token, address[] recipients, uint256[] amounts, uint256 tgePercentage, uint256 cliffMonths, uint256 vestingMonths)',
];

export const DISTRIBUTION_ADDRESS = import.meta.env.VITE_DISTRIBUTION_ADDRESS || '';

// ============ Base Sepolia Testnet Configuration ============
export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_SEPOLIA_CHAIN_HEX = "0x14a34";
export const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
export const BASE_SEPOLIA_EXPLORER = "https://sepolia.basescan.org";

// Order Book Contract — matches OrderBook.sol exactly (createOrder takes 6 args incl. expiry)
export const ORDER_BOOK_ABI = [
  "event OrderCreated(uint256 indexed id, address indexed owner, uint8 orderType, address tokenA, address tokenB, uint256 amountA, uint256 amountB, uint256 expiry)",
  "event OrderCancelled(uint256 indexed id)",
  "event OrderFilled(uint256 indexed id)",
  "event TradeExecuted(uint256 indexed buyOrderId, uint256 indexed sellOrderId, uint256 amountA, uint256 amountB)",
  "constructor()",
  "function createOrder(uint8 orderType, address tokenA, address tokenB, uint256 amountA, uint256 amountB, uint256 expiry)",
  "function getOrders(address tokenA, address tokenB) view returns (tuple(uint256 id, address owner, uint8 orderType, address tokenA, address tokenB, uint256 amountA, uint256 amountB, uint256 filledAmountA, uint256 expiry, uint8 status)[])",
  "function cancelOrder(uint256 orderId)",
  "function executeTrade(uint256 buyOrderId, uint256 sellOrderId)",
  "function operator() view returns (address)",
  "function setOperator(address newOperator)"
];

// Deployed addresses — populated after `npx hardhat run scripts/deploy.ts --network baseSepolia`
export const ORDER_BOOK_ADDRESS =
  import.meta.env.VITE_ORDER_BOOK_ADDRESS || "";

// Test ERC20s deployed alongside OrderBook on Base Sepolia (open mint via TestToken.sol)
export const TEST_TOKENS = {
  tWBTC: import.meta.env.VITE_TEST_WBTC_ADDRESS || "",
  tUSDC: import.meta.env.VITE_TEST_USDC_ADDRESS || "",
} as const;

// TestToken ABI — open-mint ERC20 used for testnet onboarding
export const TEST_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function maxMintPerCall() view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

// ERC20 Token Interface
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address, uint256) returns (bool)',
  'function allowance(address, address) view returns (uint256)',
  'function approve(address, uint256) returns (bool)',
  'function transferFrom(address, address, uint256) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
]; 