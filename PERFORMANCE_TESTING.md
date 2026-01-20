# Performance Testing Guide

## Overview

This document provides comprehensive performance testing procedures for the Modern Office System, including load testing, database performance, and real-time feature performance validation.

**Requirements Validated:** 12.4, 12.5

## Performance Testing Tools

### Required Tools
- **Artillery** - Load testing and performance testing
- **Lighthouse** - Frontend performance auditing
- **k6** - Load testing alternative
- **Chrome DevTools** - Performance profiling
- **Supabase Dashboard** - Database performance monitoring

### Installation

```bash
# Install Artillery for load testing
npm install -g artillery

# Install Lighthouse
npm install -g lighthouse

# Install k6 (optional)
# Download from https://k6.io/docs/getting-started/installation/
```

## 1. Load Testing with Multiple Users

### Test Scenario 1: Concurrent User Login

**Objective:** Test system performance with multiple simultaneous logins

**Requirements:** 12.4, 12.5

Create `artillery-config/login-load-test.yml`:

```yaml
config:
  target: "https://your-backend-url.railway.app"
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 20
      name: "Ramp up load"
    - duration: 180
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 10
      name: "Cool down"
  processor: "./load-test-functions.js"

scenarios:
  - name: "User Login Flow"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ $randomEmail() }}"
            password: "testpassword123"
          capture:
            - json: "$.token"
              as: "authToken"
      - think: 2
      - get:
          url: "/api/tasks"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - think: 3
      - get:
          url: "/api/issues"
          headers:
            Authorization: "Bearer {{ authToken }}"
```

### Test Scenario 2: Task Operations Under Load

Create `artillery-config/task-operations-test.yml`:

```yaml
config:
  target: "https://your-backend-url.railway.app"
  phases:
    - duration: 120
      arrivalRate: 30
      name: "Task operations load"
  variables:
    authToken: "{{ $env.TEST_AUTH_TOKEN }}"

scenarios:
  - name: "Task CRUD Operations"
    flow:
      # Create task
      - post:
          url: "/api/tasks"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            title: "Load Test Task {{ $randomString() }}"
            description: "Performance testing task"
            category: "project"
            priority: "medium"
          capture:
            - json: "$.id"
              as: "taskId"
      
      # Read task
      - get:
          url: "/api/tasks/{{ taskId }}"
          headers:
            Authorization: "Bearer {{ authToken }}"
      
      # Update task
      - put:
          url: "/api/tasks/{{ taskId }}"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            status: "in_progress"
            progress_percentage: 50
      
      # List tasks
      - get:
          url: "/api/tasks?status=in_progress"
          headers:
            Authorization: "Bearer {{ authToken }}"
```

### Test Scenario 3: Issue Management Load

Create `artillery-config/issue-management-test.yml`:

```yaml
config:
  target: "https://your-backend-url.railway.app"
  phases:
    - duration: 180
      arrivalRate: 25
      name: "Issue management load"
  variables:
    employeeToken: "{{ $env.EMPLOYEE_TOKEN }}"
    adminToken: "{{ $env.ADMIN_TOKEN }}"

scenarios:
  - name: "Employee Creates Issues"
    weight: 70
    flow:
      - post:
          url: "/api/issues"
          headers:
            Authorization: "Bearer {{ employeeToken }}"
          json:
            title: "Load Test Issue {{ $randomString() }}"
            description: "Performance testing issue"
            priority: "high"
            suggested_assignee_id: "{{ $randomUUID() }}"
          capture:
            - json: "$.id"
              as: "issueId"
      
      - get:
          url: "/api/issues/{{ issueId }}"
          headers:
            Authorization: "Bearer {{ employeeToken }}"

  - name: "Admin Assigns Issues"
    weight: 30
    flow:
      - get:
          url: "/api/admin/issues?status=pending_assignment"
          headers:
            Authorization: "Bearer {{ adminToken }}"
          capture:
            - json: "$[0].id"
              as: "pendingIssueId"
      
      - put:
          url: "/api/issues/{{ pendingIssueId }}/assign"
          headers:
            Authorization: "Bearer {{ adminToken }}"
          json:
            assignee_id: "{{ $randomUUID() }}"
```

