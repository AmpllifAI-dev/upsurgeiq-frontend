# UpsurgeIQ Monitoring and Alerting Guide

**Version:** 1.0  
**Last Updated:** December 26, 2025  
**Purpose:** Configure comprehensive monitoring and alerting for production

---

## Overview

This guide provides recommendations for monitoring UpsurgeIQ in production, including error tracking, performance monitoring, database health, and alerting thresholds.

---

## 1. Error Tracking (Sentry)

### Why Sentry?

- Real-time error tracking and reporting
- Source map support for debugging minified code
- User context and breadcrumbs
- Performance monitoring
- Release tracking
- Integrations with Slack, email, PagerDuty

### Setup Instructions

**Step 1: Create Sentry Account**

1. Go to: https://sentry.io/signup/
2. Create organization: "UpsurgeIQ"
3. Create project: "upsurgeiq-frontend"
4. Select platform: "Node.js" and "React"

**Step 2: Install Sentry SDK**

```bash
pnpm add @sentry/node @sentry/react @sentry/tracing
```

**Step 3: Configure Backend (Server)**

Create `server/_core/sentry.ts`:

```typescript
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

export function initSentry() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Sentry] Skipping initialization in development");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.APP_VERSION || "unknown",
    
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
    
    // Profiling
    profilesSampleRate: 1.0, // Profile 100% of sampled transactions
    integrations: [
      new ProfilingIntegration(),
    ],
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      
      // Remove sensitive query parameters
      if (event.request?.query_string) {
        event.request.query_string = event.request.query_string
          .replace(/token=[^&]*/g, "token=REDACTED")
          .replace(/key=[^&]*/g, "key=REDACTED");
      }
      
      return event;
    },
  });
}

// Error handler middleware
export function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler();
}

// Request handler middleware
export function sentryRequestHandler() {
  return Sentry.Handlers.requestHandler();
}
```

**Step 4: Initialize in Server**

Update `server/_core/index.ts`:

```typescript
import { initSentry, sentryRequestHandler, sentryErrorHandler } from "./sentry";

// Initialize Sentry first
initSentry();

// Add request handler early in middleware chain
app.use(sentryRequestHandler());

// ... other middleware ...

// Add error handler last (before final error handler)
app.use(sentryErrorHandler());
```

**Step 5: Configure Frontend (Client)**

Create `client/src/lib/sentry.ts`:

```typescript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export function initSentry() {
  if (import.meta.env.MODE !== "production") {
    console.log("[Sentry] Skipping initialization in development");
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || "unknown",
    
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.data?.password) {
            breadcrumb.data.password = "REDACTED";
          }
          if (breadcrumb.data?.token) {
            breadcrumb.data.token = "REDACTED";
          }
          return breadcrumb;
        });
      }
      
      return event;
    },
  });
}
```

Initialize in `client/src/main.tsx`:

```typescript
import { initSentry } from "./lib/sentry";

// Initialize Sentry before React
initSentry();

// ... rest of app initialization
```

**Step 6: Add Environment Variables**

```bash
# Backend
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
APP_VERSION=1.0.0

# Frontend
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
VITE_APP_VERSION=1.0.0
```

**Step 7: Test Error Tracking**

```typescript
// Test backend error
throw new Error("Test Sentry backend error");

// Test frontend error
throw new Error("Test Sentry frontend error");
```

---

## 2. Database Connection Monitoring

### Connection Pool Monitoring

**Create `server/monitoring/database.ts`:**

```typescript
import { getDb } from "../db";
import * as Sentry from "@sentry/node";

export async function monitorDatabaseHealth() {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }
    
    // Test query
    await db.execute("SELECT 1");
    
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error("[Database Monitor] Health check failed:", error);
    
    return {
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// Run health check every 5 minutes
setInterval(async () => {
  const health = await monitorDatabaseHealth();
  
  if (health.status === "unhealthy") {
    // Send alert
    console.error("[Database Monitor] Database is unhealthy!");
    
    // Optionally send email alert
    // await sendAlertEmail("Database Health Alert", health);
  }
}, 5 * 60 * 1000);
```

