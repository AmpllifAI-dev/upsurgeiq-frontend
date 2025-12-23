

### TypeScript Errors: ResultSetHeader vs Returning Rows (December 22, 2025)

**Issue:** 67 TypeScript errors in `server/routers.ts` and `server/issueTracker.ts` due to incorrect Drizzle ORM usage.

**Root Cause:** 
- Drizzle's `db.insert().values()` returns `ResultSetHeader` (MySQL metadata), not the inserted row
- Code attempts to access `issue.id` from ResultSetHeader, which doesn't have an `id` property
- Need to use `.returning()` to get the actual inserted row back

**Affected Files:**
- `server/issueTracker.ts` - `createIssue()` function (line 29-46)
- `server/routers.ts` - Issue creation handler (line 5676, 5679, 5684, 5699)

**Fix Required:**
```typescript
// ❌ Wrong (returns ResultSetHeader)
const [issue] = await db.insert(techIssues).values({...});
return issue; // ResultSetHeader, no .id property

// ✅ Correct (returns inserted row)
const [issue] = await db.insert(techIssues).values({...}).returning();
return issue; // Actual row with .id property
```

**Impact:** 
- Prevents TypeScript compilation
- Blocks production deployment
- Auto-investigation system can't access issue.id

**Priority:** CRITICAL - Blocking production

**Status:** Fixed on December 22, 2025

**Fix Applied:**
- Added `.returning()` to `createIssue()` in `server/issueTracker.ts`
- TypeScript errors resolved
- Build now passes


### Database Query Inconsistency: Drizzle ORM vs Raw mysql2 SQL (December 22, 2025)

**Issue:** Multiple files in the codebase were mixing two different database access patterns, causing TypeScript errors and type safety issues.

**Root Cause:**
- Different AI agents/iterations used different approaches:
  - **Drizzle ORM approach:** Type-safe queries with `.select()`, `.insert()`, `.update()`, `.delete()`
  - **Raw SQL approach:** mysql2-style `db.execute(query, params)` with string queries

**Problem:**
```typescript
// ❌ Wrong: Trying to use mysql2 syntax on Drizzle instance
const [comments] = await db.execute(query, [issueId]); // TypeScript error!

// ❌ Wrong: Drizzle's execute() doesn't accept parameters this way
await db.execute(`DELETE FROM issue_comments WHERE id = ?`, [commentId]);
```

**Why This Happened:**
- `getDb()` returns a **Drizzle database instance**, not a raw mysql2 connection
- Drizzle's `.execute()` method has a different signature than mysql2's
- Earlier code iterations used raw SQL, later ones used Drizzle ORM
- No standardization enforced across the codebase

**Affected Files:**
- `server/issueTracker.ts` - Mixed both approaches in same file
- Functions: `addIssueComment()`, `getIssueComments()`, `deleteIssueComment()`, `getSupportTeam()`

**Fix Applied:**
Standardized all database queries to use **pure Drizzle ORM**:

```typescript
// ✅ Correct: Pure Drizzle ORM
const comments = await db
  .select({
    id: issueComments.id,
    comment: issueComments.comment,
    userName: users.name,
  })
  .from(issueComments)
  .innerJoin(users, eq(issueComments.userId, users.id))
  .where(and(...conditions))
  .orderBy(issueComments.createdAt);
```

**Benefits:**
- Full TypeScript type safety
- Auto-completion in IDE
- Compile-time error checking
- Consistent code style
- Better SQL injection protection

**Going Forward:**
- **ALWAYS use Drizzle ORM** for database queries
- **NEVER use raw SQL** with `db.execute(query, params)`
- If raw SQL is absolutely necessary, use Drizzle's `sql` template tag
- Review all database code for consistency

**Status:** Fixed on December 22, 2025

**Related Issues:**
- TypeScript errors in issueTracker.ts (lines 149, 158, 177)
- Type confusion between Drizzle and mysql2 interfaces


### Quick Fix: supportRole Column Added via Direct SQL (December 22, 2025)

**Issue:** The `users` table was missing the `supportRole` column needed for the issue tracking system's team assignment feature.

**Quick Fix Applied:**
```sql
ALTER TABLE users ADD COLUMN supportRole ENUM('none', 'support_agent', 'tech_lead', 'admin') DEFAULT 'none' NOT NULL AFTER role;
```

**Why Quick Fix:**
- Running `pnpm db:push` would require answering 70+ interactive migration prompts
- This single column was blocking TypeScript compilation
- The column was already defined in `drizzle/schema.ts` but not in the database

**Proper Fix Needed:**
- Run full database migration during scheduled maintenance window
- Ensure all 70+ schema tables are properly migrated
- Remove this technical debt entry after proper migration

**Status:** Temporary fix in place, proper migration pending

**Related:**
- See "Database Migration Backlog" section above
- Users table schema in `drizzle/schema.ts` line 20