### Running Load Tests

```bash
# Run login load test
artillery run artillery-config/login-load-test.yml --output login-results.json

# Generate HTML report
artillery report login-results.json --output login-report.html

# Run task operations test
artillery run artillery-config/task-operations-test.yml --output task-results.json

# Run issue management test
artillery run artillery-config/issue-management-test.yml --output issue-results.json
```

### Performance Metrics to Monitor

**Response Time Targets:**
- Login: < 500ms (p95)
- Task List: < 300ms (p95)
- Task Create: < 400ms (p95)
- Issue Create: < 400ms (p95)
- Issue Assignment: < 500ms (p95)

**Throughput Targets:**
- Minimum: 100 requests/second
- Target: 200 requests/second
- Maximum: 500 requests/second

**Error Rate:**
- Target: < 0.1%
- Maximum acceptable: < 1%

---

## 2. Database Performance Testing

### Query Performance Monitoring

Create `backend/src/test/database-performance.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '../services/supabase';

describe('Database Performance Tests', () => {
  beforeAll(async () => {
    // Ensure test data exists
    console.log('Setting up performance test data...');
  });

  it('should fetch tasks list within 200ms', async () => {
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .limit(50);
    
    const duration = Date.now() - startTime;
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(duration).toBeLessThan(200);
    
    console.log(`Task list query took ${duration}ms`);
  });

  it('should fetch tasks with filters within 250ms', async () => {
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'in_progress')
      .eq('priority', 'high')
      .limit(50);
    
    const duration = Date.now() - startTime;
    
    expect(error).toBeNull();
    expect(duration).toBeLessThan(250);
    
    console.log(`Filtered task query took ${duration}ms`);
  });

  it('should fetch tasks with joins within 300ms', async () => {
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to:profiles!tasks_assigned_to_fkey(full_name, email),
        created_by:profiles!tasks_created_by_fkey(full_name)
      `)
      .limit(50);
    
    const duration = Date.now() - startTime;
    
    expect(error).toBeNull();
    expect(duration).toBeLessThan(300);
    
    console.log(`Task query with joins took ${duration}ms`);
  });

  it('should fetch issues with suggested assignee within 250ms', async () => {
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('issues')
      .select(`
        *,
        suggested_assignee:profiles!issues_suggested_assignee_id_fkey(full_name, email),
        reported_by:profiles!issues_reported_by_fkey(full_name)
      `)
      .eq('status', 'pending_assignment')
      .limit(50);
    
    const duration = Date.now() - startTime;
    
    expect(error).toBeNull();
    expect(duration).toBeLessThan(250);
    
    console.log(`Issue query with joins took ${duration}ms`);
  });

  it('should perform analytics aggregation within 500ms', async () => {
    const startTime = Date.now();
    
    // Simulate analytics query
    const { data, error } = await supabase
      .rpc('get_task_statistics', {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date().toISOString()
      });
    
    const duration = Date.now() - startTime;
    
    expect(error).toBeNull();
    expect(duration).toBeLessThan(500);
    
    console.log(`Analytics aggregation took ${duration}ms`);
  });

  it('should handle concurrent reads efficiently', async () => {
    const startTime = Date.now();
    
    // Simulate 10 concurrent queries
    const promises = Array(10).fill(null).map(() =>
      supabase.from('tasks').select('*').limit(20)
    );
    
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    results.forEach(({ error }) => {
      expect(error).toBeNull();
    });
    
    // All 10 queries should complete within 1 second
    expect(duration).toBeLessThan(1000);
    
    console.log(`10 concurrent queries took ${duration}ms`);
  });

  it('should handle concurrent writes efficiently', async () => {
    const startTime = Date.now();
    
    // Simulate 5 concurrent inserts
    const promises = Array(5).fill(null).map((_, i) =>
      supabase.from('tasks').insert({
        title: `Performance Test Task ${i}`,
        description: 'Testing concurrent writes',
        category: 'project',
        priority: 'medium',
        status: 'not_started'
      })
    );
    
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    results.forEach(({ error }) => {
      expect(error).toBeNull();
    });
    
    // All 5 inserts should complete within 1 second
    expect(duration).toBeLessThan(1000);
    
    console.log(`5 concurrent inserts took ${duration}ms`);
  });
});
```

### Database Index Verification

Create `backend/src/test/database-indexes.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { supabase } from '../services/supabase';