**Add Health Check Endpoint:**

Update `server/routers.ts`:

```typescript
export const healthRouter = router({
  check: publicProcedure.query(async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
  
  database: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    
    await db.execute("SELECT 1");
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
  
  stripe: publicProcedure.query(async () => {
    // Test Stripe API
    const stripe = new Stripe(ENV.stripeSecretKey);
    await stripe.products.list({ limit: 1 });
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
  
  email: publicProcedure.query(async () => {
    // Test SendGrid API
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(ENV.sendGridApiKey);
    // Don't actually send, just verify API key is valid
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
});
```

---

## 3. API Response Time Tracking

### Using Sentry Performance Monitoring

Sentry automatically tracks API response times with the configuration above.

**Custom Performance Tracking:**

```typescript
// In API handlers
import * as Sentry from "@sentry/node";

export const myProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const transaction = Sentry.startTransaction({
      op: "query",
      name: "myProcedure",
    });
    
    try {
      // Your logic here
      const result = await someOperation();
      
      transaction.setStatus("ok");
      return result;
    } catch (error) {
      transaction.setStatus("internal_error");
      throw error;
    } finally {
      transaction.finish();
    }
  });
```

### Response Time Thresholds

**Alert if:**
- Average API response time > 1 second
- 95th percentile > 2 seconds
- Any endpoint > 5 seconds

**Configure in Sentry:**
1. Go to Performance → Alerts
2. Create alert: "API Response Time"
3. Condition: "Average transaction duration > 1000ms"
4. Action: Send email to christopher@upsurgeiq.com

---

## 4. Scheduled Job Monitoring

### Usage Notifications Job

**Add Monitoring to `server/jobs/usageNotificationsJob.ts`:**

```typescript
import * as Sentry from "@sentry/node";

async function checkUsageThresholds() {
  const transaction = Sentry.startTransaction({
    op: "job",
    name: "usageNotificationsJob",
  });
  
  try {
    console.log("[UsageNotificationsJob] Starting daily check...");
    
    // Your existing logic
    const users = await getAllUsers();
    let notificationsSent = 0;
    
    for (const user of users) {
      // Check thresholds and send notifications
      const sent = await checkAndNotifyUser(user);
      if (sent) notificationsSent++;
    }
    
    console.log(`[UsageNotificationsJob] Completed. Sent ${notificationsSent} notifications.`);
    
    // Track success
    Sentry.captureMessage(`Usage notifications job completed: ${notificationsSent} sent`, "info");
    transaction.setStatus("ok");
    
  } catch (error) {
    console.error("[UsageNotificationsJob] Error:", error);
    Sentry.captureException(error);
    transaction.setStatus("internal_error");
    
    // Send alert email
    await sendAlertEmail(
      "Usage Notifications Job Failed",
      `The daily usage notifications job failed with error: ${error.message}`
    );
  } finally {
    transaction.finish();
  }
}
```

**Job Success Rate Monitoring:**

Create `server/monitoring/jobs.ts`:

```typescript
interface JobExecution {
  jobName: string;
  status: "success" | "failure";
  timestamp: Date;
  duration: number;
  error?: string;
}

const jobExecutions: JobExecution[] = [];

export function recordJobExecution(execution: JobExecution) {
  jobExecutions.push(execution);
  
  // Keep only last 100 executions
  if (jobExecutions.length > 100) {
    jobExecutions.shift();
  }
  
  // Check success rate
  const recentExecutions = jobExecutions.slice(-10);
  const successRate = recentExecutions.filter(e => e.status === "success").length / recentExecutions.length;
  
  if (successRate < 0.8) {
    // Less than 80% success rate
    Sentry.captureMessage(
      `Job ${execution.jobName} has low success rate: ${(successRate * 100).toFixed(0)}%`,
      "warning"
    );
  }
}

export function getJobStats(jobName: string) {
  const executions = jobExecutions.filter(e => e.jobName === jobName);
  const successes = executions.filter(e => e.status === "success").length;
  
  return {
    totalExecutions: executions.length,
    successes,
    failures: executions.length - successes,
    successRate: executions.length > 0 ? successes / executions.length : 0,
    averageDuration: executions.reduce((sum, e) => sum + e.duration, 0) / executions.length,
  };
}
```

