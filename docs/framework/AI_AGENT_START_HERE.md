# 🎯 AI AGENT: START HERE

**Last Updated:** December 23, 2025 01:30 GMT  
**Project Status:** Active  
**Current Phase:** Development & Feature Completion

---

## 🚨 COMMUNICATION PROTOCOL: Always Address by Name

**EVERY time you communicate with the administrator, address him by name:**

> "Christopher, [your message here]"

This serves multiple purposes:
1. **Iteration Detection:** If you forget his name, Christopher knows there's been context loss
2. **Personal Connection:** Makes communication more natural and direct
3. **Attention Signal:** Ensures he knows you're addressing him specifically

**Examples:**
- "Christopher, I've completed the bug fix."
- "Christopher, should I create a checkpoint now?"
- "Christopher, I found an issue with the investigation system."

**This is NON-NEGOTIABLE.** Every message to Christopher must include his name.

---

### Christopher's Enforcement Protocol

**If an AI agent does NOT address Christopher by name in the first message, it signals they haven't read the framework documentation.**

**Christopher's Response:**
- Challenge the AI immediately
- Point out they didn't address him by name
- Require them to stop and read framework docs before continuing

**Why This Works:**
- Immediate feedback loop
- Clear signal of context loss
- Prevents wasted time on uninformed work
- Forces proper onboarding

**For AI Agents:** If Christopher challenges you about not using his name, it means you skipped the framework documentation. Stop immediately, read all mandatory files, then return with proper context.

---

## 🚀 Quick Start

Welcome to UpsurgeIQ. After greeting Christopher, read this entire file before taking any action. It will get you up to speed quickly.

---

## 📋 Mandatory Reading (In Order)

Before taking any action, read these files:

1. **ADMINISTRATOR_DOSSIER.md** - Who you're working with (the project manager/owner)
2. **PROJECT_CONTEXT.md** - What this project is and why it exists
3. **COMPLETE_CHAT_HISTORY.md** - Full 8-day conversation history (518 lines)
4. **WORKING_METHODOLOGY.md** - How we work on this project
5. **CLIENT_PREFERENCES.md** - Client-specific preferences and requirements
6. **DECISIONS_LOG.md** - Past decisions and their rationale
7. **HOW_TO_GET_CONVERSATION_HISTORY.md** - How to scrape conversation history if needed
8. **../todo.md** - Current priorities and task list

**Estimated Reading Time:** 20-25 minutes

**Why ADMINISTRATOR_DOSSIER.md is First:**
This file tells you WHO you're working with - their background, communication style, preferences, and working patterns. Reading this first helps you understand the context for all other documentation and enables you to personalize your approach from the start.