describe('Database Index Performance', () => {
  it('should verify tasks table has proper indexes', async () => {
    // Query to check if indexes exist
    const { data, error } = await supabase
      .rpc('check_table_indexes', { table_name: 'tasks' });
    
    expect(error).toBeNull();
    
    // Verify key indexes exist
    const indexNames = data?.map((idx: any) => idx.indexname) || [];
    
    expect(indexNames).toContain('tasks_assigned_to_idx');
    expect(indexNames).toContain('tasks_status_idx');
    expect(indexNames).toContain('tasks_created_at_idx');
  });

  it('should verify issues table has proper indexes', async () => {
    const { data, error } = await supabase
      .rpc('check_table_indexes', { table_name: 'issues' });
    
    expect(error).toBeNull();
    
    const indexNames = data?.map((idx: any) => idx.indexname) || [];
    
    expect(indexNames).toContain('issues_status_idx');
    expect(indexNames).toContain('issues_suggested_assignee_id_idx');
    expect(indexNames).toContain('issues_reported_by_idx');
  });
});
```

---

## 3. Real-time Feature Performance

### WebSocket Connection Testing

Create `frontend/src/test/realtime-performance.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../services/supabase';

describe('Real-time Performance Tests', () => {
  it('should establish realtime connection within 2 seconds', async () => {
    const startTime = Date.now();
    
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Change received:', payload);
        }
      );
    
    await channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(2000);
        console.log(`Realtime connection established in ${duration}ms`);
      }
    });
    
    // Cleanup
    await channel.unsubscribe();
  });

  it('should receive updates within 1 second', async () => {
    const updateReceived = vi.fn();
    let updateTime = 0;
    
    const channel = supabase
      .channel('update-test')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks' },
        (payload) => {
          updateTime = Date.now();
          updateReceived(payload);
        }
      );
    
    await channel.subscribe();
    
    // Trigger an update
    const insertTime = Date.now();
    await supabase
      .from('tasks')
      .update({ status: 'in_progress' })
      .eq('id', 'test-task-id');
    
    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    expect(updateReceived).toHaveBeenCalled();
    
    const latency = updateTime - insertTime;
    expect(latency).toBeLessThan(1000);
    
    console.log(`Update received in ${latency}ms`);
    
    await channel.unsubscribe();
  });

  it('should handle multiple concurrent subscriptions', async () => {
    const channels = Array(10).fill(null).map((_, i) =>
      supabase
        .channel(`concurrent-${i}`)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          () => {}
        )
    );
    
    const startTime = Date.now();
    
    await Promise.all(channels.map(ch => ch.subscribe()));
    
    const duration = Date.now() - startTime;
    
    // All 10 subscriptions should complete within 5 seconds
    expect(duration).toBeLessThan(5000);
    
    console.log(`10 concurrent subscriptions established in ${duration}ms`);
    
    // Cleanup
    await Promise.all(channels.map(ch => ch.unsubscribe()));
  });
});
```

---

## 4. Frontend Performance Testing

### Lighthouse Performance Audit

Create `performance-scripts/lighthouse-audit.js`:

```javascript
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance'],
    port: chrome.port,
  };
  
  const runnerResult = await lighthouse(url, options);
  
  // Save report
  const reportHtml = runnerResult.report;
  fs.writeFileSync('lighthouse-report.html', reportHtml);
  
  // Extract performance score
  const performanceScore = runnerResult.lhr.categories.performance.score * 100;
  
  console.log(`Performance Score: ${performanceScore}`);
  console.log(`First Contentful Paint: ${runnerResult.lhr.audits['first-contentful-paint'].displayValue}`);
  console.log(`Speed Index: ${runnerResult.lhr.audits['speed-index'].displayValue}`);
  console.log(`Time to Interactive: ${runnerResult.lhr.audits['interactive'].displayValue}`);
  console.log(`Total Blocking Time: ${runnerResult.lhr.audits['total-blocking-time'].displayValue}`);
  console.log(`Cumulative Layout Shift: ${runnerResult.lhr.audits['cumulative-layout-shift'].displayValue}`);
  
  await chrome.kill();
  
  // Assert performance score
  if (performanceScore < 80) {
    throw new Error(`Performance score ${performanceScore} is below threshold of 80`);
  }
  
  return performanceScore;
}

