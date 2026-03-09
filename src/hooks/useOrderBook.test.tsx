import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useOrderBook } from './useOrderBook';
import { Contract } from 'ethers';

// Mock the ethers library
vi.mock('ethers', () => ({
  BrowserProvider: vi.fn().mockImplementation(() => ({})),
  Contract: vi.fn(),
  formatUnits: (value: bigint) => value.toString(),
}));

// Mock the contracts module
vi.mock('@/integrations/web3/contracts', () => ({
  ORDER_BOOK_ABI: [],
  ORDER_BOOK_ADDRESS: '0x0000000000000000000000000000000000000000',
}));

describe('useOrderBook', () => {
  beforeAll(() => {
    (global as any).window.ethereum = {
      request: vi.fn(),
    };
  });

  it('should fetch and process orders correctly', async () => {
    const mockOrders = [
      // Buy order
      { id: 1n, owner: '0xowner1', orderType: 0, tokenA: '0xA', tokenB: '0xB', amountA: 100n, amountB: 1000n, isFilled: false, isCancelled: false },
      // Sell order
      { id: 2n, owner: '0xowner2', orderType: 1, tokenA: '0xA', tokenB: '0xB', amountA: 200n, amountB: 2200n, isFilled: false, isCancelled: false },
      // Filled order (should be filtered out)
      { id: 3n, owner: '0xowner3', orderType: 0, tokenA: '0xA', tokenB: '0xB', amountA: 300n, amountB: 3000n, isFilled: true, isCancelled: false },
    ];

    (Contract as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      getOrders: vi.fn().mockResolvedValue(mockOrders),
    }));

    const { result } = renderHook(() => useOrderBook('0xA', '0xB'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.buyOrders).toHaveLength(1);
      expect(result.current.sellOrders).toHaveLength(1);
    });

    expect(result.current.buyOrders[0]?.type).toBe('buy');
    expect(result.current.sellOrders[0]?.type).toBe('sell');
  });
});