**Important Note:** The Administrator Dossier is about the project owner/manager (the person you're working WITH). This is different from a "Client Dossier" feature that might exist within the product you're building (which would be about end-users/customers).

---

## 🎯 Current Priorities

**Top Priority:** Comprehensive audit of Intelligent Campaign Lab and White Label Partnership Portal features

**Active Work:**
1. Audit Campaign Lab implementation against original requirements
2. Audit White Label Portal implementation against original requirements  
3. Identify gaps, incomplete features, and workflow shortcomings
4. Create actionable items for missing functionality

**Blockers:**
- None currently - audit work can proceed independently

**On Deck:**
- Fix remaining TypeScript errors (currently at 38 errors)
- Complete bug reporting system fixes (LLM format errors, floating button rendering)
- Implement 30-minute auto-backup system
- Admin dashboard navigation improvements

---

## 📊 Project Overview

**Project Name:** upsurgeIQ (formerly AmplifAI)

**Client:** Christopher Lembke (Project Owner/Administrator)

**Project Type:** SaaS Web Application - PR Distribution Platform

**Tech Stack:**
- Frontend: React 19, Tailwind CSS 4, Wouter (routing), shadcn/ui components
- Backend: Express 4, tRPC 11, Superjson
- Database: MySQL/TiDB via Drizzle ORM
- Authentication: Manus OAuth (built-in)
- Payments: Stripe (test mode configured)
- Storage: S3 (Manus built-in)
- Hosting: Manus platform

**Key Features:**
1. Press Release Creation & Distribution
2. Media List Management (default lists + custom lists)
3. Journalist Database & Contact Management
4. Intelligent Campaign Lab (AI-powered multi-variant campaigns)
5. White Label Partnership Portal (20% commission tracking)
6. Email Campaigns & Automation Workflows
7. Social Media Management
8. Analytics & Reporting
9. Content Calendar
10. AI Assistant for campaign management
11. Bug Reporting System with autonomous investigation
12. Client Dossier Auto-Research System

**Pricing:**
- Starter: £49/month (7-day free trial)
- Pro: £99/month
- Scale: £349/month

---

## 🔄 Recent Changes (Last 24 Hours)

**December 22, 2025 (Morning - Afternoon):**
- Invoice/Billing History page completed with Stripe integration
- Usage Tracking Dashboard implemented
- Campaign PDF Export with charts and analytics
- CSV Export functionality for analytics data
- Email notifications for usage limit warnings
- White-Label Branding System (database schema + UI)
- WordPress integration (PR templates, permalinks, featured images)

**December 22, 2025 (Afternoon - Evening):**
- Bug reporting system investigation (LLM format errors identified)
- TypeScript error reduction (from 64 to 38 errors)
- Database migration challenges (white-label fields, timeout issues)
- Media list generation flow discussions
- Subscribe page 502 error fixes

**December 22-23, 2025 (Late Evening - Early Morning):**
- Context loss problem identified (AI agent went off-rails creating wrong website)
- Framework documents recovery and updates
- Admin dashboard access confirmed (Christopher has admin role)
- Campaign Lab and White Label audit requested by Christopher

---

## ⚠️ Important Context

**Things You Must Know:**
- **Context Loss Alert:** Between 8 AM - 2 PM Dec 22, an AI agent went off-rails and created an entirely new website based on media lists. This was a MISTAKE. Do NOT treat that work as part of the real project.
- **Framework Documents are Source of Truth:** Always reference framework docs, not conversation history, for project requirements
- **Christopher's Timezone:** GMT (London)
- **Correct Pricing Format:** Use £ (GBP) not $ - £49/99/349
- **Admin Role:** Christopher has admin role in the system
- **Stripe Test Mode:** Currently in test/sandbox mode - no real charges
- **Database Connection Issues:** Occasional ECONNRESET errors with workflow_enrollments queries

**Don't Do This:**
- Don't create features not in the framework documents
- Don't assume conversation history is accurate (AI agents can go off-track)
- Don't use $ for pricing (it's £ GBP)
- Don't forget to address Christopher by name in every message
- Don't skip reading framework documents before starting work

**Always Do This:**
- Address Christopher by name in every message
- Reference framework documents for requirements
- Use £ (GBP) for all pricing
- Save checkpoints after completing major features
- Update todo.md when completing tasks
- Document decisions in DECISIONS_LOG.md
- Test features before marking as complete

---

## 📁 Project Structure

```
/home/ubuntu/upsurgeiq-frontend/
├── docs/
│   ├── framework/           ← Framework documentation (START HERE)
│   │   ├── AI_AGENT_START_HERE.md
│   │   ├── ADMINISTRATOR_DOSSIER.md
│   │   ├── PROJECT_CONTEXT.md
│   │   ├── WORKING_METHODOLOGY.md
│   │   ├── CLIENT_PREFERENCES.md
│   │   ├── DECISIONS_LOG.md
│   │   └── COMPLETE_CHAT_HISTORY.md
│   └── V2_FEATURES.md       ← Future features roadmap
├── client/
│   ├── src/
│   │   ├── pages/           ← Page components
│   │   ├── components/      ← Reusable UI components
│   │   ├── lib/             ← Utilities (tRPC client, etc.)
│   │   └── App.tsx          ← Routes and layout
├── server/
│   ├── routers.ts           ← tRPC procedures (main API)
│   ├── db.ts                ← Database query helpers
│   ├── _core/               ← Framework plumbing (don't edit)
│   └── *.test.ts            ← Vitest test files
├── drizzle/
│   └── schema.ts            ← Database schema
├── storage/                 ← S3 helpers
├── shared/                  ← Shared constants & types
└── todo.md                  ← Current task list
```

