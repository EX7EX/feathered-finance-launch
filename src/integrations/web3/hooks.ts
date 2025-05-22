import { useCallback, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './provider';
import {
  TOKEN_FACTORY_ABI,
  TOKEN_FACTORY_ADDRESS,
  LAUNCHPAD_ABI,
  LAUNCHPAD_ADDRESS,
  DISTRIBUTION_ABI,
  DISTRIBUTION_ADDRESS,
  ERC20_ABI,
} from './contracts';

export const useTokenFactory = () => {
  const { signer } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createToken = useCallback(async (
    name: string,
    symbol: string,
    decimals: number,
    totalSupply: string
  ) => {
    if (!signer) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const factory = new ethers.Contract(
        TOKEN_FACTORY_ADDRESS,
        TOKEN_FACTORY_ABI,
        signer
      );

      const tx = await factory.createToken(
        name,
        symbol,
        decimals,
        ethers.utils.parseUnits(totalSupply, decimals)
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'TokenCreated');
      return event?.args?.tokenAddress;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create token');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  return { createToken, isLoading, error };
};

export const useLaunchpad = () => {
  const { signer } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSale = useCallback(async (
    tokenAddress: string,
    startTime: number,
    endTime: number,
    price: string,
    minContribution: string,
    maxContribution: string,
    softCap: string,
    hardCap: string
  ) => {
    if (!signer) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const launchpad = new ethers.Contract(
        LAUNCHPAD_ADDRESS,
        LAUNCHPAD_ABI,
        signer
      );

      const tx = await launchpad.createSale(
        tokenAddress,
        startTime,
        endTime,
        ethers.utils.parseEther(price),
        ethers.utils.parseEther(minContribution),
        ethers.utils.parseEther(maxContribution),
        ethers.utils.parseEther(softCap),
        ethers.utils.parseEther(hardCap)
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'SaleCreated');
      return event?.args?.saleId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sale');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  const configureVesting = useCallback(async (
    saleId: number,
    tgePercentage: number,
    cliffMonths: number,
    vestingMonths: number
  ) => {
    if (!signer) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const launchpad = new ethers.Contract(
        LAUNCHPAD_ADDRESS,
        LAUNCHPAD_ABI,
        signer
      );

      const tx = await launchpad.configureVesting(
        saleId,
        tgePercentage,
        cliffMonths,
        vestingMonths
      );

      await tx.wait();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to configure vesting');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  return { createSale, configureVesting, isLoading, error };
};

export const useTokenDistribution = () => {
  const { signer } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const distributeTokens = useCallback(async (
    tokenAddress: string,
    recipients: string[],
    amounts: string[],
    decimals: number
  ) => {
    if (!signer) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const distribution = new ethers.Contract(
        DISTRIBUTION_ADDRESS,
        DISTRIBUTION_ABI,
        signer
      );

      const parsedAmounts = amounts.map(amount =>
        ethers.utils.parseUnits(amount, decimals)
      );

      const tx = await distribution.distributeTokens(
        tokenAddress,
        recipients,
        parsedAmounts
      );

      await tx.wait();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to distribute tokens');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  const distributeWithVesting = useCallback(async (
    tokenAddress: string,
    recipients: string[],
    amounts: string[],
    decimals: number,
    tgePercentage: number,
    cliffMonths: number,
    vestingMonths: number
  ) => {
    if (!signer) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const distribution = new ethers.Contract(
        DISTRIBUTION_ADDRESS,
        DISTRIBUTION_ABI,
        signer
      );

      const parsedAmounts = amounts.map(amount =>
        ethers.utils.parseUnits(amount, decimals)
      );

      const tx = await distribution.distributeWithVesting(
        tokenAddress,
        recipients,
        parsedAmounts,
        tgePercentage,
        cliffMonths,
        vestingMonths
      );

      await tx.wait();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to distribute tokens with vesting');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  return { distributeTokens, distributeWithVesting, isLoading, error };
};

export const useToken = (address: string) => {
  const { provider } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTokenInfo = useCallback(async () => {
    if (!provider) {
      setError('Provider not connected');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = new ethers.Contract(address, ERC20_ABI, provider);
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        token.name(),
        token.symbol(),
        token.decimals(),
        token.totalSupply(),
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get token info');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [provider, address]);

  return { getTokenInfo, isLoading, error };
}; 