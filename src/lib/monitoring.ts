import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../middleware/auth';
import { init as initApm } from '@elastic/apm-rum';
import * as Sentry from '@sentry/react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  metadata: Record<string, any>;
}

class Monitoring {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  log(
    level: LogEntry['level'],
    message: string,
    metadata: Record<string, any> = {}
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In production, you would send this to your logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to logging service
      // await this.sendToLoggingService(entry);
    } else {
      console[level](message, metadata);
    }
  }

  info(message: string, metadata: Record<string, any> = {}) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata: Record<string, any> = {}) {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata: Record<string, any> = {}) {
    this.log('error', message, metadata);
  }

  getLogs(level?: LogEntry['level']) {
    return level
      ? this.logs.filter(log => log.level === level)
      : this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export const monitoring = new Monitoring();

export function withMonitoring(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) {
  const startTime = Date.now();

  // Log request
  monitoring.info('API Request', {
    method: req.method,
    url: req.url,
    user: req.user?.address,
    query: req.query,
    body: req.body,
  });

  // Add response logging
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - startTime;

    // Log response
    monitoring.info('API Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      body,
    });

    return originalJson.call(this, body);
  };

  return next().catch(error => {
    // Log error
    monitoring.error('API Error', {
      method: req.method,
      url: req.url,
      error: error.message,
      stack: error.stack,
      user: req.user?.address,
    });

    throw error;
  });
}

// Initialize APM
const apm = initApm({
  serviceName: 'feathered-finance',
  serverUrl: process.env.VITE_APM_SERVER_URL,
  environment: process.env.NODE_ENV
});

// Initialize Sentry
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ]
});

// Performance Monitoring
export const trackPerformance = (metric: {
  name: string;
  value: number;
  tags?: Record<string, string>;
}) => {
  apm.addTransaction(metric.name, {
    ...metric.tags,
    value: metric.value
  });
};

// Error Monitoring
export const trackError = (error: Error, context?: any) => {
  Sentry.withScope(scope => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(error);
  });
};

// System Health Monitoring
export const checkSystemHealth = async () => {
  const checks = {
    database: await checkDatabase(),
    api: await checkApi(),
    storage: await checkStorage(),
    cache: await checkCache()
  };

  return {
    status: Object.values(checks).every(check => check.status === 'healthy')
      ? 'healthy'
      : 'unhealthy',
    checks
  };
};

// Performance Health Monitoring
export const checkPerformanceHealth = async () => {
  const metrics = {
    responseTime: await measureResponseTime(),
    memoryUsage: await measureMemoryUsage(),
    cpuUsage: await measureCpuUsage(),
    databasePerformance: await measureDatabasePerformance()
  };

  return {
    status: calculateHealthStatus(metrics),
    metrics
  };
};

// Helper Functions
async function checkDatabase() {
  try {
    // Implement database health check
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error };
  }
}

async function checkApi() {
  try {
    // Implement API health check
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error };
  }
}

async function checkStorage() {
  try {
    // Implement storage health check
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error };
  }
}

async function checkCache() {
  try {
    // Implement cache health check
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error };
  }
}

async function measureResponseTime() {
  // Implement response time measurement
  return 0;
}

async function measureMemoryUsage() {
  // Implement memory usage measurement
  return 0;
}

async function measureCpuUsage() {
  // Implement CPU usage measurement
  return 0;
}

async function measureDatabasePerformance() {
  // Implement database performance measurement
  return 0;
}

function calculateHealthStatus(metrics: Record<string, number>) {
  // Implement health status calculation
  return 'healthy';
}

// Maintenance Logging
export const logMaintenance = (event: {
  type: string;
  description: string;
  performedBy: string;
  timestamp: Date;
}) => {
  console.log({
    ...event,
    timestamp: event.timestamp.toISOString()
  });
};

// Debug Information
export const debugApplication = async () => {
  const systemInfo = await collectSystemInfo();
  const appState = await checkApplicationState();
  const dbStatus = await checkDatabaseConnection();

  return {
    systemInfo,
    appState,
    dbStatus
  };
};

async function collectSystemInfo() {
  // Implement system info collection
  return {};
}

async function checkApplicationState() {
  // Implement application state check
  return {};
}

async function checkDatabaseConnection() {
  // Implement database connection check
  return {};
} 