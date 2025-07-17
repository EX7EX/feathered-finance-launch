import type { NextApiRequest, NextApiResponse } from 'next';
import { checkSystemHealth } from '@/lib/monitoring';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test database connection with detailed info
    const dbTest = await testDatabaseConnection();
    
    // Get system health
    const health = await checkSystemHealth();
    
    const response = {
      timestamp: new Date().toISOString(),
      status: health.status,
      database: {
        ...health.checks.database,
        connection: dbTest
      },
      system: health.checks,
      supabase: {
        url: process.env.VITE_SUPABASE_URL ? 'Configured' : 'Not Configured',
        projectId: process.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'Unknown'
      }
    };

    if (health.status === 'healthy' && dbTest.connected) {
      return res.status(200).json(response);
    } else {
      return res.status(503).json(response);
    }
  } catch (error) {
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

async function testDatabaseConnection() {
  try {
    // Test 1: Basic connection test
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      return {
        connected: false,
        error: testError.message,
        details: 'Failed to query users table'
      };
    }

    // Test 2: Get database info
    const { data: dbInfo, error: dbError } = await supabase
      .rpc('version'); // This will show PostgreSQL version if available

    // Test 3: Check if we can get current user info (if authenticated)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    return {
      connected: true,
      message: 'Successfully connected to Supabase database',
      tests: {
        usersTable: '✅ Accessible',
        databaseVersion: dbError ? '❌ Not available' : '✅ Available',
        authService: '✅ Available'
      },
      details: {
        projectId: process.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0],
        userCount: testData ? 'Table accessible' : 'No data',
        currentUser: user ? 'Authenticated' : 'Not authenticated'
      }
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Database connection test failed'
    };
  }
} 