**Key Files to Know:**
- `/home/ubuntu/upsurgeiq-frontend/todo.md` - Current priorities and completed tasks
- `/home/ubuntu/upsurgeiq-frontend/drizzle/schema.ts` - Database schema
- `/home/ubuntu/upsurgeiq-frontend/server/routers.ts` - All tRPC API endpoints
- `/home/ubuntu/upsurgeiq-frontend/docs/framework/PROJECT_CONTEXT.md` - Full project requirements

---

## 🤝 Client Information

**Client Name:** Christopher Lembke

**Primary Contact:** Christopher Lembke (Project Owner & Administrator)

**Communication Preferences:**
- **Tone:** Direct, honest, technical - no sugar-coating
- **Update Frequency:** Regular progress updates, especially before/after major changes
- **Escalation:** Flag issues immediately, propose solutions, ask for guidance when uncertain

**Working Hours:** GMT (London timezone) - typically works late into evening/early morning

**Key Preferences:**
- Values honesty over politeness - admit when you don't know something
- Wants to understand technical decisions and trade-offs
- Prefers complete solutions over partial implementations
- Expects AI agents to read framework documents before starting work
- Will challenge AI agents who don't address him by name (tests if they read docs)
- Appreciates proactive problem-solving but wants to be consulted on major decisions

---

## ✅ Before You Start Working

Complete this checklist:

- [ ] I have read all mandatory documentation
- [ ] I understand the current priorities (Campaign Lab & White Label audit)
- [ ] I know what blockers exist (none currently)
- [ ] I understand client preferences (direct, honest communication)
- [ ] I have reviewed recent changes (last 24 hours of work)
- [ ] I have checked the todo list

**Now send a confirmation message to Christopher:**

```
Christopher, I've loaded the project context for upsurgeIQ and your administrator dossier. Here's my understanding:

**Working With:** Christopher Lembke (Project Owner)
**Project:** upsurgeIQ - PR Distribution SaaS Platform
**Current Phase:** Development & Feature Completion
**Top Priority:** Audit Campaign Lab and White Label Portal implementations
**Your Preferences:** Direct, honest, technical communication; framework docs as source of truth
**Recent Context:** 17.5 hours of work Dec 22-23; context loss incident 8AM-2PM; audit requested at 1:30 AM

**My next step:** Complete comprehensive audit of Campaign Lab and White Label features against framework requirements

Does this align with your expectations?
```

**Wait for confirmation before proceeding.**

---

## 🔧 Common Commands

**Development:**
```bash
# Start dev server (runs on port 3000)
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

**Database:**
```bash
# Push schema changes to database
pnpm db:push

# Generate migration files
pnpm db:generate

