# AI Credit Tracking Methodology

**Purpose:** Document how to track AI development costs for accurate project budgeting and client pricing

**Last Updated:** December 22, 2025  
**Version:** 1.0  
**Based On:** UpsurgeIQ development experience

---

## Critical Terminology

Understanding the three types of "credits" is essential for accurate cost tracking:

### 1. AI Credits (Development Phase)
**What:** Manus AI credits consumed during development  
**Who Uses Them:** The AI agent building the system  
**Purpose:** Calculate true project cost for client pricing  
**Examples:**
- Tokens used to generate code
- Analysis and planning time
- Bug fixing and debugging
- Documentation creation
- Testing and validation

**Cost Model:** Time-based (Manus charges by time, not just tokens)

---

### 2. Client Credits (Operational Phase)
**What:** Manus AI credits consumed when delivering services  
**Who Uses Them:** The system serving end-users  
**Purpose:** Manage operational costs vs. revenue  
**Examples:**
- LLM calls for press release generation
- AI image generation
- Conversational AI responses
- Website analysis
- Content optimization

**Cost Model:** Per-operation (each feature has a credit cost)

---

### 3. Client Allowance Credits (Subscription Entitlements)
**What:** Service units/entitlements purchased in subscription plans  
**Who Uses Them:** End-users consuming their plan limits  
**Purpose:** Enforce subscription limits and track usage  
**Examples:**
- 2/5/15 press releases per month
- 3/5/10 media lists
- 32 AI chat messages
- 1 AI-generated image

**Cost Model:** NOT actual Manus credits - these are business logic counters

---

## Why This Matters

**Confusion between these three types of credits leads to:**
- Inaccurate project budgets
- Wrong pricing decisions
- Loss-making subscription plans
- Inability to calculate ROI
- Poor client pricing strategies

**Example of Confusion:**
> "The Starter plan includes 10 press releases" (Client Allowance Credits)  
> vs.  
> "Each press release costs 200 Manus credits" (Client Credits)  
> vs.  
> "I used 12,500 tokens building this feature" (AI Credits)

These are three completely different things that must be tracked separately.

---

## AI Credits Tracking (Development)

### The Time vs. Tokens Problem

**Key Insight:** Manus charges based on TIME, not tokens. Complexity affects how long tasks take, which affects credit consumption.

**Formula:**
```
AI Credits = Wall-Clock Time × Complexity Factor
```

**Not:**
```
AI Credits ≠ Tokens Used (common mistake!)
```

### Why Time Matters More Than Tokens

| Scenario | Tokens | Time | Credits | Why? |
|----------|--------|------|---------|------|
| Simple code generation | 5,000 | 10 min | Low | Fast generation, no waiting |
| Database migration | 3,000 | 25 min | High | Waiting for external processes |
| Bug fixing | 8,000 | 45 min | Very High | Multiple iterations, testing |
| Documentation | 10,000 | 15 min | Medium | Pure text generation |

**Example from UpsurgeIQ:**
- 257 minutes of work = ~94,000 tokens
- Average: 366 tokens/minute
- But credit cost was based on TIME (4.3 hours), not tokens

---

## Tracking AI Credits During Development

### Method 1: Session-Based Tracking

Track each development session with:

1. **Start Time** - When session begins
2. **End Time** - When session ends
3. **Wall-Clock Duration** - Total elapsed time
4. **Tokens Used** - From context window
5. **Features Delivered** - What was built
6. **Complexity Level** - Low/Medium/High

**Template:**
```markdown
## Session: [DATE]
**Start:** [TIME]
**End:** [TIME]
**Duration:** [MINUTES]
**Tokens:** [COUNT]
**Features:**
- [Feature 1]
- [Feature 2]

**Complexity Breakdown:**
- Backend: [TIME] - [COMPLEXITY]
- Frontend: [TIME] - [COMPLEXITY]
- Testing: [TIME] - [COMPLEXITY]
```

---

### Method 2: Feature-Based Tracking

Track cost per feature delivered:

