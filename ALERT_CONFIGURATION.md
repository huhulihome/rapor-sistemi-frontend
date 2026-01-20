# Alert Configuration Guide

## Overview

This guide covers setting up alerts and notifications for the Modern Office System to ensure you're notified of critical issues.

## Alert Types

### 1. Uptime Monitoring
Monitor service availability and get notified when services go down.

### 2. Performance Alerts
Get notified when response times exceed thresholds.

### 3. Error Rate Alerts
Monitor error rates and get notified of spikes.

### 4. Resource Alerts
Monitor CPU, memory, and database usage.

## Free Monitoring Services

### UptimeRobot (Recommended)

**Features:**
- 50 monitors (free tier)
- 5-minute check intervals
- Email, SMS, Slack notifications
- Status page

**Setup:**

1. Sign up at https://uptimerobot.com
2. Create monitors:

#### Frontend Monitor
- Monitor Type: HTTP(s)
- Friendly Name: Office System Frontend
- URL: `https://your-app.vercel.app`
- Monitoring Interval: 5 minutes
- Alert Contacts: Your email

#### Backend Monitor
- Monitor Type: HTTP(s)
- Friendly Name: Office System Backend
- URL: `https://your-api.railway.app/health`
- Monitoring Interval: 5 minutes
- Alert Contacts: Your email

#### Backend Health Check
- Monitor Type: Keyword
- URL: `https://your-api.railway.app/api/monitoring/health`
- Keyword: `"status":"healthy"`
- Monitoring Interval: 5 minutes

3. Configure alert contacts:
   - Email notifications
   - Slack webhook (optional)
   - Discord webhook (optional)

### Pingdom

**Features:**
- 1 monitor (free tier)
- 1-minute check intervals
- Email notifications

**Setup:**

1. Sign up at https://www.pingdom.com
2. Create uptime check:
   - Name: Office System
   - URL: `https://your-app.vercel.app`
   - Check interval: 1 minute
   - Alert when down for: 1 minute

### StatusCake

**Features:**
- Unlimited monitors (free tier)
- 5-minute check intervals
- Email notifications

**Setup:**

1. Sign up at https://www.statuscake.com
2. Create uptime test:
   - Test Name: Office System
   - Test URL: `https://your-app.vercel.app`
   - Check Rate: 5 minutes

## Railway Alerts

### Built-in Alerts

Railway provides built-in alerting:

1. Go to Railway dashboard
2. Project Settings > Notifications
3. Configure alerts:

#### Deployment Alerts
- Deployment started
- Deployment succeeded
- Deployment failed

#### Service Alerts
- Service crashed
- Service restarted
- High CPU usage (>80%)
- High memory usage (>80%)

#### Notification Channels
- Email
- Slack
- Discord
- Webhook

### Custom Webhooks

Set up custom webhooks for advanced alerting:

```javascript
// Example webhook handler
app.post('/webhook/railway', (req, res) => {
  const { event, service, status } = req.body;
  
  // Send to your notification service
  if (event === 'deployment.failed') {
    sendSlackNotification(`Deployment failed for ${service}`);
  }
  
  res.sendStatus(200);
});
```

## Vercel Alerts

### Deployment Notifications

1. Go to Vercel dashboard
2. Project Settings > Git
3. Enable notifications:
   - Deployment started
   - Deployment ready
   - Deployment failed

### Integration Notifications

Configure integrations:

#### Slack Integration
1. Project Settings > Integrations
2. Add Slack integration
3. Select channel
4. Configure events:
   - Deployments
   - Comments
   - Errors

#### Discord Integration
1. Project Settings > Integrations
2. Add Discord integration
3. Select channel
4. Configure events

## Supabase Alerts

### Database Alerts

1. Go to Supabase dashboard
2. Database > Usage
3. Set up alerts for:
   - Database size (>80% of limit)
   - Connection count (>80% of limit)
   - Query performance degradation

### Email Notifications

Configure email notifications:
1. Project Settings > Notifications
2. Add email addresses
3. Select alert types:
   - Database issues
   - API issues
   - Authentication issues

## Custom Alert System

### Health Check Script

Create a monitoring script:

```bash
#!/bin/bash
# health-check.sh

BACKEND_URL="https://your-api.railway.app"
FRONTEND_URL="https://your-app.vercel.app"
SLACK_WEBHOOK="your_slack_webhook_url"

# Check backend health
backend_status=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health)
if [ $backend_status -ne 200 ]; then
  curl -X POST $SLACK_WEBHOOK \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"🚨 Backend health check failed: HTTP $backend_status\"}"
fi

# Check frontend
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
if [ $frontend_status -ne 200 ]; then
  curl -X POST $SLACK_WEBHOOK \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"🚨 Frontend health check failed: HTTP $frontend_status\"}"
fi

# Check database
db_health=$(curl -s $BACKEND_URL/api/monitoring/database | jq -r '.status')
if [ "$db_health" != "ok" ]; then
  curl -X POST $SLACK_WEBHOOK \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"🚨 Database health check failed\"}"
fi
```

### Cron Job Setup

Run health checks periodically:

```bash
# Add to crontab
crontab -e

# Run every 5 minutes
*/5 * * * * /path/to/health-check.sh

# Run every hour
0 * * * * /path/to/health-check.sh
```

