# Monitoring and Logging Guide

## Overview

This guide covers the monitoring and logging infrastructure for the Modern Office System. The system includes comprehensive monitoring, structured logging, and health checks.

## Logging System

### Logger Configuration

The application uses a structured logging system with multiple log levels:

- **ERROR**: Critical errors that need immediate attention
- **WARN**: Warning messages for potential issues
- **INFO**: General informational messages
- **DEBUG**: Detailed debugging information

### Setting Log Level

Configure the log level via environment variable:

```bash
# In .env file
LOG_LEVEL=INFO  # Options: ERROR, WARN, INFO, DEBUG
```

### Using the Logger

```typescript
import { createLogger } from './utils/logger';

const logger = createLogger('MyComponent');

// Log messages
logger.info('User logged in', { userId: '123', email: 'user@example.com' });
logger.warn('Slow query detected', { queryTime: 1500, query: 'SELECT * FROM tasks' });
logger.error('Database connection failed', error, { retryCount: 3 });
logger.debug('Processing request', { requestId: 'abc123' });

// Create child logger with additional context
const childLogger = logger.child('SubComponent');
childLogger.info('Processing started');
```

### Log Format

#### Production (JSON)
```json
{
  "level": "INFO",
  "timestamp": "2024-01-14T10:30:00.000Z",
  "message": "User logged in",
  "context": "AuthService",
  "metadata": {
    "userId": "123",
    "email": "user@example.com"
  }
}
```

#### Development (Human-readable)
```
ℹ️  [AuthService] User logged in {"userId":"123","email":"user@example.com"}
```

## Monitoring Endpoints

### Health Check Endpoints

#### Basic Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-14T10:30:00.000Z",
  "environment": "production"
}
```

#### Comprehensive Health Check
```bash
GET /api/monitoring/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-14T10:30:00.000Z",
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": "45ms",
      "message": "Connected"
    },
    "email": {
      "status": "ok",
      "message": "Configured"
    },
    "memory": {
      "status": "ok",
      "heapUsed": "125.5 MB",
      "heapTotal": "256 MB",
      "percentage": "49%"
    },
    "uptime": {
      "status": "ok",
      "seconds": 3600,
      "formatted": "1h 0m 0s"
    }
  }
}
```

#### Database Health
```bash
GET /api/monitoring/database
```

Response:
```json
{
  "status": "ok",
  "responseTime": "45ms",
  "timestamp": "2024-01-14T10:30:00.000Z"
}
```

#### Email Service Health
```bash
GET /api/monitoring/email
```

Response:
```json
{
  "status": "ok",
  "configured": true,
  "timestamp": "2024-01-14T10:30:00.000Z"
}
```

#### System Information
```bash
GET /api/monitoring/system
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-14T10:30:00.000Z",
  "node": {
    "version": "v18.17.0",
    "platform": "linux",
    "arch": "x64"
  },
  "uptime": {
    "seconds": 3600,
    "formatted": "1h 0m 0s"
  },
  "memory": {
    "rss": "150 MB",
    "heapTotal": "256 MB",
    "heapUsed": "125.5 MB",
    "external": "2.5 MB",
    "arrayBuffers": "1.2 MB"
  },
  "cpu": {
    "user": 1234567,
    "system": 234567
  },
  "environment": "production"
}
```

### Metrics Endpoints

#### Application Metrics
```bash
GET /api/monitoring/metrics
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-14T10:30:00.000Z",
  "uptime": {
    "seconds": 3600,
    "formatted": "1h 0m 0s"
  },
  "memory": {
    "rss": "150 MB",
    "heapTotal": "256 MB",
    "heapUsed": "125.5 MB",
    "external": "2.5 MB"
  },
  "metrics": {
    "totalRequests": 1000,
    "averageResponseTime": 150,
    "errorRate": 2.5,
    "requestsByStatus": {
      "200": 850,
      "201": 100,
      "400": 25,
      "404": 15,
      "500": 10
    },
    "requestsByPath": {
      "/api/tasks": 400,
      "/api/issues": 300,
      "/api/analytics": 200,
      "/health": 100
    }
  }
}
```

#### Request Statistics
```bash
GET /api/monitoring/stats
```

Response:
```json
{
  "totalRequests": 1000,
  "averageResponseTime": 150,
  "errorRate": 2.5,
  "requestsByStatus": {
    "200": 850,
    "201": 100,
    "400": 25,
    "404": 15,
    "500": 10
  },
  "requestsByPath": {
    "/api/tasks": 400,
    "/api/issues": 300,
    "/api/analytics": 200,
    "/health": 100
  }
}
```

#### Clear Metrics (Admin Only)
```bash
POST /api/monitoring/metrics/clear
```

Response:
```json
{
  "message": "Metrics cleared successfully"
}
```

## Request Logging

All API requests are automatically logged with:
- HTTP method
- Request path
- Response status code
- Response time
- User agent
- IP address

### Example Log Entry
```json
{
  "level": "INFO",
  "timestamp": "2024-01-14T10:30:00.000Z",
  "message": "Request completed",
  "context": "Monitoring",
  "metadata": {
    "method": "GET",
    "path": "/api/tasks",
    "statusCode": 200,
    "responseTime": "150ms"
  }
}
```

### Slow Request Detection

Requests taking longer than 1 second are automatically flagged:

```json
{
  "level": "WARN",
  "timestamp": "2024-01-14T10:30:00.000Z",
  "message": "Slow request detected",
  "context": "Monitoring",
  "metadata": {
    "method": "GET",
    "path": "/api/analytics/report",
    "responseTime": "1500ms"
  }
}
```

## Error Tracking

All unhandled errors are automatically logged with full context:

```json
{
  "level": "ERROR",
  "timestamp": "2024-01-14T10:30:00.000Z",
  "message": "Unhandled error",
  "context": "Monitoring",
  "metadata": {
    "method": "POST",
    "path": "/api/tasks",
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  },
  "error": {
    "name": "ValidationError",
    "message": "Invalid task data",
    "stack": "Error: Invalid task data\n    at..."
  }
}
```

## Monitoring Best Practices

### 1. Regular Health Checks

Set up automated health checks using tools like:
- **UptimeRobot**: Free monitoring service
- **Pingdom**: Website monitoring
- **StatusCake**: Uptime monitoring

Example cron job:
```bash
# Check health every 5 minutes
*/5 * * * * curl -f https://your-api.railway.app/health || echo "Health check failed"
```

### 2. Log Aggregation

In production, consider using log aggregation services:
- **Logtail** (free tier available)
- **Papertrail** (free tier available)
- **Logflare** (free tier available)

Configure log shipping:
```bash
# Example: Ship logs to Logtail
npm install @logtail/node