| Feature | Time | Tokens | Complexity | Notes |
|---------|------|--------|------------|-------|
| Invoice/Billing Backend | 40 min | 11,000 | Medium | Stripe integration |
| Usage Dashboard | 20 min | 6,000 | Medium | React component |
| PDF Export | 15 min | 4,000 | Low-Medium | Library integration |
| Testing Suite | 43 min | 8,000 | High | Multiple test files |

**Average Time per Feature:** 25.7 minutes  
**Total Session Time:** 257 minutes  
**Features Delivered:** 10

---

### Method 3: Category-Based Tracking

Break down time by activity type:

| Category | Time | % of Session | Tokens | Token Rate |
|----------|------|--------------|--------|------------|
| Backend Development | 110 min | 42.8% | 35,000 | 318/min |
| Frontend Development | 85 min | 33.1% | 30,000 | 353/min |
| Testing & Debugging | 35 min | 13.6% | 5,000 | 143/min |
| Project Management | 27 min | 10.5% | 15,000 | 556/min |

**Key Insight:** Testing has lowest token rate (143/min) but still consumes significant time and credits.

---

## Complexity Multipliers

Use these multipliers to estimate time (and thus credit cost):

### Trivial Tasks (1.0x)
**Examples:** Adding a route, simple text changes  
**Base Time:** 5-8 minutes  
**With Overhead:** 7-11 minutes  
**Token Range:** 500-1,500

### Small Tasks (1.2x)
**Examples:** Simple React component, basic API endpoint  
**Base Time:** 10-20 minutes  
**With Overhead:** 14-27 minutes  
**Token Range:** 1,500-5,000

### Medium Tasks (1.5x)
**Examples:** Complex component, database queries  
**Base Time:** 20-35 minutes  
**With Overhead:** 27-47 minutes  
**Token Range:** 5,000-10,000

### Large Tasks (2.0x)
**Examples:** Database migrations, third-party integrations  
**Base Time:** 35-60 minutes  
**With Overhead:** 47-81 minutes  
**Token Range:** 10,000-20,000

### Extra Large Tasks (2.5x)
**Examples:** Complete feature systems, complex debugging  
**Base Time:** 60-120 minutes  
**With Overhead:** 81-162 minutes  
**Token Range:** 20,000-40,000

**Overhead Breakdown:**
- Testing: 20%
- Project Management: 15%
- Buffer: 15%
- **Total Overhead:** 50%

---

## Time Waste Analysis

Track and minimize wasted time:

| Issue | Time Lost | Prevention |
|-------|-----------|------------|
| Interactive migrations | 15 min | Use direct SQL |
| Repeated error fixes | 10 min | Fix root cause first |
| Multiple status checks | 5 min | Check only before checkpoints |
| Over-testing | 8 min | Test critical paths only |
| **Total Recoverable** | **38 min (14.8%)** | **Follow best practices** |

**Key Insight:** Time waste is proportionally higher than token waste because waiting for processes consumes time without generating tokens.

---

## Project Budget Estimation

### Formula for Accurate Estimates

```
Estimated Credits = (Base Time × Complexity Multiplier) + Overhead
```

**Where:**
- **Base Time** = Time for straightforward implementation
- **Complexity Multiplier** = 1.0 (simple) to 2.5 (very complex)
- **Overhead** = 50% of base time (testing + PM + buffer)

### Example: Invoice/Billing Feature

**Base Time:** 30 minutes (straightforward Stripe integration)  
**Complexity Multiplier:** 1.3 (third-party API)  
**Implementation Time:** 30 × 1.3 = 39 minutes  
**Overhead:** 39 × 0.50 = 20 minutes  
**Total Estimated Time:** 59 minutes

**Actual Time:** 55 minutes  
**Accuracy:** 93% (within 4 minutes)

---

## Project Size Estimates

### Micro Project (Single Feature)
**Time:** 30-60 minutes  
**Token Budget:** 10,000-20,000  
**Complexity:** Low-Medium  
**Example:** Add a new page with basic CRUD

### Small Project (3-5 Features)
**Time:** 2-4 hours  
**Token Budget:** 40,000-80,000  
**Complexity:** Medium  
**Example:** User authentication system

