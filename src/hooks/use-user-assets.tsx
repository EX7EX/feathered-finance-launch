
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CryptoWallet {
  id: string;
  user_id: string;
  crypto_code: string;
  balance: number;
  address: string | null;
  address_verified: boolean;
  blockchain: string | null;
  created_at: string;
  updated_at: string;
  currency_details?: {
    name: string;
    symbol: string;
    exchange_rate_to_usd: number;
  };
}

export interface FiatAccount {
  id: string;
  user_id: string;
  currency_code: string;
  balance: number;
  available_balance: number;
  created_at: string;
  updated_at: string;
  currency_details?: {
    name: string;
    symbol: string;
    exchange_rate_to_usd: number;
  };
}

export function useUserAssets() {
  const { user } = useAuth();

  const fetchCryptoWallets = async (): Promise<CryptoWallet[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('crypto_wallets')
      .select(`
        *,
        currency_details:crypto_code(
          name,
          symbol,
          exchange_rate_to_usd
        )
      `)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching crypto wallets:', error);
      throw error;
    }
    
    return data || [];
  };
  
  const fetchFiatAccounts = async (): Promise<FiatAccount[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('fiat_accounts')
      .select(`
        *,
        currency_details:currency_code(
          name,
          symbol,
          exchange_rate_to_usd
        )
      `)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching fiat accounts:', error);
      throw error;
    }
    
    return data || [];
  };

  const { 
    data: cryptoWallets,
    isLoading: isLoadingCrypto,
    error: cryptoError
  } = useQuery({
    queryKey: ['cryptoWallets', user?.id],
    queryFn: fetchCryptoWallets,
    enabled: !!user
  });

  const { 
    data: fiatAccounts,
    isLoading: isLoadingFiat,
    error: fiatError
  } = useQuery({
    queryKey: ['fiatAccounts', user?.id],
    queryFn: fetchFiatAccounts,
    enabled: !!user
  });

  const isLoading = isLoadingCrypto || isLoadingFiat;
  const error = cryptoError || fiatError;
  
  // Calculate total portfolio value in USD
  const calculateTotalValue = () => {
    let totalValue = 0;
    
    if (cryptoWallets) {
      totalValue += cryptoWallets.reduce((sum, wallet) => {
        const rate = wallet.currency_details?.exchange_rate_to_usd || 0;
        return sum + (Number(wallet.balance) * rate);
      }, 0);
    }
    
    if (fiatAccounts) {
      totalValue += fiatAccounts.reduce((sum, account) => {
        const rate = account.currency_details?.exchange_rate_to_usd || 0;
        return sum + (Number(account.balance) * rate);
      }, 0);
    }
    
    return totalValue;
  };

  return {
    cryptoWallets,
    fiatAccounts,
    isLoading,
    error,
    totalPortfolioValueUsd: calculateTotalValue()
  };
}
