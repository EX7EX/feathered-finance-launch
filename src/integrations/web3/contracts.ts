import { ethers } from 'ethers';

// Token Factory Contract
export const TOKEN_FACTORY_ABI = [
  'function createToken(string name, string symbol, uint8 decimals, uint256 totalSupply) returns (address)',
  'function getTokenAddress(string symbol) view returns (address)',
];

export const TOKEN_FACTORY_ADDRESS = process.env.VITE_TOKEN_FACTORY_ADDRESS || '';

// Launchpad Contract
export const LAUNCHPAD_ABI = [
  'function createSale(address token, uint256 startTime, uint256 endTime, uint256 price, uint256 minContribution, uint256 maxContribution, uint256 softCap, uint256 hardCap) returns (uint256)',
  'function configureVesting(uint256 saleId, uint256 tgePercentage, uint256 cliffMonths, uint256 vestingMonths)',
  'function enableWhitelist(uint256 saleId)',
  'function requireKYC(uint256 saleId)',
  'function addToWhitelist(uint256 saleId, address[] accounts)',
];

export const LAUNCHPAD_ADDRESS = process.env.VITE_LAUNCHPAD_ADDRESS || '';

// Token Distribution Contract
export const DISTRIBUTION_ABI = [
  'function distributeTokens(address token, address[] recipients, uint256[] amounts)',
  'function distributeWithVesting(address token, address[] recipients, uint256[] amounts, uint256 tgePercentage, uint256 cliffMonths, uint256 vestingMonths)',
];

export const DISTRIBUTION_ADDRESS = process.env.VITE_DISTRIBUTION_ADDRESS || '';

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