// Run for different pages
const pages = [
  'http://localhost:5173/',
  'http://localhost:5173/login',
  'http://localhost:5173/dashboard',
  'http://localhost:5173/tasks',
  'http://localhost:5173/issues',
];

(async () => {
  for (const page of pages) {
    console.log(`\nTesting ${page}...`);
    try {
      await runLighthouse(page);
    } catch (error) {
      console.error(`Error testing ${page}:`, error.message);
    }
  }
})();
```

### Bundle Size Analysis

Create `performance-scripts/analyze-bundle.js`:

```javascript
const fs = require('fs');
const path = require('path');

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  });
  
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

const distPath = path.join(__dirname, '../frontend/dist');

if (!fs.existsSync(distPath)) {
  console.error('Build directory not found. Run npm run build first.');
  process.exit(1);
}

const totalSize = getDirectorySize(distPath);

console.log('\n=== Bundle Size Analysis ===');
console.log(`Total bundle size: ${formatBytes(totalSize)}`);

// Check if bundle size is acceptable (< 2MB)
const maxSize = 2 * 1024 * 1024; // 2MB
if (totalSize > maxSize) {
  console.warn(`⚠️  Bundle size exceeds ${formatBytes(maxSize)}`);
} else {
  console.log(`✓ Bundle size is within acceptable limits`);
}

