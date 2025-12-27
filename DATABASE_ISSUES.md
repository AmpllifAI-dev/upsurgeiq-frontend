# Database Issues and Solutions

**Last Updated:** December 23, 2025  
**Status:** Active Issues Requiring Attention

---

## Overview

This document details all known database issues, their symptoms, root causes, and recommended solutions. These issues should be addressed before launch to ensure stability.

---

## Issue 1: Connection Timeouts (CRITICAL)

### Symptom

```
DrizzleQueryError: Failed query: select...
cause: Error: connect ETIMEDOUT
```

### When It Occurs

- **Scheduled jobs** (press release publishing every minute)
- **High-traffic periods** (multiple concurrent requests)
- **Long-running queries** (complex joins, large result sets)
- **After periods of inactivity** (connection pool timeout)

### Root Cause

**Primary:**
- Database connection pool not configured properly
- No retry logic for transient network issues
- Scheduled jobs don't handle connection failures gracefully

**Secondary:**
- Manus MySQL/TiDB may have connection limits
- Network latency between sandbox and database
- Connection pool exhausted during high load

### Impact

- **Severity:** High
- **Frequency:** Every 1-2 minutes (visible in console logs)
- **User Impact:** Scheduled press releases may not publish on time
- **System Impact:** Error logs fill up, monitoring alerts trigger

### Current Workaround

None - errors are logged but not handled

### Recommended Solution

#### Solution 1: Add Retry Logic (Quick Fix - 2 hours)

**Location:** `server/db.ts`

```typescript
// Add retry wrapper for all database queries
export async function queryWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error: any) {
      lastError = error;
      
      // Only retry on connection timeouts
      if (error.message?.includes('ETIMEDOUT') || 
          error.message?.includes('ECONNRESET')) {
        
        if (attempt < maxRetries) {
          console.log(`Database query failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
          continue;
        }
      }
      
      // Don't retry other errors
      throw error;
    }
  }
  
  throw lastError!;
}

// Example usage in existing query
export async function getScheduledPressReleases() {
  return await queryWithRetry(async () => {
    const now = new Date();
    return await db
      .select()
      .from(pressReleases)
      .where(
        and(
          eq(pressReleases.status, 'scheduled'),
          lte(pressReleases.scheduledFor, now),
          isNotNull(pressReleases.scheduledFor)
        )
      );
  });
}
```

**Implementation Steps:**
1. Add `queryWithRetry` helper to `server/db.ts`
2. Wrap all database queries in scheduled jobs
3. Add logging for retry attempts
4. Test with intentional connection failures

**Testing:**
```bash
# Simulate connection timeout
# Temporarily block database port, verify retries work
```

#### Solution 2: Configure Connection Pool (Medium Fix - 4 hours)

**Location:** `server/_core/db.ts` or wherever Drizzle is initialized

```typescript
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

// Create connection pool with proper settings
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 10,          // Max concurrent connections
  waitForConnections: true,     // Queue requests when pool is full
  queueLimit: 0,                // Unlimited queue
  enableKeepAlive: true,        // Keep connections alive
  keepAliveInitialDelay: 0,     // Start keepalive immediately
  connectTimeout: 10000,        // 10 second connect timeout
  idleTimeout: 60000,           // Close idle connections after 1 minute
  maxIdle: 5,                   // Keep 5 idle connections
});

export const db = drizzle(pool);
```

**Configuration Tuning:**
- `connectionLimit`: Start with 10, increase if needed
- `connectTimeout`: 10 seconds (balance between fast failure and patience)
- `idleTimeout`: 60 seconds (keep connections warm but not forever)
- `maxIdle`: Half of connectionLimit (balance between reuse and resource usage)

#### Solution 3: Graceful Degradation in Scheduled Jobs (Best Practice - 3 hours)

**Location:** `server/_core/scheduler.ts` or wherever scheduled jobs are defined

```typescript
// Wrap scheduled job with error handling
async function publishScheduledReleases() {
  try {
    const releases = await getScheduledPressReleases();
    
    for (const release of releases) {
      try {
        await publishPressRelease(release.id);
        console.log(`Published press release ${release.id}`);
      } catch (error) {
        console.error(`Failed to publish press release ${release.id}:`, error);
        // Don't throw - continue with other releases
      }
    }
  } catch (error) {
    console.error('Error in publishScheduledReleases job:', error);
    // Log error but don't crash the scheduler
    // Next run will retry
  }
}

