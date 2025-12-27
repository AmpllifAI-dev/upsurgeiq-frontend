# UpsurgeIQ Project Handoff Documentation

**Date:** December 23, 2025  
**Project Owner:** Christopher Lembke  
**Repository:** https://github.com/AmpllifAI-dev/upsurgeiq-frontend  
**Status:** Pre-Launch (90% complete)

---

## 🎯 Executive Summary

UpsurgeIQ is an AI-powered PR and marketing SaaS platform for SMBs. The project is 90% complete and ready for final testing and launch preparation. This document provides everything a new development team needs to complete the remaining 10% and launch successfully.

**What's Complete:**
- ✅ Full application architecture (React + tRPC + MySQL)
- ✅ All major features implemented
- ✅ Stripe subscription system (test mode)
- ✅ Database schema and migrations
- ✅ Framework documentation
- ✅ 90% of user-facing features

**What's Remaining:**
- ⏳ Campaign Lab end-to-end testing
- ⏳ Ad platform OAuth configuration (Facebook, LinkedIn)
- ⏳ Final QA and bug fixes
- ⏳ Database migration stability improvements
- ⏳ TypeScript error cleanup
- ⏳ Launch preparation

**Estimated Time to Launch:** 2-3 weeks with focused effort

---

## 📁 Project Structure

```
/home/ubuntu/upsurgeiq-frontend/
├── docs/
│   ├── framework/              ← START HERE - Essential context
│   │   ├── AI_AGENT_START_HERE.md
│   │   ├── ADMINISTRATOR_DOSSIER.md
│   │   ├── PROJECT_CONTEXT.md
│   │   ├── WORKING_METHODOLOGY.md
│   │   ├── CLIENT_PREFERENCES.md
│   │   ├── DECISIONS_LOG.md
│   │   ├── upsurgeIQ_Services_and_Features.md
│   │   └── CONVERSATION_HISTORY_*.md
│   └── SOCIAL_MEDIA_ADS_API_SETUP.md
├── V2_FEATURES.md              ← Post-launch roadmap
├── todo.md                     ← Current task list
├── client/                     ← React frontend
│   ├── src/
│   │   ├── pages/             ← Page components
│   │   ├── components/        ← Reusable UI
│   │   ├── lib/trpc.ts        ← API client
│   │   └── App.tsx            ← Routes
├── server/                     ← Express + tRPC backend
│   ├── routers.ts             ← API endpoints
│   ├── db.ts                  ← Database queries
│   ├── _core/                 ← Framework (don't edit)
│   └── *.test.ts              ← Vitest tests
├── drizzle/
│   └── schema.ts              ← Database schema
├── storage/                    ← S3 helpers
└── shared/                     ← Shared types
```

---

## 🚀 Quick Start for New Team

### 1. Read Framework Documentation (CRITICAL)

**MUST READ in this order (30-40 minutes):**

