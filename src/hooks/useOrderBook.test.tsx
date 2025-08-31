import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useOrderBook } from './useOrderBook';
import { ethers } from 'ethers';

// Mock the ethers library
vi.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: vi.fn().mockImplementation(() => ({
        // Mock provider methods if needed
      })),
    },
    Contract: vi.fn(),
    utils: {
      formatUnits: (value: any) => value.toString(), // Simplified mock
    },
    BigNumber: {
      from: (value: any) => ({
        toString: () => value.toString(),
        // Add other BigNumber methods if your hook uses them
      }),
    },
  },
}));

// Mock the contracts module
vi.mock('@/integrations/web3/contracts', () => ({
  ORDER_BOOK_ABI: [],
  ORDER_BOOK_ADDRESS: '0x0000000000000000000000000000000000000000',
}));


describe('useOrderBook', () => {
  beforeAll(() => {
    // Mock window.ethereum
    (global as any).window.ethereum = {
      request: vi.fn(),
    };
  });

  it('should fetch and process orders correctly', async () => {
    const mockOrders = [
      // Buy order
      { id: ethers.BigNumber.from(1), owner: '0xowner1', orderType: 0, tokenA: '0xA', tokenB: '0xB', amountA: ethers.BigNumber.from(100), amountB: ethers.BigNumber.from(1000), isFilled: false, isCancelled: false },
      // Sell order
      { id: ethers.BigNumber.from(2), owner: '0xowner2', orderType: 1, tokenA: '0xA', tokenB: '0xB', amountA: ethers.BigNumber.from(200), amountB: ethers.BigNumber.from(2200), isFilled: false, isCancelled: false },
      // Filled order (should be filtered out)
      { id: ethers.BigNumber.from(3), owner: '0xowner3', orderType: 0, tokenA: '0xA', tokenB: '0xB', amountA: ethers.BigNumber.from(300), amountB: ethers.BigNumber.from(3000), isFilled: true, isCancelled: false },
    ];

    (ethers.Contract as any).mockImplementation(() => ({
      getOrders: vi.fn().mockResolvedValue(mockOrders),
    }));

    const { result } = renderHook(() => useOrderBook('0xA', '0xB'));

    // Wait for the hook to finish fetching and processing
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.buyOrders).toHaveLength(1);
      expect(result.current.sellOrders).toHaveLength(1);
    });

    // Check buy order details
    expect(result.current.buyOrders[0].type).toBe('buy');
    expect(result.current.buyOrders[0].price).toBe(10); // 1000 / 100

    // Check sell order details
    expect(result.current.sellOrders[0].type).toBe('sell');
    expect(result.current.sellOrders[0].price).toBe(11); // 2200 / 200
  });
});
