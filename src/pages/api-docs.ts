import { NextApiRequest, NextApiResponse } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';

const apiConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Feathered Finance Launchpad API',
    version: '1.0.0',
    description: 'API documentation for the Feathered Finance Launchpad',
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      description: 'API Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/sales': {
      get: {
        summary: 'List all token sales',
        responses: {
          '200': {
            description: 'List of token sales',
          },
        },
      },
      post: {
        summary: 'Create a new token sale',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateSaleData',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Token sale created successfully',
          },
        },
      },
    },
    '/api/sales/{id}': {
      get: {
        summary: 'Get sale details',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Sale details',
          },
        },
      },
    },
    '/api/distributions': {
      get: {
        summary: 'List all token distributions',
        responses: {
          '200': {
            description: 'List of token distributions',
          },
        },
      },
      post: {
        summary: 'Create a new token distribution',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateDistributionData',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Token distribution created successfully',
          },
        },
      },
    },
    '/api/whitelist/{saleId}': {
      get: {
        summary: 'Get whitelist entries for a sale',
        parameters: [
          {
            name: 'saleId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'List of whitelist entries',
          },
        },
      },
    },
    '/api/kyc': {
      get: {
        summary: 'Get KYC status for an address',
        parameters: [
          {
            name: 'address',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'KYC status',
          },
        },
      },
    },
    '/api/analytics': {
      get: {
        summary: 'Get platform analytics',
        parameters: [
          {
            name: 'period',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['24h', '7d', '30d'],
              default: '7d',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Platform analytics data',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      CreateSaleData: {
        type: 'object',
        required: [
          'tokenAddress',
          'saleType',
          'startTime',
          'endTime',
          'price',
          'minContribution',
          'maxContribution',
          'softCap',
          'hardCap',
        ],
        properties: {
          tokenAddress: {
            type: 'string',
            description: 'Token contract address',
          },
          saleType: {
            type: 'string',
            enum: ['fixed', 'dutch'],
          },
          startTime: {
            type: 'number',
            description: 'Sale start timestamp',
          },
          endTime: {
            type: 'number',
            description: 'Sale end timestamp',
          },
          price: {
            type: 'string',
            description: 'Token price in wei',
          },
          minContribution: {
            type: 'string',
            description: 'Minimum contribution amount in wei',
          },
          maxContribution: {
            type: 'string',
            description: 'Maximum contribution amount in wei',
          },
          softCap: {
            type: 'string',
            description: 'Soft cap in wei',
          },
          hardCap: {
            type: 'string',
            description: 'Hard cap in wei',
          },
          vestingSchedule: {
            type: 'object',
            properties: {
              tgePercentage: {
                type: 'number',
                description: 'Token Generation Event percentage',
              },
              cliffMonths: {
                type: 'number',
                description: 'Cliff period in months',
              },
              vestingMonths: {
                type: 'number',
                description: 'Vesting period in months',
              },
            },
          },
          whitelistEnabled: {
            type: 'boolean',
            description: 'Whether whitelist is enabled',
          },
          kycRequired: {
            type: 'boolean',
            description: 'Whether KYC is required',
          },
        },
      },
      CreateDistributionData: {
        type: 'object',
        required: ['tokenAddress', 'recipients', 'transactionHash'],
        properties: {
          tokenAddress: {
            type: 'string',
            description: 'Token contract address',
          },
          recipients: {
            type: 'array',
            items: {
              type: 'object',
              required: ['address', 'amount'],
              properties: {
                address: {
                  type: 'string',
                  description: 'Recipient wallet address',
                },
                amount: {
                  type: 'string',
                  description: 'Amount in wei',
                },
              },
            },
          },
          vestingEnabled: {
            type: 'boolean',
            description: 'Whether vesting is enabled',
          },
          vestingSchedule: {
            type: 'object',
            properties: {
              tgePercentage: {
                type: 'number',
                description: 'Token Generation Event percentage',
              },
              cliffMonths: {
                type: 'number',
                description: 'Cliff period in months',
              },
              vestingMonths: {
                type: 'number',
                description: 'Vesting period in months',
              },
            },
          },
          transactionHash: {
            type: 'string',
            description: 'Transaction hash of the distribution',
          },
        },
      },
    },
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const spec = createSwaggerSpec({
    definition: apiConfig,
  });
  res.json(spec);
} 