// Analyze individual chunks
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  console.log('\n=== Individual Chunks ===');
  const files = fs.readdirSync(assetsPath);
  
  files.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    console.log(`${file}: ${formatBytes(stats.size)}`);
  });
}
```

---

## 5. Performance Test Execution Plan

### Pre-Test Checklist

- [ ] Deploy application to staging environment
- [ ] Ensure database has representative data (at least 1000 tasks, 500 issues)
- [ ] Configure monitoring tools (Supabase dashboard, Railway metrics)
- [ ] Set up test user accounts
- [ ] Clear caches and restart services

### Test Execution Steps

1. **Baseline Performance Test**
   ```bash
   # Run with 10 concurrent users
   artillery run artillery-config/login-load-test.yml
   ```

2. **Incremental Load Test**
   ```bash
   # Gradually increase to 50 concurrent users
   artillery run artillery-config/task-operations-test.yml
   ```

3. **Peak Load Test**
   ```bash
   # Test with 100+ concurrent users
   artillery run artillery-config/issue-management-test.yml
   ```

4. **Database Performance Test**
   ```bash
   cd backend
   npm run test -- database-performance.test.ts
   ```

5. **Real-time Performance Test**
   ```bash
   cd frontend
   npm run test -- realtime-performance.test.ts
   ```

6. **Frontend Performance Audit**
   ```bash
   node performance-scripts/lighthouse-audit.js
   ```

7. **Bundle Size Analysis**
   ```bash
   npm run build
   node performance-scripts/analyze-bundle.js
   ```

### Performance Benchmarks

**Target Performance Metrics:**

| Metric | Target | Maximum Acceptable |
|--------|--------|-------------------|
| Page Load Time | < 2s | < 3s |
| API Response Time (p95) | < 300ms | < 500ms |
| Database Query Time | < 200ms | < 300ms |
| Real-time Update Latency | < 500ms | < 1s |
| Concurrent Users | 50+ | 100+ |
| Error Rate | < 0.1% | < 1% |
| Bundle Size | < 1.5MB | < 2MB |
| Lighthouse Performance Score | > 90 | > 80 |

---

## 6. Performance Monitoring Dashboard

### Key Metrics to Monitor

1. **Application Metrics**
   - Request rate (requests/second)
   - Response time (p50, p95, p99)
   - Error rate
   - Active connections

2. **Database Metrics**
   - Query execution time
   - Connection pool usage
   - Cache hit rate
   - Active queries

3. **Real-time Metrics**
   - WebSocket connections
   - Message delivery latency
   - Subscription count
   - Connection drops

4. **Infrastructure Metrics**
   - CPU usage
   - Memory usage
   - Network I/O
   - Disk I/O

### Monitoring Tools Setup

**Supabase Dashboard:**
- Monitor database performance
- Track query execution times
- View connection statistics

**Railway Dashboard:**
- Monitor backend service health
- Track resource usage
- View deployment logs

**Vercel Analytics:**
- Monitor frontend performance
- Track Core Web Vitals
- View user experience metrics

---

## 7. Performance Optimization Recommendations

### If Response Times Are Slow

1. **Database Optimization**
   - Add missing indexes
   - Optimize complex queries
   - Implement query result caching
   - Use database connection pooling

2. **API Optimization**
   - Implement response caching
   - Use pagination for large datasets
   - Optimize JSON serialization
   - Enable gzip compression

3. **Frontend Optimization**
   - Implement code splitting
   - Lazy load components
   - Optimize images
   - Use service worker caching

### If Real-time Updates Are Slow

1. **WebSocket Optimization**
   - Reduce subscription scope
   - Batch updates
   - Implement debouncing
   - Optimize payload size

2. **Network Optimization**
   - Use CDN for static assets
   - Enable HTTP/2
   - Minimize round trips
   - Implement connection pooling

---

## Test Results Template

### Performance Test Report

**Test Date:** _______________
**Environment:** _______________
**Tester:** _______________

#### Load Test Results

| Test Scenario | Concurrent Users | Avg Response Time | p95 Response Time | Error Rate | Status |
|--------------|------------------|-------------------|-------------------|------------|--------|
| Login | 50 | ___ ms | ___ ms | ___% | ☐ Pass ☐ Fail |
| Task Operations | 50 | ___ ms | ___ ms | ___% | ☐ Pass ☐ Fail |
| Issue Management | 50 | ___ ms | ___ ms | ___% | ☐ Pass ☐ Fail |

#### Database Performance Results

| Query Type | Execution Time | Status |
|-----------|----------------|--------|
| Task List | ___ ms | ☐ Pass ☐ Fail |
| Filtered Tasks | ___ ms | ☐ Pass ☐ Fail |
| Tasks with Joins | ___ ms | ☐ Pass ☐ Fail |
| Analytics Aggregation | ___ ms | ☐ Pass ☐ Fail |

#### Frontend Performance Results

| Page | Lighthouse Score | FCP | TTI | Status |
|------|-----------------|-----|-----|--------|
| Login | ___ | ___ | ___ | ☐ Pass ☐ Fail |
| Dashboard | ___ | ___ | ___ | ☐ Pass ☐ Fail |
| Tasks | ___ | ___ | ___ | ☐ Pass ☐ Fail |
| Issues | ___ | ___ | ___ | ☐ Pass ☐ Fail |

#### Issues Found

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

#### Recommendations

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Overall Status:** ☐ Pass ☐ Fail ☐ Needs Improvement