1. `docs/framework/AI_AGENT_START_HERE.md` - Project overview and priorities
2. `docs/framework/ADMINISTRATOR_DOSSIER.md` - Who you're working with
3. `docs/framework/PROJECT_CONTEXT.md` - Full project requirements
4. `docs/framework/WORKING_METHODOLOGY.md` - How we work
5. `docs/framework/CLIENT_PREFERENCES.md` - Christopher's preferences
6. `docs/framework/DECISIONS_LOG.md` - Past decisions and rationale
7. `todo.md` - Current priorities and completed work
8. `V2_FEATURES.md` - Post-launch features (don't implement yet)

**Why this matters:**
- Christopher has experienced significant frustration with context loss
- Previous AI agents went "off the rails" without reading docs
- Framework docs are the source of truth, not conversation history
- **You MUST address Christopher by name in every message** (signals you read the docs)

### 2. Environment Setup

**Prerequisites:**
- Node.js 22.13.0
- pnpm package manager
- Access to Manus platform (hosting, database, AI services)

**Environment Variables (Manus provides automatically):**
- Database: `DATABASE_URL`
- Auth: `JWT_SECRET`, `OAUTH_SERVER_URL`, `VITE_APP_ID`
- AI: `BUILT_IN_FORGE_API_KEY`, `BUILT_IN_FORGE_API_URL`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
- SendGrid: `SENDGRID_API_KEY`
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`

**Setup Commands:**
```bash
# Clone repository
git clone https://github.com/AmpllifAI-dev/upsurgeiq-frontend.git
cd upsurgeiq-frontend

# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start dev server
pnpm dev
```

### 3. Verify Setup

**Check these work:**
- ✅ Dev server runs on http://localhost:3000
- ✅ Can log in with Manus OAuth
- ✅ Database connection works
- ✅ Can create a press release
- ✅ AI assistant responds

---

## 📋 Remaining Tasks (Priority Order)

### Priority 1: Campaign Lab Testing (2-3 days)

**Location:** `client/src/pages/CampaignLab.tsx`

**Tasks:**
- [ ] Create test campaign with real data
- [ ] Generate 4-6 ad variants using AI
- [ ] Test variant approval workflow (approve/reject)
- [ ] Verify in-app notifications for pending approvals
- [ ] Verify email notifications sent correctly
- [ ] Test autonomous optimization (auto-pause/deploy)
- [ ] Test campaign PDF export

**Known Issues:**
- None currently - feature is implemented, just needs testing

**Testing Checklist:**
```
1. Create campaign → Should generate 4-6 variants
2. Approve 2 variants → Should show in "Approved" section
3. Reject 1 variant → Should show in "Rejected" section
4. Check notifications → Should see in-app alert
5. Check email → Should receive approval request email
6. Wait 24 hours → Should auto-pause underperformers
7. Export PDF → Should include charts and analytics
```

### Priority 2: Ad Platform OAuth Setup (ADMINISTRATOR TASK)

**Location:** `docs/SOCIAL_MEDIA_ADS_API_SETUP.md`

**Christopher must complete:**
- [ ] Create Facebook Developer App
- [ ] Configure Facebook OAuth credentials
- [ ] Create LinkedIn Developer App  
- [ ] Configure LinkedIn OAuth credentials
- [ ] Test OAuth connection flows

**Why Christopher:** Requires business verification and admin access to ad accounts

**Your role:** Test the OAuth flows once Christopher provides credentials

### Priority 3: Final Quality Assurance (1 week)

**Full regression testing:**
- [ ] Press release creation and distribution
- [ ] Social media posting (all platforms)
- [ ] Media list management and CSV upload
- [ ] AI assistant (text and voice call-in)
- [ ] WordPress integration sync
- [ ] White label partner portal
- [ ] Bug reporting system
- [ ] Usage tracking dashboard
- [ ] Invoice and billing history

**Test each subscription tier:**
- Starter (£49/month): Basic features
- Pro (£99/month): Advanced features
- Scale (£349/month): All features + Campaign Lab

### Priority 4: Technical Cleanup (3-5 days)

**TypeScript Errors:**
- Current count: 38 errors (down from 64)
- Most are type mismatches in tRPC procedures
- Fix incrementally, don't break functionality

**Performance:**
- Test page load times
- Optimize database queries (add indexes if needed)
- Check for N+1 query problems

**Security:**
- Review authentication flows
- Check authorization (role-based access)
- Verify data protection (GDPR compliance)

**Database Connection Resilience:**
- Add retry logic for connection timeouts
- Implement connection pooling
- Handle `ETIMEDOUT` errors gracefully

### Priority 5: Launch Preparation (ADMINISTRATOR + TEAM)

**Christopher's tasks:**
- [ ] Review Terms and Conditions alignment
- [ ] Verify Stripe products and pricing
- [ ] Test subscription upgrade/downgrade
- [ ] Prepare launch announcement materials
- [ ] Set up customer support email
- [ ] Create user onboarding documentation

**Your tasks:**
- [ ] Create deployment checklist
- [ ] Set up error monitoring
- [ ] Configure backup procedures
- [ ] Document rollback procedures
- [ ] Create runbook for common issues

---

## 🗄️ Database Issues and Solutions

### Issue 1: Connection Timeouts

**Symptom:**
```
DrizzleQueryError: Failed query: select...
cause: Error: connect ETIMEDOUT
```

**Occurs in:**
- Scheduled job runs (press release publishing)
- High-traffic periods
- Long-running queries

**Solution:**
```typescript
// Add retry logic in server/db.ts
async function queryWithRetry(queryFn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await queryFn();
    } catch (error) {
      if (error.message.includes('ETIMEDOUT') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}
```

### Issue 2: Migration Timeouts

**Symptom:**
- `pnpm db:push` times out
- Schema changes don't apply
- "Lock wait timeout exceeded"

**Solution:**
1. Run migrations during low-traffic periods
2. Break large migrations into smaller chunks
3. Use `pnpm db:push --force` cautiously
4. Check for long-running transactions blocking migrations

### Issue 3: White Label Fields Migration

**Context:**
- White label branding fields were added late
- Some existing businesses may not have these fields
- Need to backfill with defaults

**Solution:**
```sql
-- Run this migration to backfill white label fields
UPDATE businesses 
SET 
  white_label_logo_url = NULL,
  white_label_primary_color = '#008080',
  white_label_secondary_color = '#7FFF00'
WHERE white_label_primary_color IS NULL;
```

---

## 🏗️ Architecture Overview

### Tech Stack

**Frontend:**
- React 19 (UI library)
- Tailwind CSS 4 (styling)
- Wouter (routing)
- shadcn/ui (component library)
- tRPC client (API calls)

**Backend:**
- Express 4 (web server)
- tRPC 11 (type-safe API)
- Superjson (serialization)
- Drizzle ORM (database)

**Database:**
- MySQL/TiDB (hosted by Manus)
- 20+ tables
- Foreign key relationships

**External Services:**
- Manus: Hosting, database, AI, storage, auth
- Stripe: Payment processing
- SendGrid: Email delivery
- Twilio: Voice call-in feature
- Facebook/LinkedIn/X: Social media posting

### Data Flow

```
User Browser
    ↓
React App (client/src)
    ↓
tRPC Client (lib/trpc.ts)
    ↓
tRPC Server (server/routers.ts)
    ↓
Database Helpers (server/db.ts)
    ↓
Drizzle ORM
    ↓
MySQL Database
```

### Authentication Flow

```
1. User clicks "Login"
2. Redirected to Manus OAuth portal
3. User authenticates
4. Redirected back with session cookie
5. Every request includes cookie
6. Server validates session via Manus
7. User object available in tRPC context
```

### Key Design Patterns

**tRPC Procedures:**
- `publicProcedure`: No auth required
- `protectedProcedure`: User must be logged in
- `adminProcedure`: User must have admin role

**Database Queries:**
- All queries in `server/db.ts`
- Return raw Drizzle results
- tRPC procedures transform for frontend

**File Storage:**
- Use `storagePut()` to upload to S3
- Store metadata in database
- Never store file bytes in database

---

## 🔧 Common Development Tasks

### Adding a New Feature

1. **Update Database Schema** (`drizzle/schema.ts`)
```typescript
export const newTable = sqliteTable('new_table', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  // ... more fields
});
```

2. **Push Schema** 
```bash
pnpm db:push
```

3. **Add Database Helper** (`server/db.ts`)
```typescript
export async function getNewItems(userId: string) {
  return await db.select().from(newTable).where(eq(newTable.userId, userId));
}
```

4. **Add tRPC Procedure** (`server/routers.ts`)
```typescript
getNewItems: protectedProcedure.query(async ({ ctx }) => {
  return await getNewItems(ctx.user.id);
}),
```

5. **Use in Frontend** (`client/src/pages/NewFeature.tsx`)
```typescript
const { data, isLoading } = trpc.getNewItems.useQuery();
```

6. **Write Test** (`server/newFeature.test.ts`)
```typescript
describe('newFeature', () => {
  it('should return items', async () => {
    // test implementation
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/auth.logout.test.ts

# Run tests in watch mode
pnpm test --watch
```

### Database Operations

```bash
# Push schema changes
pnpm db:push

# Generate migration
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open database studio
pnpm db:studio
```

### Debugging

**Server-side:**
- Check terminal output for tRPC errors
- Add `console.log()` in procedures
- Use `pnpm dev` for hot reload

**Client-side:**
- Open browser DevTools
- Check Network tab for tRPC calls
- Use React DevTools for component state

**Database:**
- Use `pnpm db:studio` to view data
- Check `server/db.ts` for query logic
- Add logging to database helpers

---

## 📞 Working with Christopher

### Communication Protocol

**CRITICAL: Always address Christopher by name**
- ✅ "Christopher, I've completed the bug fix."
- ❌ "I've completed the bug fix." (will be challenged)

**Why:** Signals you've read the framework documentation

### What Christopher Values

1. **Accuracy** - Correct pricing (£49/99/349), features, specs
2. **Continuity** - Build on previous work, don't start over
3. **Quality** - Do it right the first time
4. **Efficiency** - No wasted effort on wrong approaches

### What Frustrates Christopher

1. **Context Loss** - Asking for information already provided
2. **Inaccuracy** - Wrong assumptions about features/pricing
3. **Wasted Resources** - AI credits on redundant work
4. **Lack of Follow-Through** - Starting without full context

### Decision-Making

**Christopher decides:**
- Strategic direction and priorities
- Pricing and business model
- Major architectural choices
- User-facing design

**You decide:**
- Implementation details
- Technical optimizations
- Testing approaches
- Documentation structure

**Present options as:**
- 2-3 alternatives
- Clear pros/cons
- Your recommendation with reasoning
- What happens if we don't decide now

---

## 🚨 Known Issues and Blockers

### Issue 1: Database Connection Timeouts

**Status:** Ongoing  
**Impact:** Medium - Occasional errors in scheduled jobs  
**Workaround:** Retry logic needed  
**Priority:** High

### Issue 2: TypeScript Errors

**Status:** In progress (38 remaining)  
**Impact:** Low - Doesn't affect functionality  
**Workaround:** None needed  
**Priority:** Medium

### Issue 3: Ad Platform OAuth Not Configured

**Status:** Blocked on Christopher  
**Impact:** High - Can't deploy actual ads  
**Workaround:** Setup instructions in SOCIAL_MEDIA_ADS_API_SETUP.md  
**Priority:** High

### Issue 4: Campaign Lab Untested

**Status:** Ready for testing  
**Impact:** High - Core Scale tier feature  
**Workaround:** None  
**Priority:** Highest

---

## 📚 Additional Resources

### Documentation Files

**Essential:**
- `docs/framework/AI_AGENT_START_HERE.md` - Start here
- `docs/framework/PROJECT_CONTEXT.md` - Full requirements
- `docs/framework/upsurgeIQ_Services_and_Features.md` - Feature list by tier
- `todo.md` - Current task list

**Reference:**
- `docs/framework/WORKING_METHODOLOGY.md` - Development process
- `docs/framework/DECISIONS_LOG.md` - Past decisions
- `docs/SOCIAL_MEDIA_ADS_API_SETUP.md` - OAuth setup guide
- `V2_FEATURES.md` - Post-launch roadmap

**History:**
- `docs/framework/CONVERSATION_HISTORY_*.md` - Past conversations
- `docs/framework/COMPLETE_CHAT_HISTORY.md` - Full 8-day history

### External Links

- **Repository:** https://github.com/AmpllifAI-dev/upsurgeiq-frontend
- **Dev Server:** https://3000-irlodx94q2byes4erdmgy-fd24d81b.manusvm.computer
- **WordPress Site:** https://amplifai.wpenginepowered.com
- **Stripe Dashboard:** https://dashboard.stripe.com (test mode)

### Tech Documentation

- **tRPC:** https://trpc.io/docs
- **Drizzle ORM:** https://orm.drizzle.team/docs
- **React 19:** https://react.dev
- **Tailwind CSS 4:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com

---

## ✅ Success Criteria for Launch

### Must Have (Blockers)

- [ ] Campaign Lab fully tested and working
- [ ] All email notifications delivering correctly
- [ ] Ad platform OAuth configured (Facebook, LinkedIn)
- [ ] Full regression testing passed
- [ ] Database connection stability improved
- [ ] No critical bugs in core features
- [ ] Christopher approves for launch

### Should Have (Important)

- [ ] TypeScript errors reduced to <10
- [ ] Performance testing completed
- [ ] Security audit completed
- [ ] Error monitoring configured
- [ ] Backup procedures documented
- [ ] Customer support process ready

### Nice to Have (Post-Launch)

- [ ] All TypeScript errors fixed
- [ ] Advanced analytics implemented
- [ ] Mobile responsiveness improved
- [ ] PWA features added
- [ ] Additional test coverage

---

## 🎯 Next Steps for New Team

### Day 1: Onboarding
1. Read all framework documentation (3-4 hours)
2. Set up development environment
3. Run the application locally
4. Explore the codebase
5. Review todo.md and prioritize

### Week 1: Testing & Fixes
1. Campaign Lab end-to-end testing
2. Fix any bugs discovered
3. Verify email notifications
4. Test all subscription tiers
5. Document findings

### Week 2: Quality Assurance
1. Full regression testing
2. TypeScript error cleanup
3. Performance testing
4. Security audit
5. Database stability improvements

### Week 3: Launch Preparation
1. Final bug fixes
2. Launch checklist completion
3. Deployment procedures
4. Monitoring setup
5. Go/no-go decision with Christopher

---

## 📞 Contact Information

**Project Owner:** Christopher Lembke  
**Timezone:** GMT (London)  
**Preferred Communication:** Manus chat platform

**Important:**
- Always address Christopher by name
- Reference framework docs, not assumptions
- Provide context and reasoning
- Flag issues immediately
- Ask for guidance when uncertain

---

## 🔐 Security Notes

**Sensitive Information:**
- All API keys in environment variables (not in code)
- Stripe test mode keys (safe to expose)
- Production keys will be provided at launch
- Never commit `.env` files to git

**Access Control:**
- User roles: `user`, `admin`, `partner`
- Christopher has `admin` role
- Use `protectedProcedure` for auth
- Use `adminProcedure` for admin-only features

**Data Protection:**
- GDPR-compliant opt-in for email lists
- User data encrypted at rest
- Session cookies HTTP-only
- No sensitive data in logs

---

## 📝 Final Notes

**This project is 90% complete.** The foundation is solid, the architecture is sound, and most features are implemented. What remains is testing, polish, and launch preparation.

**Christopher has invested significant time and resources** into this project. He values quality, accuracy, and continuity. Read the framework documentation thoroughly before starting work.

**The framework documentation is your source of truth.** Not conversation history, not assumptions, not "what makes sense." If something conflicts with the docs, the docs are correct.

**Success means:**
- Completing the remaining 10% efficiently
- Maintaining the quality of the existing 90%
- Launching on time with Christopher's approval
- Setting up the project for long-term success

**Good luck! 🚀**

---

**Document Version:** 1.0  
**Last Updated:** December 23, 2025  
**Next Review:** After launch