---

## 5. Alert Thresholds Configuration

### Critical Alerts (Immediate Action Required)

**Trigger immediate alerts for:**

1. **Application Down**
   - Health check endpoint returns 5xx error
   - No response for 1 minute
   - **Action:** Page on-call engineer

2. **Database Connection Lost**
   - Cannot connect to database
   - Connection pool exhausted
   - **Action:** Page database administrator

3. **Payment Processing Failure**
   - Stripe webhook failures > 5 in 10 minutes
   - Payment success rate < 90%
   - **Action:** Alert Christopher immediately

4. **Email Service Down**
   - SendGrid API errors > 10 in 5 minutes
   - Email delivery rate < 80%
   - **Action:** Alert technical team

5. **Security Incident**
   - Unusual number of failed login attempts (> 100/hour)
   - Suspicious API activity
   - **Action:** Alert security team

### Warning Alerts (Monitor and Investigate)

**Trigger warning alerts for:**

1. **High Error Rate**
   - Error rate > 1% of requests
   - Same error occurring > 10 times in 1 hour
   - **Action:** Review error logs

2. **Slow Response Times**
   - Average API response time > 1 second
   - 95th percentile > 2 seconds
   - **Action:** Investigate performance

3. **High Database Load**
   - Slow queries > 1 second
   - Connection pool usage > 80%
   - **Action:** Optimize queries

4. **Low Success Rate**
   - Scheduled job success rate < 90%
   - Webhook success rate < 95%
   - **Action:** Investigate failures

5. **Resource Usage**
   - Memory usage > 80%
   - CPU usage > 80% for > 5 minutes
   - Disk space < 20%
   - **Action:** Scale resources

### Sentry Alert Configuration

**Create Alerts in Sentry:**

1. Go to: Alerts → Create Alert Rule

2. **Critical: Application Errors**
   - Condition: "Error count > 10 in 5 minutes"
   - Action: Email christopher@upsurgeiq.com
   - Action: Slack notification

3. **Warning: High Error Rate**
   - Condition: "Error rate > 1% in 1 hour"
   - Action: Email technical team

4. **Performance: Slow Transactions**
   - Condition: "Average transaction duration > 1000ms"
   - Action: Email technical team

---

## 6. Uptime Monitoring (External)

### Recommended Services

**Option 1: UptimeRobot (Free)**

1. Go to: https://uptimerobot.com/
2. Create monitor:
   - Type: HTTP(s)
   - URL: https://upsurgeiq.com/api/health
   - Interval: 5 minutes
3. Add alert contacts:
   - Email: christopher@upsurgeiq.com
   - SMS: (optional)

**Option 2: Pingdom**

1. Go to: https://www.pingdom.com/
2. Create uptime check:
   - URL: https://upsurgeiq.com/api/health
   - Interval: 1 minute
3. Configure alerts

**Option 3: StatusCake**

1. Go to: https://www.statuscake.com/
2. Create test:
   - URL: https://upsurgeiq.com/api/health
   - Check rate: 5 minutes
3. Add contact groups

---

## 7. Log Management

### Structured Logging

**Create `server/_core/logger.ts`:**

```typescript
import winston from "winston";
import * as Sentry from "@sentry/node";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "upsurgeiq" },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    
    // Write all logs to file
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

// Send errors to Sentry
logger.on("data", (info) => {
  if (info.level === "error") {
    Sentry.captureException(info.error || new Error(info.message));
  }
});

export function createLogger(module: string) {
  return {
    info: (message: string, meta?: any) => {
      logger.info(message, { module, ...meta });
    },
    warn: (message: string, meta?: any) => {
      logger.warn(message, { module, ...meta });
    },
    error: (message: string, error?: Error, meta?: any) => {
      logger.error(message, { module, error, ...meta });
    },
    debug: (message: string, meta?: any) => {
      logger.debug(message, { module, ...meta });
    },
  };
}
```

