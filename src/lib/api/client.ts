import { Sale, Distribution, WhitelistEntry, KYCVerification } from '@prisma/client';

// Types
export type CreateSaleData = {
  tokenAddress: string;
  saleType: 'fixed' | 'dutch';
  startTime: number;
  endTime: number;
  price: string;
  minContribution: string;
  maxContribution: string;
  softCap: string;
  hardCap: string;
  vestingSchedule?: {
    tgePercentage: number;
    cliffMonths: number;
    vestingMonths: number;
  };
  whitelistEnabled: boolean;
  kycRequired: boolean;
};

export type CreateDistributionData = {
  tokenAddress: string;
  recipients: Array<{
    address: string;
    amount: string;
  }>;
  vestingEnabled: boolean;
  vestingSchedule?: {
    tgePercentage: number;
    cliffMonths: number;
    vestingMonths: number;
  };
  transactionHash: string;
};

export type KYCSubmissionData = {
  address: string;
  fullName: string;
  email: string;
  country: string;
  documentType: 'passport' | 'id_card' | 'drivers_license';
  documentNumber: string;
  documentImage: string;
};

// API Client
class APIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Sales API
  async getSales(): Promise<Sale[]> {
    return this.request('/sales');
  }

  async getSale(id: string): Promise<Sale> {
    return this.request(`/sales/${id}`);
  }

  async createSale(data: CreateSaleData): Promise<Sale> {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSaleStatus(id: string, status: string): Promise<Sale> {
    return this.request(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteSale(id: string): Promise<void> {
    return this.request(`/sales/${id}`, {
      method: 'DELETE',
    });
  }

  // Distributions API
  async getDistributions(): Promise<Distribution[]> {
    return this.request('/distributions');
  }

  async createDistribution(data: CreateDistributionData): Promise<Distribution> {
    return this.request('/distributions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Whitelist API
  async getWhitelist(saleId: string): Promise<WhitelistEntry[]> {
    return this.request(`/whitelist/${saleId}`);
  }

  async addToWhitelist(
    saleId: string,
    address: string,
    maxContribution?: string
  ): Promise<WhitelistEntry> {
    return this.request(`/whitelist/${saleId}`, {
      method: 'POST',
      body: JSON.stringify({ address, maxContribution }),
    });
  }

  async removeFromWhitelist(saleId: string, address: string): Promise<void> {
    return this.request(`/whitelist/${saleId}`, {
      method: 'DELETE',
      body: JSON.stringify({ address }),
    });
  }

  // KYC API
  async getKYCStatus(address: string): Promise<KYCVerification> {
    return this.request(`/kyc?address=${address}`);
  }

  async submitKYC(data: KYCSubmissionData): Promise<KYCVerification> {
    return this.request('/kyc', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKYCStatus(
    address: string,
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<KYCVerification> {
    return this.request('/kyc', {
      method: 'PUT',
      body: JSON.stringify({ address, status }),
    });
  }

  // Analytics API
  async getAnalytics(period: '24h' | '7d' | '30d' = '7d'): Promise<{
    sales: {
      total: number;
      totalRaised: number;
    };
    distributions: {
      total: number;
      totalAmount: number;
    };
    contributions: {
      total: number;
      totalAmount: number;
    };
    kyc: Record<string, number>;
  }> {
    return this.request(`/analytics?period=${period}`);
  }
}

export const apiClient = new APIClient(); 