# In your logger.ts
import { Logtail } from '@logtail/node';
const logtail = new Logtail(process.env.LOGTAIL_TOKEN);
```

### 3. Alert Configuration

Set up alerts for:
- **High error rate** (>5%)
- **Slow response times** (>1s average)
- **High memory usage** (>90%)
- **Service downtime**

### 4. Metrics Dashboard

Create a simple dashboard to visualize:
- Request volume over time
- Error rates
- Response times
- System resources

## Railway Monitoring

### Built-in Metrics

Railway provides built-in monitoring:

1. Go to Railway dashboard
2. Select your project
3. Click on "Metrics" tab

Available metrics:
- CPU usage
- Memory usage
- Network traffic
- Request count
- Response times

### Setting Up Alerts

1. Go to Railway dashboard
2. Project Settings > Notifications
3. Configure alerts for:
   - High CPU usage
   - High memory usage
   - Deployment failures
   - Service crashes

## Vercel Monitoring

### Analytics

Enable Vercel Analytics:

1. Go to Vercel dashboard
2. Select your project
3. Analytics tab
4. Enable Web Analytics (free)

Metrics available:
- Page views
- Unique visitors
- Top pages
- Performance metrics
- Geographic distribution

### Real User Monitoring

Add Vercel Speed Insights:

```typescript
// In your main.tsx
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <>
      <YourApp />
      <SpeedInsights />
    </>
  );
}
```

## Supabase Monitoring

### Database Monitoring

1. Go to Supabase dashboard
2. Database > Usage

Monitor:
- Database size
- Active connections
- Query performance
- Table sizes

### Query Performance

Use Supabase's query analyzer:

```sql
-- Enable query logging
ALTER DATABASE postgres SET log_statement = 'all';

-- View slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### Connection Pooling

Monitor connection pool:

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check connection pool status
SELECT * FROM pg_stat_database;
```

## Troubleshooting

### High Memory Usage

1. Check metrics endpoint:
   ```bash
   curl https://your-api.railway.app/api/monitoring/metrics
   ```

2. Review memory usage in logs
3. Check for memory leaks
4. Restart service if needed:
   ```bash
   railway restart
   ```

### High Error Rate

1. Check error logs:
   ```bash
   railway logs --filter error
   ```

2. Review recent deployments
3. Check database connectivity
4. Verify environment variables

### Slow Response Times

1. Check metrics for slow endpoints:
   ```bash
   curl https://your-api.railway.app/api/monitoring/stats
   ```

2. Review database query performance
3. Check for N+1 queries
4. Enable query caching

### Service Downtime

1. Check health endpoint:
   ```bash
   curl https://your-api.railway.app/health
   ```

2. Review Railway deployment logs
3. Check database connectivity
4. Verify environment variables
5. Check for service crashes

## Monitoring Checklist

### Daily
- [ ] Check error rates
- [ ] Review slow requests
- [ ] Monitor memory usage
- [ ] Check service uptime

### Weekly
- [ ] Review performance trends
- [ ] Analyze user patterns
- [ ] Check database size
- [ ] Review security logs

### Monthly
- [ ] Analyze cost trends
- [ ] Review capacity planning
- [ ] Update monitoring thresholds
- [ ] Test alert systems

## Additional Resources

- [Railway Monitoring Docs](https://docs.railway.app/reference/monitoring)
- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [Supabase Monitoring Docs](https://supabase.com/docs/guides/platform/metrics)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