// Schedule with error recovery
setInterval(async () => {
  await publishScheduledReleases();
}, 60000); // Every minute
```

**Key Principles:**
- Never let one failure crash the scheduler
- Log errors for monitoring
- Continue processing other items
- Trust next run to retry

### Recommended Implementation Order

1. **Immediate (Today):** Add retry logic to scheduled jobs
2. **This Week:** Configure connection pool properly
3. **Before Launch:** Add comprehensive error handling and monitoring

### Testing Checklist

- [ ] Scheduled job runs successfully with good connection
- [ ] Scheduled job retries on connection timeout
- [ ] Scheduled job continues after one release fails
- [ ] Connection pool doesn't exhaust under load
- [ ] Idle connections are closed properly
- [ ] Error logs are clean and actionable

---

## Issue 2: Migration Timeouts

### Symptom

```bash
$ pnpm db:push
# Hangs for 30+ seconds, then:
Error: Lock wait timeout exceeded; try restarting transaction
```

### When It Occurs

- **During `pnpm db:push`** (schema changes)
- **When adding new columns** to large tables
- **When creating indexes** on existing data
- **During production hours** (high traffic)

### Root Cause

**Primary:**
- Long-running transactions blocking schema changes
- Table locks from active queries
- Large tables taking too long to alter

**Secondary:**
- MySQL/TiDB default lock timeout (50 seconds)
- No coordination between deployments and migrations
- Migrations run during active usage

### Impact

- **Severity:** Medium
- **Frequency:** Occasional (during development)
- **User Impact:** None (development-time issue)
- **System Impact:** Blocks deployments, frustrates developers

### Current Workaround

- Wait for low-traffic period
- Retry `pnpm db:push` multiple times
- Use `--force` flag (dangerous)

### Recommended Solution

#### Solution 1: Migration Timing (Best Practice)

**Process:**
1. Schedule migrations during maintenance windows
2. Announce downtime to users (if needed)
3. Stop application before running migrations
4. Run migrations
5. Restart application

**For Development:**
```bash
# Stop dev server
pnpm dev # Ctrl+C

# Run migration
pnpm db:push

# Restart dev server
pnpm dev
```

**For Production:**
```bash
# 1. Put site in maintenance mode
# 2. Stop application servers
# 3. Run migration
pnpm db:push

# 4. Verify migration
pnpm db:studio

# 5. Restart application
# 6. Remove maintenance mode
```

#### Solution 2: Non-Blocking Migrations (Advanced)

**For adding nullable columns:**
```typescript
// Instead of:
export const businesses = sqliteTable('businesses', {
  newField: text('new_field').notNull().default(''),
});

// Use:
export const businesses = sqliteTable('businesses', {
  newField: text('new_field'), // nullable first
});

// Then backfill data:
UPDATE businesses SET new_field = '' WHERE new_field IS NULL;

// Then make NOT NULL in next migration:
export const businesses = sqliteTable('businesses', {
  newField: text('new_field').notNull(),
});
```

**For adding indexes:**
```sql
-- Use ONLINE algorithm (if supported by TiDB)
CREATE INDEX idx_name ON table_name (column_name) ALGORITHM=INPLACE, LOCK=NONE;
```

#### Solution 3: Increase Lock Timeout (Temporary)

**Not recommended for production**, but useful for development:

```sql
-- Increase lock wait timeout to 5 minutes
SET SESSION innodb_lock_wait_timeout = 300;

-- Then run migration
```

### Recommended Implementation

1. **Development:** Stop dev server before migrations
2. **Staging:** Schedule migrations during off-hours
3. **Production:** Maintenance window + downtime announcement

### Testing Checklist

- [ ] Migration succeeds on clean database
- [ ] Migration succeeds with existing data
- [ ] Migration completes in <30 seconds
- [ ] Application works after migration
- [ ] Rollback procedure documented

---

## Issue 3: White Label Fields Missing

### Symptom

```
Error: Column 'white_label_logo_url' not found
```

### When It Occurs

- **When accessing partner portal** for businesses created before white label feature
- **When querying businesses table** without null checks
- **During business profile updates**

### Root Cause

**Primary:**
- White label fields added after initial businesses were created
- No backfill migration run
- Existing records have NULL values

**Secondary:**
- Code assumes fields always exist
- No default values set in schema
- Frontend doesn't handle missing fields gracefully

### Impact

- **Severity:** Low
- **Frequency:** Only affects old records
- **User Impact:** Partner portal may not load for some businesses
- **System Impact:** Errors in logs, degraded functionality

### Current Workaround

Manual database update for affected records

### Recommended Solution

#### Solution 1: Backfill Migration (One-Time - 1 hour)

**Create migration script:** `scripts/backfill-white-label.ts`

```typescript
import { db } from '../server/db';
import { businesses } from '../drizzle/schema';
import { isNull } from 'drizzle-orm';

async function backfillWhiteLabelFields() {
  console.log('Backfilling white label fields...');
  
  const result = await db
    .update(businesses)
    .set({
      white_label_logo_url: null,
      white_label_primary_color: '#008080',
      white_label_secondary_color: '#7FFF00',
    })
    .where(isNull(businesses.white_label_primary_color));
  
  console.log(`Updated ${result.rowsAffected} businesses`);
}

backfillWhiteLabelFields()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
  });
```

**Run:**
```bash
pnpm tsx scripts/backfill-white-label.ts
```

#### Solution 2: Add Default Values in Schema (Prevention)

**Location:** `drizzle/schema.ts`

```typescript
export const businesses = sqliteTable('businesses', {
  // ... other fields
  white_label_logo_url: text('white_label_logo_url'),
  white_label_primary_color: text('white_label_primary_color')
    .notNull()
    .default('#008080'),
  white_label_secondary_color: text('white_label_secondary_color')
    .notNull()
    .default('#7FFF00'),
});
```

#### Solution 3: Null-Safe Frontend Code (Defense)

**Location:** `client/src/pages/Partners.tsx`

```typescript
// Instead of:
const primaryColor = business.white_label_primary_color;

