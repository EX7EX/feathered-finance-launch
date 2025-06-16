# Deployment Guide

## Overview

The application is deployed using Vercel for the frontend and Supabase for the backend. This guide covers the deployment process, environment setup, and monitoring.

## Prerequisites

1. Vercel account
2. Supabase account
3. GitHub repository
4. Environment variables

## Deployment Process

### 1. Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

2. Configure environment variables in Vercel dashboard:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=your_api_url
```

3. Set up deployment settings:
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 2. Backend Deployment (Supabase)

1. Create a new Supabase project:
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init
```

2. Deploy database migrations:
```bash
supabase db push
```

3. Deploy Edge Functions:
```bash
supabase functions deploy
```

## Environment Configuration

### Production Environment

1. Create `.env.production`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://api.your-domain.com
```

2. Configure build settings in `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-*']
        }
      }
    }
  }
});
```

### Staging Environment

1. Create `.env.staging`:
```env
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
VITE_API_URL=https://staging-api.your-domain.com
```

## Monitoring and Logging

### 1. Application Monitoring

1. Set up error tracking:
```typescript
// src/lib/error-tracking.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

2. Configure performance monitoring:
```typescript
// src/lib/performance.ts
import { init as initApm } from '@elastic/apm-rum';

const apm = initApm({
  serviceName: 'feathered-finance',
  serverUrl: process.env.VITE_APM_SERVER_URL,
  environment: process.env.NODE_ENV
});
```

### 2. Infrastructure Monitoring

1. Set up Supabase monitoring:
- Database performance
- API response times
- Error rates
- Resource usage

2. Configure Vercel monitoring:
- Build performance
- Deployment status
- Function execution times
- Error rates

## Security

### 1. SSL/TLS Configuration

1. Configure SSL in Vercel:
- Automatic SSL with Let's Encrypt
- Custom SSL certificates if needed

2. Configure SSL in Supabase:
- Automatic SSL for all connections
- Custom domains with SSL

### 2. Security Headers

Configure security headers in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Backup and Recovery

### 1. Database Backups

1. Configure automatic backups in Supabase:
- Daily backups
- Point-in-time recovery
- Backup retention policy

2. Manual backup process:
```bash
# Create backup
supabase db dump -f backup.sql

# Restore backup
supabase db restore -f backup.sql
```

### 2. Application State

1. Configure state persistence:
```typescript
// src/lib/persistence.ts
export const persistState = (key: string, state: any) => {
  localStorage.setItem(key, JSON.stringify(state));
};

export const recoverState = (key: string) => {
  const state = localStorage.getItem(key);
  return state ? JSON.parse(state) : null;
};
```

## Scaling

### 1. Frontend Scaling

1. Configure CDN:
- Enable Vercel Edge Network
- Configure caching rules
- Set up custom domains

2. Optimize assets:
- Image optimization
- Code splitting
- Lazy loading

### 2. Backend Scaling

1. Configure Supabase:
- Database scaling
- Connection pooling
- Query optimization

2. Set up caching:
- Redis caching
- API response caching
- Static asset caching

## Troubleshooting

### Common Deployment Issues

1. Build failures:
- Check build logs
- Verify dependencies
- Check environment variables

2. Runtime errors:
- Check error tracking
- Monitor logs
- Verify API endpoints

3. Performance issues:
- Check monitoring dashboards
- Analyze performance metrics
- Optimize resources

### Recovery Procedures

1. Rollback deployment:
```bash
vercel rollback
```

2. Restore database:
```bash
supabase db restore -f backup.sql
```

3. Clear cache:
```bash
vercel deploy --force
``` 