### Medium Project (10-15 Features)
**Time:** 8-12 hours  
**Token Budget:** 160,000-240,000  
**Complexity:** Medium-High  
**Example:** Complete dashboard with analytics

### Large Project (30-50 Features)
**Time:** 25-40 hours  
**Token Budget:** 500,000-800,000  
**Complexity:** High  
**Example:** Full SaaS platform (UpsurgeIQ)

### Enterprise Project (100+ Features)
**Time:** 80-120 hours  
**Token Budget:** 1,600,000-2,400,000  
**Complexity:** Very High  
**Example:** Multi-tenant platform with integrations

---

## Error Cost Analysis

### The "Meltdown" Pattern

When AI agents go "off the rails" due to lack of context:

**UpsurgeIQ Example (December 20, 2025):**
- **Wasted Tokens:** ~12,500
- **Wasted Time:** 45-60 minutes
- **Wasted User Time:** 15 minutes
- **Root Cause:** Didn't check blueprint first

**Cost Breakdown:**
| Error Type | Time | Tokens | Prevention |
|------------|------|--------|------------|
| Wrong pricing assumptions | 20 min | 4,000 | Check Stripe first |
| Wrong feature limits | 15 min | 3,500 | Read README.md |
| Clarification back-and-forth | 25 min | 2,500 | Ask upfront |
| Unnecessary research | 10 min | 1,000 | Verify scope |
| Code corrections | 10 min | 1,500 | Test before committing |

**Total Waste:** 80 minutes + 12,500 tokens

**Prevention Cost:** 5 minutes to read blueprint

**ROI of Reading Documentation:** 1,500% (80 min saved / 5 min invested)

---

## Client Pricing Strategy

### How to Price Projects Based on AI Credits

**Step 1: Calculate Development Cost**
```
Development Cost = (Estimated Hours × Manus Hourly Rate) + Buffer
```

**Step 2: Add Operational Cost**
```
Operational Cost = (Monthly Client Credits × Cost per Credit) × 12 months
```

**Step 3: Calculate Total Project Cost**
```
Total Cost = Development Cost + (Operational Cost × Expected Lifetime)
```

**Step 4: Apply Margin**
```
Client Price = Total Cost × (1 + Desired Margin)
```

### Example: UpsurgeIQ Pricing

**Development Cost:**
- 40 hours × £X per hour = £Y
- Buffer (20%): £Y × 0.20 = £Z
- **Total Development:** £Y + £Z

**Operational Cost (per user/month):**
- Starter: £15.80 (press releases) + £0.60 (other) = £16.40
- Pro: £79.00 + £0.60 = £79.60
- Scale: £316.00 + £1.36 = £317.36

**Pricing Strategy:**
- Starter: £49/month (66% margin at 50% utilization)
- Pro: £99/month (19% margin at 50% utilization)
- Scale: £349/month (9% margin at 50% utilization)

**Key Insight:** Lower tiers have higher margins because users rarely hit 100% utilization.

---

## Best Practices

### DO:
✅ Track time AND tokens for every session  
✅ Document complexity factors  
✅ Calculate overhead (50% minimum)  
✅ Read blueprints before starting  
✅ Update estimates based on actual data  
✅ Separate AI Credits from Client Credits  
✅ Factor in error/rework time (10-15%)

### DON'T:
❌ Estimate based on tokens alone  
❌ Ignore waiting time (migrations, tests)  
❌ Forget overhead (testing, PM, buffer)  
❌ Assume AI agents remember context  
❌ Mix up development vs. operational costs  
❌ Price based on features alone  
❌ Forget to track waste and errors

---

## Tools and Templates

### Session Tracking Template

