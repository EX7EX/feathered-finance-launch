import { init as initApm } from '@elastic/apm-rum';
import * as Sentry from '@sentry/react';
import { monitoring } from './monitoring';

export const initProductionMonitoring = () => {
  // Initialize APM
  initApm({
    serviceName: 'feathered-finance-prod',
    serverUrl: process.env.VITE_APM_SERVER_URL,
    environment: 'production',
    active: true,
    instrument: true,
    distributedTracing: true,
    transactionSampleRate: 0.1
  });

  // Initialize Sentry
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: ['localhost', 'feathered.finance'],
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });

  // Configure monitoring
  monitoring.configure({
    level: 'info',
    service: 'feathered-finance-prod',
    environment: 'production',
    sampling: {
      rate: 0.1,
      traces: true,
      errors: true,
    },
  });

  // Set up error tracking
  window.onerror = (message, source, lineno, colno, error) => {
    Sentry.captureException(error || new Error(message as string), {
      extra: {
        source,
        lineno,
        colno,
      },
    });
  };

  // Set up unhandled promise rejection tracking
  window.onunhandledrejection = (event) => {
    Sentry.captureException(event.reason, {
      extra: {
        type: 'unhandledrejection',
      },
    });
  };
};

// Performance monitoring
export const trackPerformance = (metric: {
  name: string;
  value: number;
  tags?: Record<string, string>;
}) => {
  const apm = initApm({
    serviceName: 'feathered-finance-prod',
    serverUrl: process.env.VITE_APM_SERVER_URL,
  });

  apm.addTransaction(metric.name, {
    ...metric.tags,
    value: metric.value,
  });
};

// Error tracking
export const trackError = (error: Error, context?: any) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(error);
  });
};

// System health monitoring
export const checkSystemHealth = async () => {
  const checks = {
    database: await checkDatabase(),
    api: await checkApi(),
    storage: await checkStorage(),
    cache: await checkCache(),
  };

  return {
    status: Object.values(checks).every((check) => check.status === 'healthy')
      ? 'healthy'
      : 'unhealthy',
    checks,
  };
};

// Helper functions
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