# Error Logging & Monitoring System

## Overview

The upsurgeIQ platform includes a comprehensive error logging and monitoring system that captures, stores, and displays errors and system events for debugging and operational monitoring.

## Features

- **Structured Logging** - Consistent log format with timestamps, severity levels, and context
- **Database Storage** - All logs stored in the database for historical analysis
- **Admin Dashboard** - Web interface for viewing and filtering logs
- **Statistics** - Real-time error statistics by level and component
- **Role-Based Access** - Only admin users can view error logs
- **Automatic Cleanup** - Old logs can be automatically deleted

## Architecture

### Components

1. **Logger Utility** (`server/_core/logger.ts`) - Core logging functionality
2. **Database Schema** (`drizzle/schema.ts`) - `error_logs` table
3. **Database Helpers** (`server/errorLogs.ts`) - Query functions
4. **tRPC Router** (`server/routers.ts`) - API endpoints
5. **Admin Dashboard** (`client/src/pages/ErrorLogs.tsx`) - Web UI

### Log Levels

- **error** - Critical errors that need immediate attention
- **warn** - Warning conditions that should be reviewed
- **info** - Informational messages about system operation
- **debug** - Detailed debugging information (development only)

## Usage

### Creating a Logger

```typescript
import { createLogger } from "./server/_core/logger";

const logger = createLogger("ComponentName");
```

### Logging Messages

```typescript
// Info message
logger.info("User logged in successfully", {
  userId: user.id,
  action: "login",
});

// Warning
logger.warn("API rate limit approaching", {
  userId: user.id,
  metadata: { requestCount: 95, limit: 100 },
});

// Error with stack trace
try {
  await riskyOperation();
} catch (error) {
  logger.error("Operation failed", error as Error, {
    userId: user.id,
    action: "riskyOperation",
    metadata: { attemptNumber: 3 },
  });
}

// Debug (only in development)
logger.debug("Processing request", {
  metadata: { requestId: "abc123", payload: data },
});
```

### Log Context

Each log entry can include contextual information:

```typescript
interface LogContext {
  userId?: number;           // User who triggered the action
  requestId?: string;        // Unique request identifier
  component?: string;        // Component/module name (auto-set)
  action?: string;           // Specific action being performed
  metadata?: Record<string, any>; // Additional structured data
}
```

## Accessing Logs

### Admin Dashboard

1. Log in as an admin user
2. Navigate to **Error Logs** in the dashboard navigation
3. View recent logs, filter by level, and expand for details

### API Access

```typescript
// Get recent logs
const logs = await trpc.errorLogs.list.useQuery({
  limit: 100,
  level: "error", // optional filter
  component: "Authentication", // optional filter
});

// Get statistics
const stats = await trpc.errorLogs.stats.useQuery();
// Returns: { total, byLevel: {}, byComponent: {} }
```

## Best Practices

### When to Log

**DO log:**
- Authentication failures
- Payment processing errors
- API integration failures
- Database connection issues
- User-facing errors
- Critical business logic failures

**DON'T log:**
- Successful operations (unless significant)
- Sensitive data (passwords, tokens, credit cards)
- High-frequency events that will flood logs
- Expected validation errors

### Error Context

Always include relevant context:

```typescript
// ❌ Bad - no context
logger.error("Payment failed", error);

// ✅ Good - includes context
logger.error("Stripe payment failed", error, {
  userId: user.id,
  action: "createCheckoutSession",
  metadata: {
    tier: "pro",
    amount: 9900,
    stripeCustomerId: customer.id,
  },
});
```

### Component Names

Use clear, consistent component names:

```typescript
// Good examples
createLogger("Authentication")
createLogger("StripeWebhook")
createLogger("PressReleaseGeneration")
createLogger("AIAssistant")

// Avoid
createLogger("auth") // too vague
createLogger("stripe_webhook_handler") // inconsistent naming
```

## Database Schema