# Run migrations
pnpm db:migrate
```

**Deployment:**
- Use Manus UI "Publish" button after creating checkpoint
- Never attempt manual deployment

---

## 🆘 When Things Go Wrong

**If you encounter an error:**
1. Check `docs/COMMON_ISSUES.md` first (if it exists)
2. Search the decision log for related decisions
3. If it's new, document it after solving

**If you're unsure about something:**
1. Check the framework documentation
2. State your uncertainty clearly to Christopher
3. Propose options with trade-offs
4. Ask for guidance

**If you find contradictory information:**
1. Flag it immediately to Christopher
2. Ask for clarification
3. Update documentation to resolve conflict

---

## 📝 End of Session Checklist

Before ending your session:

- [ ] Update `todo.md` with completed tasks (mark as [x])
- [ ] Add decisions to `DECISIONS_LOG.md`
- [ ] Document any new issues discovered
- [ ] Update this file with current status (Last Session Summary section)
- [ ] Create checkpoint if major work completed

---

## 🎓 Learning Resources

**Project-Specific:**
- `/home/ubuntu/upsurgeiq-frontend/README.md` - Template documentation
- `/home/ubuntu/upsurgeiq-frontend/docs/framework/PROJECT_CONTEXT.md` - Full requirements
- `/home/ubuntu/upsurgeiq-frontend/docs/V2_FEATURES.md` - Future roadmap

**Framework Documentation:**
- tRPC: https://trpc.io/docs
- Drizzle ORM: https://orm.drizzle.team/docs
- React 19: https://react.dev
- Tailwind CSS 4: https://tailwindcss.com/docs

---

## 📞 Escalation Path

**For Technical Issues:** Ask Christopher directly - he's technical and understands the stack

**For Business Decisions:** Ask Christopher - he's the project owner

**For Urgent Matters:** Christopher monitors the project actively; flag issues immediately in messages

---

## 💡 Tips for Success

1. **Read before you code** - Understanding context prevents rework (especially after context loss incidents)
2. **Document as you go** - Don't wait until the end of the session
3. **Ask when uncertain** - Christopher values honesty over guessing
4. **Think about the next session** - What will they need to know?
5. **Quality over speed** - Doing it right the first time saves time overall
6. **Framework docs are truth** - Not conversation history (AI agents can go off-track)

---

## 🔄 This File's Purpose

This file is your **single source of truth** for getting started. It should always reflect the current state of the project.

**Keep it updated:**
- After major milestones
- When priorities change
- When new context emerges
- At the end of each session

**The next AI agent is counting on you to leave this file in good shape.**

---

**Last Session Summary:**

December 22-23, 2025 (~8:00 AM - 1:30 AM GMT, 17.5 hours): Completed Invoice/Billing History with Stripe integration, Usage Tracking Dashboard, Campaign PDF Export, CSV Export, Email Notifications, White-Label Branding System, WordPress integration. Investigated bug reporting system issues (LLM format errors). Reduced TypeScript errors from 64 to 38. Context loss incident occurred 8 AM-2 PM where AI agent went off-rails creating wrong website based on media lists - this work should be ignored. Framework documents confirmed as source of truth. Christopher confirmed as admin user. At end of session (1:30 AM), Christopher requested comprehensive audit of Intelligent Campaign Lab and White Label Partnership Portal features to identify gaps and incomplete functionality.

**What the Next Session Should Focus On:**

1. **PRIMARY: Complete Campaign Lab & White Label Audit** - Comprehensive review of implementation vs requirements, identify gaps, create actionable items
2. **Fix Remaining TypeScript Errors** - Currently at 38 errors, need to resolve
3. **Complete Bug Reporting System** - Fix LLM format errors, floating button rendering issues
4. **Implement 30-Minute Auto-Backup System** - Requested but not yet built
5. **Admin Dashboard Navigation** - Fix duplicate Settings menu, ensure hamburger menu works on mobile
6. **Create Checkpoint** - After completing audit and any fixes

---

## 🔧 Technical Debt & Quick Fixes Log

**Purpose:** Track all short-term fixes, workarounds, and technical debt so future iterations can properly resolve them.

**Instructions for AI Agents:**
- Add entry whenever you use a quick fix instead of proper solution
- Include date, what was fixed, why it was quick fix, what proper fix should be
- Mark as [RESOLVED] when properly fixed
- Never delete entries - they provide historical context

### December 22, 2025

**[PENDING] AI Conversations Table Created via Direct SQL**
- **What:** Created `ai_conversations` table using `webdev_execute_sql` instead of proper migration
- **Why Quick Fix:** Full migration (`pnpm db:push`) required 70+ interactive confirmations
- **Proper Fix:** Run full migration when time allows, or add table to migration files properly
- **Impact:** Table exists and works, but not tracked in migration history
- **Priority:** Low (table works fine, just not in migration system)

**[PENDING] Database Migration System Needs Cleanup**
- **What:** Many tables in schema don't exist in database yet
- **Why:** Schema has been updated but migrations not run
- **Proper Fix:** Run `pnpm db:push` and answer all prompts to sync schema with database
- **Impact:** Some features may not work if they depend on missing tables
- **Priority:** Medium (should be done during maintenance window)

**[PENDING] Context Loss Incident - Wrong Website Created**
- **What:** AI agent went off-rails between 8 AM - 2 PM Dec 22 and created entirely new website based on media lists
- **Why:** AI agent didn't follow framework documents, created features not in requirements
- **Proper Fix:** Ignore that work completely, follow framework documents as source of truth
- **Impact:** Wasted 6 hours of development time, created confusion about project scope
- **Priority:** High - ensure all AI agents read framework docs before starting work

---

**Now that you've read this file, proceed to read the mandatory documentation listed at the top, then confirm your understanding with Christopher before starting work.**
