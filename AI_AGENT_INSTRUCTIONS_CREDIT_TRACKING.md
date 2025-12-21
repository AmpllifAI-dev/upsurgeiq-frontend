# AI Agent Instructions: Development Cost Tracking & Budgeting

**Purpose:** This document provides instructions for Manus AI agents to track development costs (AI credits) and operational expenses for web application projects, enabling accurate budgeting and cost forecasting.

---

## Overview

When building web applications in Manus, there are **two distinct cost categories**:

1. **Development AI Credits** - Manus AI usage during the build phase (what you're tracking now)
2. **Operational Costs** - Running costs after deployment (servers, databases, APIs, storage)

This document focuses on **Development AI Credits** tracking with clear separation from operational costs.

---

## Phase 1: Development Phase (AI Credits)

### What to Track

Track **wall-clock time** (not just tokens) for each development activity, as Manus charges based on **time consumed**.

### Activity Categories

#### 1. Project Setup & Scaffolding
- Initial project creation
- Framework configuration
- Dependency installation
- Environment setup

**Typical Cost:** 50-150 AI credits (30-90 minutes)

#### 2. Backend Development
- Database schema design
- API endpoint creation
- Business logic implementation
- Third-party integrations

**Cost per Feature:**
- Simple CRUD: 12-20 credits (8-12 min)
- Complex logic: 30-60 credits (20-40 min)
- Integration (Stripe, OAuth): 40-100 credits (25-60 min)

#### 3. Frontend Development
- Component creation
- Page layouts
- Form handling
- State management

**Cost per Feature:**
- Simple component: 8-15 credits (5-10 min)
- Complex page: 40-80 credits (25-50 min)
- Dashboard: 60-120 credits (40-80 min)

#### 4. Testing & Debugging
- Writing unit tests
- Integration testing
- Bug fixes
- Error handling

**Cost per Feature:** 15-30% of implementation cost

#### 5. Documentation
- README files
- API documentation
- User guides
- Technical specs

**Cost:** 5-10 credits per 1000 words (3-7 min)

---

## Tracking Template for AI Agents

When working on a project, use this format to log your activities:

```markdown
## Session: [Date] - [Feature Name]

### Activities
| Task | Category | Start Time | End Time | Duration (min) | AI Credits | Notes |
|------|----------|------------|----------|----------------|------------|-------|
| Create user schema | Backend | 10:00 | 10:12 | 12 | 18 | Added auth fields |
| Build login form | Frontend | 10:15 | 10:35 | 20 | 30 | With validation |
| Write auth tests | Testing | 10:40 | 10:52 | 12 | 18 | 5 tests passing |

### Summary
- **Total Time:** 44 minutes
- **Total AI Credits:** 66
- **Efficiency:** 95% (2 min wasted on migration prompt)
- **Features Delivered:** User authentication system

### Cost Breakdown by Category
- Backend: 18 credits (27%)
- Frontend: 30 credits (45%)
- Testing: 18 credits (27%)
```

---

## Phase 2: Maintenance Phase (AI Credits)

After initial launch, track maintenance activities separately:

### Maintenance Categories

1. **Bug Fixes** - 5-30 credits per bug (depending on complexity)
2. **Feature Enhancements** - Use development phase rates
3. **Performance Optimization** - 20-60 credits per optimization
4. **Security Updates** - 10-40 credits per update
5. **Content Updates** - 2-10 credits per update

### Monthly Maintenance Budget

**Typical Range:** 50-200 AI credits/month

- **Light:** 50-100 credits (minor fixes, content updates)
- **Moderate:** 100-150 credits (regular enhancements)
- **Heavy:** 150-200+ credits (major features, refactoring)

---

## Phase 3: Operational Costs (Non-AI Credits)

**Important:** These are **separate from AI credits** and represent ongoing business expenses.

### Cost Categories

#### 1. Hosting & Infrastructure
- **Manus Hosting:** Included in subscription
- **Custom Domain:** $10-15/year
- **CDN (if needed):** $5-50/month

#### 2. Database
- **Manus Database:** Included in subscription
- **Backup Storage:** Usually included
- **Additional capacity:** Variable

#### 3. Third-Party APIs
- **Stripe:** 2.9% + $0.30 per transaction
- **SendGrid (Email):** $15-90/month (depending on volume)
- **OpenAI API:** $0.002-0.06 per 1K tokens (if using AI features)
- **Google Maps:** $0-200/month (depending on usage)

#### 4. Storage (S3)
- **First 50GB:** Usually free tier
- **Additional:** $0.023/GB/month
- **Bandwidth:** $0.09/GB transferred

### Monthly Operational Budget Template

```markdown
## Monthly Operational Costs

### Fixed Costs
| Item | Provider | Cost | Notes |
|------|----------|------|-------|
| Hosting | Manus | Included | - |
| Domain | Registrar | $1.25 | $15/year |
| Email Service | SendGrid | $15 | Up to 40K emails |
| **Total Fixed** | | **$16.25** | |

### Variable Costs (Usage-Based)
| Item | Provider | Unit Cost | Est. Usage | Est. Cost |
|------|----------|-----------|------------|-----------|
| Payment Processing | Stripe | 2.9% + $0.30 | 100 txns | $59 |
| AI API Calls | OpenAI | $0.02/1K tokens | 500K tokens | $10 |
| Storage | S3 | $0.023/GB | 20GB | $0.46 |
| **Total Variable** | | | | **$69.46** |

### **Total Monthly Operational:** $85.71
```

---

## Instructions for AI Agents

### When Starting a New Project

1. **Create a tracking document** named `[PROJECT_NAME]_CREDIT_TRACKING.md`
2. **Log the start time** of your session
3. **Use the session template** above to track each activity
4. **Calculate totals** at the end of each session
5. **Accumulate costs** across all sessions

### During Development

1. **Start timer** when beginning a task
2. **Note any waiting time** (compilations, tests running) - this counts toward credits
3. **Log wasted time** (errors, wrong approaches) separately for efficiency analysis
4. **End timer** when task is complete
5. **Add notes** about complexity or blockers

### When Estimating New Features

Use these formulas:

**Simple Feature:**
```
Base Time × Complexity Multiplier + 50% Buffer = Total Credits
Example: 20 min × 1.0 + 50% = 30 credits
```

**Medium Feature:**
```
Base Time × Complexity Multiplier + 50% Buffer = Total Credits
Example: 30 min × 1.3 + 50% = 59 credits
```

**Complex Feature:**
```
Base Time × Complexity Multiplier + 50% Buffer = Total Credits
Example: 60 min × 1.5 + 50% = 135 credits
```

### Complexity Multipliers

- **Simple:** 1.0 (standard CRUD, basic UI)
- **Medium:** 1.3 (business logic, integrations)
- **Complex:** 1.5-2.0 (multi-step workflows, real-time features)
- **Very Complex:** 2.0-3.0 (payment systems, advanced analytics)

### Buffer Reasoning

The 50% buffer accounts for:
- Unexpected edge cases (15%)
- Testing and debugging (20%)
- Documentation (10%)
- Iteration and refinement (5%)

---

## Cost Optimization Tips for AI Agents

### Reduce AI Credit Usage

1. **Batch similar tasks** - Do all database work together, all frontend together
2. **Reuse existing code** - Don't rebuild what already exists
3. **Use templates** - Start from proven patterns
4. **Minimize errors** - Think before coding to avoid rewrites
5. **Leverage existing tests** - Copy test patterns from similar features

### Efficiency Targets

- **Good:** 85-90% efficiency (10-15% wasted time)
- **Excellent:** 90-95% efficiency (5-10% wasted time)
- **Outstanding:** 95%+ efficiency (<5% wasted time)

**Calculate Efficiency:**
```
Efficiency = (Productive Time / Total Time) × 100%
Example: (40 min productive / 44 min total) × 100% = 90.9%
```

---

## Reporting Format for Users

At the end of each major milestone, provide this summary:

```markdown
## Development Cost Report

### Project: [Name]
### Period: [Start Date] - [End Date]

### AI Credits Consumed
- **Total Credits:** 450
- **Total Time:** 7.5 hours
- **Average Rate:** 60 credits/hour

### Breakdown by Phase
| Phase | Credits | Percentage |
|-------|---------|------------|
| Setup | 75 | 17% |
| Backend | 140 | 31% |
| Frontend | 160 | 36% |
| Testing | 50 | 11% |
| Documentation | 25 | 6% |

### Features Delivered
1. User authentication (80 credits)
2. Press release creation (120 credits)
3. Analytics dashboard (150 credits)
4. Email notifications (60 credits)
5. PDF export (40 credits)

### Efficiency Metrics
- **Productive Time:** 93%
- **Wasted Time:** 7% (migration issues, TypeScript errors)
- **Tests Passing:** 42/42 (100%)

### Estimated Operational Costs
- **Monthly Fixed:** $16.25
- **Monthly Variable:** $70-120 (depending on usage)
- **Total Monthly:** $86-136

### Next Phase Estimate
- **Remaining Features:** 8
- **Estimated Credits:** 350-450
- **Estimated Time:** 6-8 hours
- **Estimated Completion:** [Date]
```

---

## Example: Full Project Tracking

```markdown
# UpsurgeIQ Development Cost Tracking

## Phase 1: Initial Build (Complete)
- **Duration:** Dec 15-20, 2024
- **Total AI Credits:** 1,200
- **Total Time:** 20 hours
- **Features:** 25 major features
- **Efficiency:** 92%

## Phase 2: Enhancements (Current)
- **Duration:** Dec 21, 2024 - Ongoing
- **Credits Used:** 450
- **Time Spent:** 7.5 hours
- **Features Added:** 10
- **Efficiency:** 94%

## Projected Phase 3: Launch Prep
- **Estimated Credits:** 200-300
- **Estimated Time:** 3-5 hours
- **Features:** Polish, testing, documentation

## Total Project Cost (Estimated)
- **Development AI Credits:** 1,850-1,950
- **Development Time:** 30-32 hours
- **Average Cost:** 60 credits/hour

## Monthly Operational Costs (After Launch)
- **Maintenance AI Credits:** 100-150/month
- **Infrastructure:** $85-135/month
- **Total Monthly:** $85-135 + maintenance as needed
```

---

## Key Takeaways for AI Agents

1. **Always track time, not just tokens** - Manus charges for time
2. **Separate development from operations** - Different cost categories
3. **Use the 50% buffer rule** for estimates - Accounts for unknowns
4. **Log efficiency metrics** - Help improve future estimates
5. **Provide clear reports** - Users need actionable cost data
6. **Think before coding** - Reduces wasted time and credits
7. **Reuse existing patterns** - Faster and more reliable

---

## Questions to Ask Yourself

Before starting any task:

1. **Can I reuse existing code?** (Saves 50-80% of time)
2. **Do I understand the requirements?** (Prevents rewrites)
3. **What's the simplest solution?** (Avoid over-engineering)
4. **Are there proven patterns?** (Reduces trial and error)
5. **What could go wrong?** (Plan for edge cases upfront)

---

## Final Note

This tracking system helps users:
- **Budget accurately** for future projects
- **Understand cost drivers** in web development
- **Make informed decisions** about features vs. cost
- **Plan maintenance budgets** realistically
- **Compare options** (build vs. buy, simple vs. complex)

As an AI agent, your goal is to **maximize value per credit** while maintaining high quality and user satisfaction.