**Usage:**

```typescript
import { createLogger } from "./_core/logger";

const logger = createLogger("PressReleases");

logger.info("Creating press release", { userId, businessId });
logger.error("Failed to create press release", error, { userId });
```

### Log Aggregation (Optional)

**Option 1: Logtail (Recommended)**

1. Go to: https://logtail.com/
2. Create source: "UpsurgeIQ Production"
3. Install transport:
   ```bash
   pnpm add @logtail/node @logtail/winston
   ```
4. Add to logger:
   ```typescript
   import { Logtail } from "@logtail/node";
   import { LogtailTransport } from "@logtail/winston";
   
   const logtail = new Logtail(process.env.LOGTAIL_TOKEN);
   
   logger.add(new LogtailTransport(logtail));
   ```

**Option 2: Papertrail**

1. Go to: https://papertrailapp.com/
2. Create system: "UpsurgeIQ"
3. Configure syslog forwarding

---

## 8. Monitoring Dashboard

### Create Custom Dashboard

**Create `server/monitoring/dashboard.ts`:**

```typescript
import { Router } from "express";
import { getJobStats } from "./jobs";
import { monitorDatabaseHealth } from "./database";

const router = Router();

router.get("/monitoring/dashboard", async (req, res) => {
  // Require authentication
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  const dashboard = {
    timestamp: new Date().toISOString(),
    
    // Application health
    application: {
      status: "healthy",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.APP_VERSION,
    },
    
    // Database health
    database: await monitorDatabaseHealth(),
    
    // Job statistics
    jobs: {
      usageNotifications: getJobStats("usageNotificationsJob"),
    },
    
    // API statistics (from Sentry or custom tracking)
    api: {
      requestsPerMinute: 0, // TODO: Implement
      averageResponseTime: 0, // TODO: Implement
      errorRate: 0, // TODO: Implement
    },
  };
  
  res.json(dashboard);
});

export default router;
```

---

## 9. Monitoring Checklist

### Daily Checks (Automated)

- [ ] Application health check passes
- [ ] Database connection successful
- [ ] No critical errors in Sentry
- [ ] Scheduled jobs executed successfully
- [ ] Email delivery rate > 95%
- [ ] Payment processing rate > 98%

### Weekly Reviews

- [ ] Review error trends in Sentry
- [ ] Check slow query log
- [ ] Review API response times
- [ ] Check disk space usage
- [ ] Review user feedback
- [ ] Check for security alerts

### Monthly Reviews

- [ ] Analyze performance trends
- [ ] Review and optimize slow queries
- [ ] Check for memory leaks
- [ ] Review error patterns
- [ ] Update alert thresholds if needed
- [ ] Review and update documentation

---

## 10. Incident Response Procedures

### When Alert is Triggered

**Step 1: Acknowledge**
- Acknowledge alert in Sentry/PagerDuty
- Check monitoring dashboard
- Review recent deployments

**Step 2: Assess Severity**
- Critical: Affects all users, payments, or data integrity
- High: Affects subset of users or functionality
- Medium: Performance degradation
- Low: Minor issues, no user impact

**Step 3: Investigate**
- Check application logs
- Check database logs
- Check Sentry error details
- Check recent code changes

**Step 4: Mitigate**
- If deployment caused issue: Rollback
- If database issue: Scale resources or optimize queries
- If external service issue: Contact support
- If security issue: Block malicious traffic

**Step 5: Resolve**
- Fix root cause
- Deploy fix
- Verify resolution
- Update monitoring if needed

**Step 6: Post-Mortem**
- Document incident
- Identify root cause
- Implement preventive measures
- Update runbooks

---

## Environment Variables Required

```bash
# Sentry
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
APP_VERSION=1.0.0
VITE_APP_VERSION=1.0.0

# Logging (Optional)
LOG_LEVEL=info
LOGTAIL_TOKEN=your_logtail_token

# Monitoring (Optional)
MONITORING_ENABLED=true
```

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Next Review:** After first month in production