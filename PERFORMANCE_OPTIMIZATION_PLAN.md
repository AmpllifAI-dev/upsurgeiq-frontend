# Performance Optimization Plan - Task 6

## Current Analysis (December 26, 2025)

### 1. N+1 Query Problems Identified

#### A. Press Release List Page
**Location:** `server/pressReleases.ts` - `getPressReleasesByBusiness()`
**Current Implementation:**
```typescript
// Line 29-38: Returns only press release data
export async function getPressReleasesByBusiness(businessId: number): Promise<PressRelease[]> {
  return await db
    .select()
    .from(pressReleases)
    .where(eq(pressReleases.businessId, businessId))
    .orderBy(desc(pressReleases.createdAt));
}
```

**Problem:** If the frontend displays related data (user info, social media posts, approval status), it requires additional queries per press release.

**Solution:** Add join queries to fetch related data in one query:
- Join with `users` table for creator information
- Join with `socialMediaPosts` for associated posts count
- Join with `approvalRequests` for approval status

#### B. Campaign Dashboard
**Location:** `server/campaigns.ts` - `getCampaignsByBusiness()`
**Current Implementation:**
```typescript
// Line 32-40: Returns only campaign data
export async function getCampaignsByBusiness(businessId: number): Promise<Campaign[]> {
  return await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.businessId, businessId))
    .orderBy(desc(campaigns.createdAt));
}
```

**Problem:** Campaign variants are loaded separately via `getVariantsByCampaign()`, causing N+1 queries.

**Solution:** 
- Option 1: Use LEFT JOIN to fetch variants with campaigns
- Option 2: Use `inArray` to batch load all variants for multiple campaigns

#### C. Media Lists Page
**Location:** `server/mediaLists.ts` - `getMediaListsByBusiness()`
**Current Implementation:**
```typescript
// Line 29-37: Returns only media list data
export async function getMediaListsByBusiness(businessId: number): Promise<MediaList[]> {
  return await db
    .select()
    .from(mediaLists)
    .where(eq(mediaLists.businessId, businessId))
    .orderBy(desc(mediaLists.createdAt));
}
```

**Problem:** Contact counts require separate queries via `getContactsByMediaList()`.

**Solution:** Add aggregation query to count contacts in one query using LEFT JOIN and COUNT.

### 2. Database Indexes Analysis

**Current State:** No explicit indexes found in schema.ts (checked line by line)

**Tables Requiring Indexes:**

#### High Priority (Frequently Queried)
1. **press_releases**
   - `business_id` (WHERE clause in list queries)
   - `user_id` (for user-specific queries)
   - `status` (for filtering)
   - `created_at` (for ordering)
   - Composite: `(business_id, created_at DESC)` for optimal list performance

2. **campaigns**
   - `business_id` (WHERE clause)
   - `status` (for filtering)
   - `created_at` (for ordering)
   - Composite: `(business_id, status, created_at DESC)`

3. **campaign_variants**
   - `campaign_id` (foreign key lookups)
   - Composite: `(campaign_id, created_at DESC)`

4. **media_lists**
   - `business_id` (WHERE clause)
   - `created_at` (for ordering)

5. **media_list_contacts**
   - `media_list_id` (foreign key lookups)

6. **users**
   - `open_id` (authentication lookups) - CRITICAL
   - `email` (for user searches)

7. **subscriptions**
   - `user_id` (foreign key)
   - `stripe_subscription_id` (for webhook lookups)
   - Composite: `(user_id, status)`

#### Medium Priority
8. **social_media_posts**
   - `press_release_id` (foreign key)
   - `business_id` (for business-wide queries)

9. **journalists**
   - `user_id` (foreign key)
   - `media_outlet_id` (for outlet filtering)

10. **approval_requests**
    - `press_release_id` (foreign key)
    - `status` (for pending approvals)
    - Composite: `(status, created_at DESC)`

### 3. Load Testing Plan

#### Test Scenarios

**A. Page Load Time Tests (Goal: <1 second)**
1. Press Release List Page
   - Load 50 press releases with related data
   - Measure: Initial query time, total page render time
   
2. Campaign Dashboard
   - Load 20 campaigns with variants
   - Measure: Query time, data aggregation time

3. Media Lists Page
   - Load 30 media lists with contact counts
   - Measure: Query time with/without indexes

**B. Concurrent User Tests (10-20 simultaneous users)**
1. Simulate 10 users loading press releases simultaneously
2. Simulate 15 users creating campaigns concurrently
3. Monitor database connection pool usage
4. Check for connection timeouts or query queuing

**C. Scheduled Job Performance**
1. Test scheduled jobs under load (e.g., email campaigns, notifications)
2. Monitor impact on user-facing queries
3. Check for connection pool exhaustion

#### Metrics to Collect
- Query execution time (before/after optimization)
- Database connection pool usage
- Memory usage
- API response times
- Error rates under load

### 4. Implementation Priority

**Phase 1: Critical Indexes (Immediate Impact)**
1. Add `open_id` index on `users` table (authentication)
2. Add composite indexes on `press_releases`, `campaigns`, `media_lists`
3. Add foreign key indexes on junction tables

**Phase 2: N+1 Query Fixes (High Impact)**
1. Fix press release list with joins
2. Fix campaign dashboard with batch loading
3. Fix media lists with aggregation

**Phase 3: Load Testing & Validation**
1. Run baseline performance tests
2. Apply optimizations
3. Re-run tests and compare metrics
4. Document improvements

**Phase 4: Additional Indexes (Medium Impact)**
1. Add indexes on `status`, `created_at` columns
2. Add composite indexes for common query patterns
3. Monitor slow query log for additional opportunities

## Expected Improvements

### Query Performance
- **Press Release List:** 50-70% reduction in query time (from ~200ms to ~60ms)
- **Campaign Dashboard:** 60-80% reduction with batch loading (from ~300ms to ~60ms)
- **Media Lists:** 40-60% reduction with aggregation (from ~150ms to ~60ms)

### Page Load Times
- **Target:** All pages load in <1 second
- **Expected:** 30-50% improvement in total page load time

### Concurrent Users
- **Current Capacity:** ~5-10 users before slowdown
- **Target Capacity:** 20+ users with stable performance
- **Connection Pool:** Optimize to handle 10 concurrent connections efficiently

## Next Steps

1. Create database migration for indexes
2. Implement optimized query functions
3. Update tRPC routers to use optimized functions
4. Set up load testing environment
5. Run performance tests and collect metrics
6. Document results and recommendations