```sql
CREATE TABLE error_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  level ENUM('info', 'warn', 'error', 'debug') NOT NULL,
  message TEXT NOT NULL,
  userId INT NULL,
  component VARCHAR(100),
  action VARCHAR(100),
  errorStack TEXT,
  metadata TEXT, -- JSON string
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Maintenance

### Cleaning Old Logs

```typescript
import { deleteOldErrorLogs } from "./server/errorLogs";

// Delete logs older than 30 days
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
await deleteOldErrorLogs(thirtyDaysAgo);
```

Consider setting up a scheduled job to run this weekly.

### Monitoring

Check the Error Logs dashboard regularly for:

1. **Spike in errors** - Indicates a new bug or system issue
2. **Recurring errors** - Patterns that need fixing
3. **Component breakdown** - Which parts of the system have the most issues

## Integration Examples

### Authentication Flow

```typescript
import { createLogger } from "./_core/logger";

const logger = createLogger("Authentication");

export async function handleOAuthCallback(code: string) {
  try {
    const tokens = await exchangeCodeForTokens(code);
    logger.info("OAuth authentication successful", {
      action: "oauthCallback",
    });
    return tokens;
  } catch (error) {
    logger.error("OAuth authentication failed", error as Error, {
      action: "oauthCallback",
      metadata: { code: code.substring(0, 10) + "..." },
    });
    throw error;
  }
}
```

### Payment Processing

```typescript
import { createLogger } from "./_core/logger";

const logger = createLogger("StripePayment");

export async function createCheckoutSession(params: CheckoutParams) {
  logger.info("Creating Stripe checkout session", {
    userId: params.userId,
    action: "createCheckout",
    metadata: { tier: params.tier, priceId: params.priceId },
  });

  try {
    const session = await stripe.checkout.sessions.create({...});
    
    logger.info("Checkout session created successfully", {
      userId: params.userId,
      action: "createCheckout",
      metadata: { sessionId: session.id },
    });
    
    return session;
  } catch (error) {
    logger.error("Failed to create checkout session", error as Error, {
      userId: params.userId,
      action: "createCheckout",
      metadata: { tier: params.tier },
    });
    throw error;
  }
}
```

### AI Content Generation

```typescript
import { createLogger } from "./_core/logger";

const logger = createLogger("PressReleaseGeneration");

export async function generatePressRelease(input: PressReleaseInput) {
  logger.info("Starting press release generation", {
    userId: input.userId,
    action: "generate",
    metadata: { topic: input.topic },
  });

  try {
    const response = await invokeLLM({
      messages: [...],
    });
    
    logger.info("Press release generated successfully", {
      userId: input.userId,
      action: "generate",
      metadata: { 
        topic: input.topic,
        wordCount: response.choices[0].message.content.length 
      },
    });
    
    return response;
  } catch (error) {
    logger.error("Press release generation failed", error as Error, {
      userId: input.userId,
      action: "generate",
      metadata: { topic: input.topic },
    });
    throw error;
  }
}
```

## Troubleshooting

### Logs Not Appearing in Dashboard

1. Check that the user is logged in as admin (`role = 'admin'`)
2. Verify database connection is working
3. Check browser console for API errors
4. Ensure `error_logs` table exists in database

### Database Storage Failing

The logger is designed to never crash the application. If database storage fails:

1. Logs still appear in console/terminal
2. Error is logged to console: `[Logger] Failed to store log in database`
3. Check database connection and credentials
4. Verify `error_logs` table schema matches expected structure

### Too Many Logs

If logs are growing too quickly:

1. Review log levels - reduce `info` and `debug` logging
2. Implement log sampling for high-frequency events
3. Set up automatic cleanup job
4. Consider external log aggregation service (Sentry, LogRocket)

## Future Enhancements

Potential improvements to consider:

- [ ] Email/Slack alerts for critical errors
- [ ] Log export functionality (CSV, JSON)
- [ ] Integration with external monitoring services (Sentry)
- [ ] Real-time log streaming via WebSocket
- [ ] Advanced search and filtering
- [ ] Log retention policies
- [ ] Performance metrics and APM integration

## Support

For questions or issues with the logging system:

1. Check this documentation
2. Review the test files for usage examples
3. Contact the development team
4. Submit feedback at https://help.manus.im
