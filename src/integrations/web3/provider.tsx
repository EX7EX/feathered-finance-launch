import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import {
  BASE_SEPOLIA_CHAIN_ID,
  BASE_SEPOLIA_CHAIN_HEX,
  BASE_SEPOLIA_RPC,
  BASE_SEPOLIA_EXPLORER,
} from './contracts';

interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  error: string | null;
  isCorrectNetwork: boolean;
  switchToBaseSepolia: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
  error: null,
  isCorrectNetwork: false,
  switchToBaseSepolia: async () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchToBaseSepolia = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CHAIN_HEX }],
      });
    } catch (switchErr: any) {
      // Chain not added — add it
      if (switchErr?.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: BASE_SEPOLIA_CHAIN_HEX,
              chainName: 'Base Sepolia',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: [BASE_SEPOLIA_RPC],
              blockExplorerUrls: [BASE_SEPOLIA_EXPLORER],
            },
          ],
        });
      } else {
        setError(switchErr?.message ?? 'Failed to switch network');
      }
    }
  };

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask to use this application');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const browserProvider = new BrowserProvider(window.ethereum);
      await browserProvider.send('eth_requestAccounts', []);
      const providerSigner = await browserProvider.getSigner();
      const address = await providerSigner.getAddress();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(providerSigner);
      setAccount(address);
      setChainId(Number(network.chainId));

      // Auto-prompt switch to Base Sepolia after connect
      if (Number(network.chainId) !== BASE_SEPOLIA_CHAIN_ID) {
        await switchToBaseSepolia();
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setError(null);
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            connect();
          }
        })
        .catch(console.error);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        connect,
        disconnect,
        isConnecting,
        error,
        isCorrectNetwork: chainId === BASE_SEPOLIA_CHAIN_ID,
        switchToBaseSepolia,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