### GitHub Actions Monitoring

Create a monitoring workflow:

```yaml
# .github/workflows/monitoring.yml
name: Health Check

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Backend Health
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" ${{ secrets.BACKEND_URL }}/health)
          if [ $response -ne 200 ]; then
            echo "Backend health check failed: $response"
            exit 1
          fi

      - name: Check Frontend
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" ${{ secrets.FRONTEND_URL }})
          if [ $response -ne 200 ]; then
            echo "Frontend health check failed: $response"
            exit 1
          fi

      - name: Notify on Failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Health check failed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Slack Integration

### Webhook Setup

1. Go to https://api.slack.com/apps
2. Create new app
3. Enable Incoming Webhooks
4. Add webhook to workspace
5. Copy webhook URL

### Send Notifications

```typescript
// utils/slack.ts
export async function sendSlackNotification(message: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('Slack webhook not configured');
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

// Usage
sendSlackNotification('🚨 High error rate detected: 15%');
sendSlackNotification('✅ Deployment successful');
sendSlackNotification('⚠️ Slow response time: 2.5s average');
```

## Discord Integration

### Webhook Setup

1. Go to Discord server settings
2. Integrations > Webhooks
3. Create webhook
4. Copy webhook URL

### Send Notifications

```typescript
// utils/discord.ts
export async function sendDiscordNotification(message: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('Discord webhook not configured');
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
  }
}
```

## Email Alerts

### Using Nodemailer

```typescript
// utils/alerts.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmailAlert(subject: string, message: string) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.ALERT_EMAIL,
      subject: `[ALERT] ${subject}`,
      html: `
        <h2>System Alert</h2>
        <p>${message}</p>
        <p><small>Timestamp: ${new Date().toISOString()}</small></p>
      `,
    });
  } catch (error) {
    console.error('Failed to send email alert:', error);
  }
}

// Usage
sendEmailAlert('High Error Rate', 'Error rate exceeded 10%: currently at 15%');
sendEmailAlert('Service Down', 'Backend service is not responding');
```

## Alert Thresholds

### Recommended Thresholds

```typescript
// config/alerts.ts
export const ALERT_THRESHOLDS = {
  // Response time (milliseconds)
  responseTime: {
    warning: 1000,
    critical: 3000,
  },
  
  // Error rate (percentage)
  errorRate: {
    warning: 5,
    critical: 10,
  },
  
  // Memory usage (percentage)
  memoryUsage: {
    warning: 80,
    critical: 90,
  },
  
  // CPU usage (percentage)
  cpuUsage: {
    warning: 70,
    critical: 85,
  },
  
  // Database connections
  dbConnections: {
    warning: 80,
    critical: 95,
  },
};
```

### Alert Logic

```typescript
// middleware/alerting.ts
import { ALERT_THRESHOLDS } from '../config/alerts';
import { sendSlackNotification } from '../utils/slack';

export function checkAlerts(metrics: any) {
  // Check error rate
  if (metrics.errorRate > ALERT_THRESHOLDS.errorRate.critical) {
    sendSlackNotification(
      `🚨 CRITICAL: Error rate at ${metrics.errorRate}%`
    );
  } else if (metrics.errorRate > ALERT_THRESHOLDS.errorRate.warning) {
    sendSlackNotification(
      `⚠️ WARNING: Error rate at ${metrics.errorRate}%`
    );
  }

  // Check response time
  if (metrics.averageResponseTime > ALERT_THRESHOLDS.responseTime.critical) {
    sendSlackNotification(
      `🚨 CRITICAL: Avg response time ${metrics.averageResponseTime}ms`
    );
  } else if (metrics.averageResponseTime > ALERT_THRESHOLDS.responseTime.warning) {
    sendSlackNotification(
      `⚠️ WARNING: Avg response time ${metrics.averageResponseTime}ms`
    );
  }
}
```

## Alert Best Practices

### 1. Avoid Alert Fatigue
- Set appropriate thresholds
- Use warning vs critical levels
- Aggregate similar alerts
- Implement cooldown periods

### 2. Actionable Alerts
- Include relevant context
- Provide direct links
- Suggest remediation steps
- Include runbook references

### 3. Alert Routing
- Route to appropriate teams
- Escalate critical alerts
- Use on-call schedules
- Implement alert acknowledgment

### 4. Alert Testing
- Test alert delivery regularly
- Verify notification channels
- Practice incident response
- Update contact information

## Incident Response

### Alert Response Workflow

1. **Acknowledge Alert**
   - Confirm receipt
   - Assess severity
   - Notify team if needed

2. **Investigate**
   - Check monitoring dashboards
   - Review logs
   - Identify root cause

3. **Mitigate**
   - Apply immediate fix
   - Rollback if needed
   - Scale resources if needed

4. **Resolve**
   - Verify fix
   - Update status
   - Document incident

5. **Post-Mortem**
   - Analyze root cause
   - Identify improvements
   - Update runbooks
   - Implement preventive measures

## Resources

- [UptimeRobot Documentation](https://uptimerobot.com/api/)
- [Railway Notifications](https://docs.railway.app/reference/notifications)
- [Vercel Integrations](https://vercel.com/docs/integrations)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
