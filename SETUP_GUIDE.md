# UpsurgeIQ Setup and Deployment Guide

**Last Updated:** December 23, 2025  
**For:** New development team taking over the project

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Development Environment](#development-environment)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js:** 22.13.0 (exact version)
- **pnpm:** Latest version (`npm install -g pnpm`)
- **Git:** Latest version
- **Code Editor:** VS Code recommended

### Required Accounts

- **GitHub:** Access to https://github.com/AmpllifAI-dev/upsurgeiq-frontend
- **Manus Platform:** For hosting, database, and AI services
- **Stripe:** Test account (Christopher will provide)
- **SendGrid:** Email delivery (Christopher will provide)
- **Twilio:** Voice features (Christopher will provide)

### Required Knowledge

- **TypeScript:** Intermediate level
- **React:** Intermediate level
- **tRPC:** Basic understanding (will learn quickly)
- **SQL/Databases:** Basic understanding
- **Git:** Intermediate level

---

## Initial Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/AmpllifAI-dev/upsurgeiq-frontend.git

# Navigate to project directory
cd upsurgeiq-frontend

# Check current branch
git branch
# Should show: * main
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
pnpm install

# This will install:
# - React 19 and related packages
# - tRPC 11 and server dependencies
# - Drizzle ORM and database drivers
# - Tailwind CSS 4 and UI components
# - Testing frameworks
# - Development tools
```

**Expected output:**
```
Progress: resolved 847, reused 823, downloaded 24, added 847, done
```

**If you see errors:**
- Check Node.js version: `node --version` (should be 22.13.0)
- Clear pnpm cache: `pnpm store prune`
- Try again: `pnpm install`

### Step 3: Environment Variables

⚠️ **CRITICAL:** The application requires 25+ environment variables to run.

**Option 1: Use Manus Platform (Recommended)**

All environment variables are pre-configured in the Manus platform. Just run:

```bash
pnpm dev
```

The server will automatically pick up all variables. No `.env` file needed.

**Option 2: Local Development (Outside Manus)**

You'll need to obtain actual secret values from Christopher. The application cannot run without them.

**Required variables include:**
- Manus OAuth credentials (VITE_APP_ID, OAUTH_SERVER_URL, etc.)
- Database connection (DATABASE_URL)
- Stripe payment keys (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
- SendGrid email key (SENDGRID_API_KEY)
- JWT secret (JWT_SECRET)
- And 20+ more...

**See ENVIRONMENT_VARIABLES.md for complete list and setup instructions.**

**To get access:**
1. Request Manus platform access from Christopher (easiest)
2. OR request encrypted file with actual values
3. OR request secure password manager share

**Never:**
- Commit `.env` file to Git
- Share secrets in chat/email
- Use production keys in development

# Authentication
JWT_SECRET="your-jwt-secret"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_APP_ID="your-app-id"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# AI Services
BUILT_IN_FORGE_API_KEY="your-api-key"
BUILT_IN_FORGE_API_URL="https://forge.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-key"
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# SendGrid
SENDGRID_API_KEY="SG...."
FROM_EMAIL="noreply@upsurgeiq.com"

# Twilio
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."

# Application
FRONTEND_URL="http://localhost:3000"
VITE_APP_TITLE="upsurgeIQ"
VITE_APP_LOGO="/logo.png"
```

**Important:** Never commit `.env` to git. It's already in `.gitignore`.

---

## Development Environment

### VS Code Setup (Recommended)

**Install Extensions:**
1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **TypeScript** - Language support
4. **Tailwind CSS IntelliSense** - CSS class autocomplete
5. **Drizzle ORM** - Database schema support

**VS Code Settings:**

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Code Style

**TypeScript:**
- Use strict mode
- Prefer `const` over `let`
- Use type inference when possible
- Explicit return types for functions

**React:**
- Functional components only
- Use hooks (useState, useEffect, etc.)
- Keep components small and focused
- Extract reusable logic to custom hooks

**Naming Conventions:**
- Components: `PascalCase` (e.g., `PressReleaseList`)
- Files: `PascalCase.tsx` for components
- Functions: `camelCase` (e.g., `getPressReleases`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- Database tables: `snake_case` (e.g., `press_releases`)

---

## Database Setup

### Step 1: Understand the Schema

**Location:** `drizzle/schema.ts`

**Key Tables:**
- `users` - User accounts (managed by Manus OAuth)
- `businesses` - Company profiles and dossiers
- `press_releases` - Press release content
- `social_media_posts` - Social media posts
- `media_lists` - Journalist contact lists
- `campaigns` - Campaign Lab campaigns
- `campaign_variants` - Ad variants for A/B testing
- `partners` - White label partners
- `subscriptions` - Stripe subscription data

**Relationships:**
```
users
  ↓ (one-to-many)
businesses
  ↓ (one-to-many)
press_releases
  ↓ (one-to-many)
social_media_posts
```

### Step 2: Push Schema to Database

```bash
# Push current schema to database
pnpm db:push

# This will:
# 1. Connect to database
# 2. Compare schema with current state
# 3. Generate and apply migrations
# 4. Update database structure
```

**Expected output:**
```
✓ Schema pushed successfully
```

**If you see errors:**
- Check DATABASE_URL is correct
- Check database is accessible
- See DATABASE_ISSUES.md for common problems

### Step 3: Verify Database

```bash
# Open Drizzle Studio (database GUI)
pnpm db:studio

# This opens: http://localhost:4983
```

**What to check:**
- All tables exist
- Foreign keys are set up
- Indexes are created
- No data corruption

### Step 4: Seed Data (Optional)

For development, you may want sample data:

```bash
# Create seed script: scripts/seed.ts
pnpm tsx scripts/seed.ts
```

**Example seed script:**

```typescript
import { db } from '../server/db';
import { businesses, pressReleases } from '../drizzle/schema';

async function seed() {
  // Create test business
  const [business] = await db.insert(businesses).values({
    id: 'test-business-1',
    userId: 'test-user-1',
    name: 'Test Company Ltd',
    industry: 'Technology',
    // ... other fields
  }).returning();

  // Create test press release
  await db.insert(pressReleases).values({
    id: 'test-pr-1',
    businessId: business.id,
    userId: 'test-user-1',
    title: 'Test Press Release',
    body: 'This is a test press release.',
    status: 'draft',
  });

  console.log('Seed data created');
}

seed().then(() => process.exit(0));
```

---

## Running the Application

### Development Mode

```bash
# Start development server
pnpm dev

# This starts:
# - Vite dev server (frontend) on http://localhost:3000
# - Express server (backend) integrated with Vite
# - TypeScript compiler in watch mode
# - Hot module replacement (HMR)
```

**Expected output:**
```
  VITE v5.x.x  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Access the application:**
- Frontend: http://localhost:3000
- API: http://localhost:3000/api/trpc
- OAuth callback: http://localhost:3000/api/oauth/callback

### Production Mode

```bash
# Build for production
pnpm build

# This creates:
# - client/dist/ (frontend bundle)
# - server/dist/ (backend bundle)

# Start production server
pnpm start
```

**Build output:**
```
vite v5.x.x building for production...
✓ 1234 modules transformed.
dist/index.html                   1.23 kB
dist/assets/index-abc123.js     234.56 kB │ gzip: 78.90 kB
✓ built in 12.34s
```

### Development Scripts

```bash
# Type checking (no build)
pnpm check

# Linting
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test

# Database operations
pnpm db:push      # Push schema changes
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open database GUI
```

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test server/auth.logout.test.ts

# Run tests with coverage
pnpm test --coverage
```

### Writing Tests

**Location:** `server/*.test.ts`

**Example test:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';
import { users } from '../drizzle/schema';

describe('User Management', () => {
  beforeEach(async () => {
    // Clean up test data
    await db.delete(users).where(eq(users.email, 'test@example.com'));
  });

  it('should create a new user', async () => {
    const user = await db.insert(users).values({
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
    }).returning();

    expect(user).toBeDefined();
    expect(user[0].email).toBe('test@example.com');
  });
});
```

### Test Coverage Goals

- **Critical paths:** 80%+ coverage
- **tRPC procedures:** All tested
- **Database queries:** All tested
- **Authentication:** Fully tested
- **Payment flows:** Fully tested

---

## Deployment

### Manus Platform Deployment

**The application is already deployed on Manus:**
- Dev server: https://3000-irlodx94q2byes4erdmgy-fd24d81b.manusvm.computer
- Automatic deployments on git push
- Environment variables managed by Manus
- Database hosted by Manus

**To deploy changes:**

```bash
# 1. Commit changes
git add .
git commit -m "Your commit message"

# 2. Push to GitHub
git push origin main

# 3. Manus automatically deploys
# (No manual deployment needed)
```

### Manual Deployment (if needed)

```bash
# 1. Build application
pnpm build

# 2. Test production build locally
pnpm start

# 3. Verify everything works
# - Test login flow
# - Test key features
# - Check for errors

# 4. Deploy to production
# (Follow Manus deployment docs)
```

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] TypeScript errors fixed
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Stripe products created
- [ ] SendGrid templates configured
- [ ] Twilio phone number configured
- [ ] Error monitoring set up
- [ ] Backup procedures verified
- [ ] Rollback plan documented

### Post-Deployment Checklist

- [ ] Application accessible
- [ ] Login flow works
- [ ] Database connection works
- [ ] API endpoints responding
- [ ] Scheduled jobs running
- [ ] Email delivery working
- [ ] Payment processing working
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Monitoring alerts configured

---

## Troubleshooting

### Common Issues

#### Issue: `pnpm install` fails

**Symptoms:**
```
ERR_PNPM_FETCH_404  GET https://registry.npmjs.org/...
```

**Solutions:**
1. Check internet connection
2. Clear pnpm cache: `pnpm store prune`
3. Delete `node_modules` and `pnpm-lock.yaml`
4. Run `pnpm install` again

#### Issue: Dev server won't start

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
1. Port 3000 is already in use
2. Kill the process: `lsof -ti:3000 | xargs kill -9`
3. Or use different port: `PORT=3001 pnpm dev`

#### Issue: Database connection fails

**Symptoms:**
```
Error: connect ETIMEDOUT
Error: Access denied for user
```

**Solutions:**
1. Check DATABASE_URL is correct
2. Check database is accessible (ping host)
3. Check credentials are valid
4. Check firewall/network settings
5. See DATABASE_ISSUES.md for detailed solutions

#### Issue: TypeScript errors

**Symptoms:**
```
TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```

**Solutions:**
1. Check type definitions in `drizzle/schema.ts`
2. Check tRPC procedure input/output types
3. Use type assertions cautiously: `as Type`
4. Fix the actual type mismatch (preferred)

#### Issue: Build fails

**Symptoms:**
```
[vite]: Rollup failed to resolve import
```

**Solutions:**
1. Check import paths are correct
2. Check file exists
3. Check file extension (.ts vs .tsx)
4. Clear build cache: `rm -rf dist`
5. Rebuild: `pnpm build`

#### Issue: Tests fail

**Symptoms:**
```
FAIL  server/feature.test.ts
  ● Test suite failed to run
```

**Solutions:**
1. Check test database is set up
2. Check test data is seeded
3. Check mocks are configured
4. Run single test to isolate: `pnpm test feature.test.ts`
5. Check for race conditions (async issues)

### Getting Help

**Resources:**
1. **Framework Documentation:** `docs/framework/` directory
2. **Database Issues:** `DATABASE_ISSUES.md`
3. **Handoff Documentation:** `HANDOFF_DOCUMENTATION.md`
4. **Christopher Lembke:** Project owner (via Manus chat)

**Before asking for help:**
1. Check error message carefully
2. Search documentation
3. Check GitHub issues
4. Try troubleshooting steps above
5. Prepare clear description of problem

**When asking for help:**
1. Describe what you're trying to do
2. Show exact error message
3. List steps to reproduce
4. Show relevant code
5. Mention what you've already tried

---

## Development Workflow

### Daily Workflow

```bash
# 1. Start your day
git pull origin main          # Get latest changes
pnpm install                  # Update dependencies if needed
pnpm dev                      # Start dev server

# 2. Make changes
# - Edit code
# - Test in browser
# - Fix any errors

# 3. Test changes
pnpm test                     # Run tests
pnpm check                    # Type check

# 4. Commit changes
git add .
git commit -m "Descriptive message"
git push origin main

# 5. Verify deployment
# - Check Manus deployment status
# - Test on dev server
# - Check for errors
```

### Feature Development Workflow

```bash
# 1. Create feature branch (optional)
git checkout -b feature/new-feature

# 2. Update database schema (if needed)
# Edit drizzle/schema.ts
pnpm db:push

# 3. Add database helpers
# Edit server/db.ts

# 4. Add tRPC procedures
# Edit server/routers.ts

# 5. Build frontend UI
# Edit client/src/pages/*.tsx

# 6. Write tests
# Create server/*.test.ts
pnpm test

# 7. Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 8. Merge to main (after review)
git checkout main
git merge feature/new-feature
git push origin main
```

### Bug Fix Workflow

```bash
# 1. Reproduce bug
# - Understand the issue
# - Create minimal test case

# 2. Write failing test
# - Add test that demonstrates bug
# - Verify test fails

# 3. Fix bug
# - Make minimal changes
# - Verify test passes

# 4. Test manually
# - Test in browser
# - Check for regressions

# 5. Commit and deploy
git add .
git commit -m "Fix: description of bug"
git push origin main
```

---

## Additional Resources

### Documentation

- **Project Docs:** `docs/framework/` directory
- **API Docs:** tRPC procedures in `server/routers.ts`
- **Database Schema:** `drizzle/schema.ts`
- **Component Library:** shadcn/ui documentation

### External Resources

- **tRPC:** https://trpc.io/docs
- **Drizzle ORM:** https://orm.drizzle.team/docs
- **React:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Vite:** https://vitejs.dev/guide

### Support

- **Christopher Lembke:** Project owner (Manus chat)
- **Manus Platform:** https://help.manus.im
- **GitHub Issues:** https://github.com/AmpllifAI-dev/upsurgeiq-frontend/issues

---

## Quick Reference

### Essential Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run tests
pnpm check            # Type check

# Database
pnpm db:push          # Push schema changes
pnpm db:studio        # Open database GUI

# Code Quality
pnpm lint             # Lint code
pnpm format           # Format code
```

### Important Files

```
docs/framework/AI_AGENT_START_HERE.md  # Start here
todo.md                                 # Current tasks
drizzle/schema.ts                       # Database schema
server/routers.ts                       # API endpoints
client/src/App.tsx                      # Routes
```

### Important URLs

```
Dev Server:    https://3000-irlodx94q2byes4erdmgy-fd24d81b.manusvm.computer
GitHub:        https://github.com/AmpllifAI-dev/upsurgeiq-frontend
WordPress:     https://amplifai.wpenginepowered.com
Stripe:        https://dashboard.stripe.com (test mode)
```

---

**Document Version:** 1.0  
**Last Updated:** December 23, 2025  
**Next Review:** After first deployment by new team