// Use:
const primaryColor = business.white_label_primary_color ?? '#008080';
const secondaryColor = business.white_label_secondary_color ?? '#7FFF00';
const logoUrl = business.white_label_logo_url ?? null;
```

### Recommended Implementation

1. **Immediate:** Add null checks in frontend code
2. **This Week:** Run backfill migration
3. **Before Launch:** Add default values to schema

### Testing Checklist

- [ ] Old businesses display correctly in partner portal
- [ ] New businesses get default colors
- [ ] Logo upload works for all businesses
- [ ] No null reference errors in logs

---

## Issue 4: N+1 Query Problem (Performance)

### Symptom

- Slow page loads
- High database query count
- Multiple identical queries in logs

### When It Occurs

- **Press release list page** (loading related data)
- **Campaign dashboard** (loading variants)
- **Media lists page** (loading contacts)

### Root Cause

**Classic N+1 pattern:**
```typescript
// Bad: N+1 queries
const releases = await db.select().from(pressReleases);
for (const release of releases) {
  const business = await db.select().from(businesses)
    .where(eq(businesses.id, release.businessId));
  // 1 query for list + N queries for businesses = N+1
}
```

### Impact

- **Severity:** Medium
- **Frequency:** Every page load
- **User Impact:** Slow page loads (2-3 seconds)
- **System Impact:** High database load

### Recommended Solution

#### Use Joins or Batch Queries

```typescript
// Good: Single query with join
const releasesWithBusinesses = await db
  .select({
    release: pressReleases,
    business: businesses,
  })
  .from(pressReleases)
  .leftJoin(businesses, eq(pressReleases.businessId, businesses.id));
```

**Or batch queries:**
```typescript
// Get all releases
const releases = await db.select().from(pressReleases);

// Get all related businesses in one query
const businessIds = releases.map(r => r.businessId);
const businessesMap = await db
  .select()
  .from(businesses)
  .where(inArray(businesses.id, businessIds))
  .then(rows => new Map(rows.map(b => [b.id, b])));

// Combine in memory
const releasesWithBusinesses = releases.map(release => ({
  ...release,
  business: businessesMap.get(release.businessId),
}));
```

### Testing Checklist

- [ ] Page loads in <1 second
- [ ] Query count reduced by 80%+
- [ ] No duplicate queries in logs

---

## Monitoring and Alerting

### Recommended Setup

**Error Tracking:**
- Use Sentry or similar for error monitoring
- Alert on connection timeout spikes
- Track query performance

**Database Monitoring:**
- Connection pool usage
- Query execution time
- Lock wait events
- Slow query log

**Application Metrics:**
- API response times
- tRPC procedure durations
- Scheduled job success rate

### Alert Thresholds

- **Connection timeouts:** >10 per minute
- **Query duration:** >1 second
- **Connection pool:** >80% utilization
- **Scheduled job failures:** >3 consecutive failures

---

## Pre-Launch Checklist

Database stability requirements before launch:

- [ ] Connection retry logic implemented
- [ ] Connection pool configured properly
- [ ] Scheduled jobs have error handling
- [ ] White label fields backfilled
- [ ] N+1 queries optimized
- [ ] Migration procedures documented
- [ ] Monitoring and alerting configured
- [ ] Rollback procedures tested
- [ ] Database backups verified
- [ ] Load testing completed

---

## Emergency Procedures

### If Database Goes Down

1. **Check Manus platform status** - Is it a platform-wide issue?
2. **Check connection string** - Is DATABASE_URL correct?
3. **Check network** - Can you ping the database host?
4. **Check logs** - What's the exact error message?
5. **Restart application** - Sometimes connection pool gets stuck
6. **Contact Manus support** - If issue persists

### If Migration Fails

1. **Don't panic** - Database is probably fine
2. **Check error message** - Lock timeout? Syntax error?
3. **Verify schema** - Is drizzle/schema.ts correct?
4. **Check for conflicts** - Are there uncommitted changes?
5. **Rollback if needed** - Restore from backup
6. **Try again during low-traffic** - Timing matters

### If Data Gets Corrupted

1. **Stop application immediately** - Prevent further damage
2. **Identify scope** - Which tables? How many rows?
3. **Restore from backup** - Manus provides automatic backups
4. **Replay transactions** - If possible, from logs
5. **Verify integrity** - Check foreign keys, constraints
6. **Document incident** - What happened? How to prevent?

---

## Additional Resources

- **Drizzle ORM Docs:** https://orm.drizzle.team/docs
- **MySQL Connection Pooling:** https://github.com/mysqljs/mysql#pooling-connections
- **TiDB Best Practices:** https://docs.pingcap.com/tidb/stable/dev-guide-overview

---

**Document Version:** 1.0  
**Last Updated:** December 23, 2025  
**Next Review:** After implementing solutions