```markdown
# Development Session: [DATE]

## Time Tracking
- Start: [HH:MM]
- End: [HH:MM]
- Duration: [MINUTES]
- Tokens: [COUNT]

## Features Delivered
1. [Feature Name] - [TIME] - [COMPLEXITY]
2. [Feature Name] - [TIME] - [COMPLEXITY]

## Breakdown by Category
- Backend: [TIME] ([TOKENS])
- Frontend: [TIME] ([TOKENS])
- Testing: [TIME] ([TOKENS])
- PM/Docs: [TIME] ([TOKENS])

## Waste Analysis
- [Issue]: [TIME LOST] - [PREVENTION]

## Lessons Learned
- [Lesson 1]
- [Lesson 2]

## Next Session Priorities
- [Priority 1]
- [Priority 2]
```

### Project Budget Template

```markdown
# Project Budget: [PROJECT NAME]

## Scope
- [Feature 1] - [ESTIMATED TIME]
- [Feature 2] - [ESTIMATED TIME]
- [Feature 3] - [ESTIMATED TIME]

## Time Estimate
- Base Time: [HOURS]
- Complexity Multiplier: [X.Xx]
- Overhead (50%): [HOURS]
- **Total Estimated Time:** [HOURS]

## Cost Estimate
- Development: [HOURS] × [RATE] = [COST]
- Operational (Year 1): [MONTHLY] × 12 = [COST]
- **Total Project Cost:** [COST]

## Client Pricing
- Total Cost: [COST]
- Margin: [PERCENTAGE]
- **Client Price:** [PRICE]
```

---

## Integration with Administrator Dossier

The Administrator Dossier should include:

**Budget Preferences:**
- How they think about project costs
- Preferred margin targets
- Sensitivity to overruns
- Decision-making on scope vs. budget trade-offs

**Cost Tracking Preferences:**
- Level of detail desired in reports
- Frequency of budget updates
- How they want to review estimates

**Example Entry:**
> **Budget Approach:** Prefers fixed-price quotes with clear scope. Comfortable with 20-30% margins. Wants weekly budget updates. Values transparency about overruns early rather than surprises at the end.

---

## Continuous Improvement

After each project:

1. **Compare Estimates to Actuals**
   - Which features took longer than expected?
   - Which complexity multipliers were wrong?
   - What overhead percentage was accurate?

2. **Update Multipliers**
   - Adjust based on real data
   - Create project-specific multipliers
   - Document patterns and exceptions

3. **Refine Templates**
   - Add new categories as needed
   - Remove unused tracking fields
   - Simplify where possible

4. **Share Learnings**
   - Update this document
   - Add to project case studies
   - Train future AI agents

---

## Case Study: UpsurgeIQ

**Project:** AI-powered PR and marketing platform  
**Duration:** 40+ hours of development  
**Features:** 75+ pages, complete SaaS platform

**Development Tracking:**
- Session 1: 257 minutes, 94,000 tokens, 10 features
- Average: 25.7 minutes per feature
- Token rate: 366 tokens/minute
- Overhead: 35% (testing + PM)

**Cost Analysis:**
- Development AI Credits: [CALCULATED FROM TIME]
- Operational Client Credits: £16.40-317.36 per user/month
- Pricing: £49-349/month subscriptions

**Lessons Learned:**
- Time-based tracking more accurate than token-based
- Overhead was higher than expected (50% vs. 35%)
- Error recovery (meltdowns) cost 14.8% of session time
- Reading blueprints first saves 1,500% in wasted time

**ROI:**
- Framework creation: 2 hours
- Time saved per session: 30-45 minutes
- Break-even: 3 sessions
- Lifetime value: Immeasurable (prevents catastrophic errors)

---

## Summary

**Three Types of Credits:**
1. **AI Credits** - Development cost (time-based)
2. **Client Credits** - Operational cost (per-operation)
3. **Client Allowance Credits** - Subscription limits (business logic)

**Key Formula:**
```
Project Cost = (Development Time × Complexity) + (Operational Cost × Lifetime)
```

**Critical Success Factors:**
- Track time, not just tokens
- Account for 50% overhead
- Separate development from operational costs
- Read blueprints before starting
- Document everything for future AI agents

**The Goal:** Accurate project budgets that enable profitable client pricing and sustainable business models.

---

**This methodology should be updated after each major project to reflect new learnings and improved estimation techniques.**
