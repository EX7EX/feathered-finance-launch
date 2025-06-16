import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../../lib/prisma';
import { apiClient } from '../../lib/api/client';

describe('Sales API', () => {
  const testSale = {
    tokenAddress: '0x1234567890123456789012345678901234567890',
    saleType: 'fixed' as const,
    startTime: Math.floor(Date.now() / 1000) + 3600,
    endTime: Math.floor(Date.now() / 1000) + 7200,
    price: '1000000000000000000',
    minContribution: '100000000000000000',
    maxContribution: '10000000000000000000',
    softCap: '100000000000000000000',
    hardCap: '1000000000000000000000',
    whitelistEnabled: true,
    kycRequired: true,
  };

  let createdSaleId: string;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.sale.deleteMany({
      where: {
        tokenAddress: testSale.tokenAddress,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (createdSaleId) {
      await prisma.sale.delete({
        where: { id: createdSaleId },
      });
    }
  });

  it('should create a new sale', async () => {
    const sale = await apiClient.createSale(testSale);
    expect(sale).toBeDefined();
    expect(sale.tokenAddress).toBe(testSale.tokenAddress);
    expect(sale.saleType).toBe(testSale.saleType);
    createdSaleId = sale.id;
  });

  it('should get all sales', async () => {
    const sales = await apiClient.getSales();
    expect(Array.isArray(sales)).toBe(true);
    expect(sales.length).toBeGreaterThan(0);
  });

  it('should get a specific sale', async () => {
    const sale = await apiClient.getSale(createdSaleId);
    expect(sale).toBeDefined();
    expect(sale.id).toBe(createdSaleId);
    expect(sale.tokenAddress).toBe(testSale.tokenAddress);
  });

  it('should update sale status', async () => {
    const sale = await apiClient.updateSaleStatus(createdSaleId, 'active');
    expect(sale).toBeDefined();
    expect(sale.status).toBe('active');
  });

  it('should delete a sale', async () => {
    await apiClient.deleteSale(createdSaleId);
    const sales = await apiClient.getSales();
    expect(sales.find(s => s.id === createdSaleId)).toBeUndefined();
  });
}); 