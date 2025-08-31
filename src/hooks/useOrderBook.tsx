import { useState, useEffect, useMemo, useCallback } from 'react';
import { ethers } from 'ethers';
import { ORDER_BOOK_ABI, ORDER_BOOK_ADDRESS, ERC20_ABI } from '@/integrations/web3/contracts';
import { Order } from '@/pages/Exchange/ExchangePage';

// Define the structure of an order coming from the smart contract
interface ContractOrder {
  id: ethers.BigNumber;
  owner: string;
  orderType: number; // 0 for Buy, 1 for Sell
  tokenA: string;
  tokenB: string;
  amountA: ethers.BigNumber;
  amountB: ethers.BigNumber;
  isFilled: boolean;
  isCancelled: boolean;
}

// Add owner to the Order type
export interface OrderWithOwner extends Order {
  owner: string;
}

// Simple in-memory cache for token decimals
const decimalsCache = new Map<string, number>();

export const useOrderBook = (tokenA: string, tokenB: string) => {
  const [orders, setOrders] = useState<OrderWithOwner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      if (window.ethereum && tokenA && tokenB) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(ORDER_BOOK_ADDRESS, ORDER_BOOK_ABI, provider);

        // Fetch decimals for both tokens, using cache if available
        let tokenADecimals = decimalsCache.get(tokenA);
        let tokenBDecimals = decimalsCache.get(tokenB);

        if (!tokenADecimals || !tokenBDecimals) {
          const tokenAContract = new ethers.Contract(tokenA, ERC20_ABI, provider);
          const tokenBContract = new ethers.Contract(tokenB, ERC20_ABI, provider);
          const [aDecimals, bDecimals] = await Promise.all([
            tokenAContract.decimals(),
            tokenBContract.decimals(),
          ]);
          tokenADecimals = aDecimals;
          tokenBDecimals = bDecimals;
          decimalsCache.set(tokenA, aDecimals);
          decimalsCache.set(tokenB, bDecimals);
        }

        const contractOrders: ContractOrder[] = await contract.getOrders(tokenA, tokenB);

        const formattedOrders: OrderWithOwner[] = contractOrders.map(order => {
            const formattedAmountA = parseFloat(ethers.utils.formatUnits(order.amountA, tokenADecimals));
            const formattedAmountB = parseFloat(ethers.utils.formatUnits(order.amountB, tokenBDecimals));

            return {
              id: order.id.toString(),
              owner: order.owner,
              type: order.orderType === 0 ? 'buy' : 'sell',
              price: formattedAmountB / formattedAmountA,
              amount: formattedAmountA,
              total: formattedAmountB,
              date: new Date(), // This is still a limitation, but acceptable for now
              status: order.isFilled ? 'filled' : order.isCancelled ? 'canceled' : 'open',
              pair: `${tokenA}/${tokenB}`,
            }
        });

        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [tokenA, tokenB]);

  useEffect(() => {
    if (tokenA && tokenB) {
      fetchOrders();
    }
  }, [tokenA, tokenB, fetchOrders]);

  const { buyOrders, sellOrders } = useMemo(() => {
    const openOrders = orders.filter(order => order.status === 'open');
    const buyOrders = openOrders.filter(order => order.type === 'buy').sort((a, b) => b.price - a.price);
    const sellOrders = openOrders.filter(order => order.type === 'sell').sort((a, b) => a.price - b.price);
    return { buyOrders, sellOrders };
  }, [orders]);

  return { orders, buyOrders, sellOrders, loading, refetch: fetchOrders };
};
