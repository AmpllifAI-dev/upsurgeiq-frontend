# Technical Standards & Best Practices

**Purpose:** This document defines the technical standards and coding conventions for the UpsurgeIQ platform. All code must follow these standards to ensure consistency, type safety, and maintainability.

**Last Updated:** December 22, 2025

---

## Database Access Standards

### Rule: Always Use Drizzle ORM

**MUST DO:**
- Use Drizzle ORM for ALL database queries
- Use type-safe methods: `.select()`, `.insert()`, `.update()`, `.delete()`
- Use `.returning()` after inserts to get the created row
- Import schema tables from `drizzle/schema.ts`
- Use Drizzle operators: `eq()`, `and()`, `or()`, `ne()`, `desc()`, `asc()`

**NEVER DO:**
- ❌ Raw SQL with `db.execute(query, params)` (mysql2 style)
- ❌ String concatenation for queries
- ❌ Accessing `db.$client` directly unless absolutely necessary

**Correct Examples:**

```typescript
// ✅ Insert with returning
const [user] = await db.insert(users).values({
  name: "John Doe",
  email: "john@example.com",
}).returning();

// ✅ Select with conditions
const activeUsers = await db
  .select()
  .from(users)
  .where(eq(users.role, "admin"))
  .orderBy(desc(users.createdAt));

// ✅ Update with conditions
await db
  .update(users)
  .set({ lastSignedIn: new Date() })
  .where(eq(users.id, userId));

// ✅ Delete with conditions
await db
  .delete(comments)
  .where(eq(comments.id, commentId));

// ✅ Join queries
const commentsWithUsers = await db
  .select({
    commentId: comments.id,
    commentText: comments.text,
    userName: users.name,
  })
  .from(comments)
  .innerJoin(users, eq(comments.userId, users.id))
  .where(eq(comments.postId, postId));
```

**Why This Matters:**
- Full TypeScript type safety
- Compile-time error checking
- Auto-completion in IDE
- SQL injection protection
- Consistent code style across the project

---

## Router Naming Conventions

### Rule: Use Descriptive, Non-Conflicting Router Names

**MUST DO:**
- Use clear, specific names that describe the router's purpose
- Avoid generic names like `analytics` when there are multiple analytics contexts
- Prefix with context when needed: `leadBehaviour`, `leadEmailMetrics`, `clientAnalytics`

**NEVER DO:**
- ❌ Duplicate router names in the same appRouter
- ❌ Generic names that could apply to multiple features

**Correct Examples:**

```typescript
export const appRouter = router({
  // ✅ Clear, specific names
  leadBehaviour: router({ ... }),        // Visitor tracking
  leadEmailMetrics: router({ ... }),     // Email performance
  clientPressReleases: router({ ... }),  // Client PR service
  clientCampaigns: router({ ... }),      // Client campaigns
  
  // ❌ Wrong: Ambiguous or duplicate
  analytics: router({ ... }),            // Which analytics?
  analytics: router({ ... }),            // Duplicate!
});
```

---

## TypeScript Standards

### Rule: Always Handle Null Database Connections

**MUST DO:**
- Check for null after `await getDb()`
- Throw descriptive errors if database is unavailable

```typescript
// ✅ Correct
const db = await getDb();
if (!db) throw new Error("Database not available");
```

**NEVER DO:**
- ❌ Assume `getDb()` always returns a valid connection
- ❌ Use `db` without null check

---

## Schema Standards

### Rule: Use `.returning()` After Inserts

**MUST DO:**
- Always use `.returning()` after `db.insert()` to get the created row
- This ensures you have access to auto-generated IDs and default values

```typescript
// ✅ Correct
const [issue] = await db.insert(techIssues).values({...}).returning();
console.log(issue.id); // Works!

// ❌ Wrong
const [issue] = await db.insert(techIssues).values({...});
console.log(issue.id); // TypeScript error! ResultSetHeader has no .id
```

---

## Code Organization Standards

### Rule: Keep Related Procedures Together

**MUST DO:**
- Group related procedures in the same router
- Use nested routers for complex features
- Keep routers focused on a single domain

**Example:**

```typescript
newsletter: router({
  subscribe: publicProcedure...,
  unsubscribe: publicProcedure...,
  getAll: protectedProcedure...,
  blogWebhook: publicProcedure...,  // Related to newsletter sending
}),
```

---

## Error Handling Standards

### Rule: Provide Descriptive Error Messages

**MUST DO:**
- Include context in error messages
- Use specific error types from tRPC
- Log errors for debugging

```typescript
// ✅ Correct
if (!issue) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: `Issue #${issueId} not found`,
  });
}

// ❌ Wrong
if (!issue) throw new Error("Not found");
```

---

## Documentation Standards

### Rule: Document Non-Obvious Decisions

**MUST DO:**
- Add comments explaining WHY, not WHAT
- Document business logic and edge cases
- Keep comments up-to-date with code changes

```typescript
// ✅ Good comment
// Verify webhook secret to prevent unauthorized blog post notifications
// Secret is shared with WordPress via environment variable
if (input.secret !== expectedSecret) {
  throw new TRPCError({ code: "UNAUTHORIZED" });
}

// ❌ Bad comment
// Check secret
if (input.secret !== expectedSecret) {
  throw new TRPCError({ code: "UNAUTHORIZED" });
}
```

---

## Testing Standards

### Rule: Write Tests for Critical Paths

**MUST DO:**
- Write vitest tests for all tRPC procedures
- Test both success and error cases
- Test authentication and authorization

**Example:**

```typescript
// See server/auth.logout.test.ts for reference
describe("issues.create", () => {
  it("should create issue and return with id", async () => {
    const result = await caller.issues.create({
      title: "Test Bug",
      description: "Test description",
      type: "bug",
    });
    
    expect(result.id).toBeDefined();
    expect(result.title).toBe("Test Bug");
  });
});
```

---

## When to Update This Document

Add new standards when:
- A pattern is repeated across multiple files
- A mistake is made multiple times
- A new best practice is established
- A technology decision affects multiple features

**Remember:** Standards should be followed by all AI agents and developers working on this project.


---

## MySQL-Specific Drizzle Limitations

### Rule: Do NOT Use `.returning()` with MySQL

**Issue:** Drizzle ORM's `.returning()` method is **NOT available for MySQL** databases. It only works with PostgreSQL.

**NEVER DO:**
```typescript
// ❌ Wrong: .returning() doesn't exist for MySQL
const [user] = await db.insert(users).values({...}).returning();
```

**MUST DO:**
```typescript
// ✅ Correct: Insert then query by insertId
const result = await db.insert(users).values({
  name: "John Doe",
  email: "john@example.com",
});

// Get the created row
const [user] = await db
  .select()
  .from(users)
  .where(eq(users.id, Number(result.insertId)))
  .limit(1);
```

**Why This Matters:**
- MySQL doesn't support RETURNING clause in INSERT statements
- Drizzle respects database-specific limitations
- Using `.returning()` will cause TypeScript errors
- `result.insertId` contains the auto-generated ID

**Alternative Pattern (when ID not needed):**
```typescript
// If you don't need the created row, just insert
await db.insert(users).values({...});
return { success: true };
```

**Status:** This is a permanent limitation of MySQL, not a bug.
