# Decisions Log: upsurgeIQ Project

**Last Updated:** December 22, 2025  
**Source:** 8-day chat history analysis

**Purpose:** Document major decisions, their rationale, and context to prevent revisiting settled questions.

---

## How to Use This Log

**When Making Decisions:**
1. Check this log first - decision may already be made
2. Document new decisions as they're made
3. Include context, alternatives considered, and rationale
4. Update when decisions are reversed or modified

**Format:**
- **Decision:** What was decided
- **Date:** When it was decided
- **Context:** Why this decision was needed
- **Alternatives Considered:** Other options evaluated
- **Rationale:** Why this option was chosen
- **Impact:** What this affects
- **Status:** Active, Revised, or Superseded

---

## Strategic Decisions

### Decision: Build Custom SaaS Platform (Not No-Code)

**Date:** Day 1-2 of project  
**Status:** Active

**Context:**  
Christopher initially considered three approaches: Lean MVP (Airtable + Make.com + WordPress), Scalable SaaS (Bubble/Softr), or Headless WordPress. Needed to choose the right foundation for long-term success.

**Alternatives Considered:**
1. **Lean MVP:** Airtable + Make.com + WordPress forms
   - Pros: Fastest, leverages existing skills, low cost
   - Cons: Scalability limits, manual white-labeling, limited UX

2. **Scalable SaaS:** Bubble or Softr with Airtable
   - Pros: Better UX, easier white-labeling, more scalable
   - Cons: Learning curve, higher cost, platform dependency

3. **Headless WordPress:** WordPress backend + React frontend
   - Pros: Maximum flexibility, high performance, full control
   - Cons: Most complex, requires development skills

**Rationale:**  
Chose custom SaaS platform built with Manus because:
- Manus AI can handle all coding (Christopher's question: "Can't you handle that?")
- Full control over UX and features
- True scalability for growth
- Professional, modern architecture
- No platform dependency or limitations

**Impact:**  
- Tech stack: React + tRPC + MySQL + Manus OAuth
- Development approach: AI-assisted full-stack development
- Timeline: Longer initial build, but better long-term
- Cost: Higher development investment, lower ongoing costs

---

### Decision: Brand Name "upsurgeIQ"

**Date:** Day 2-3 of project  
**Status:** Active

**Context:**  
Needed a brand name that conveyed AI-powered growth and intelligence for SMB marketing.

**Alternatives Considered:**
- AmplifAI (original working name)
- SurgeIQ
- GrowthIQ
- Other AI/growth-related names

**Rationale:**  
"upsurgeIQ" chosen because:
- "Upsurge" = upward surge, growth, momentum
- "IQ" = intelligence, smart, AI-powered
- Combined: Intelligent growth
- Memorable, professional, modern
- Available domain: surgeiq.com, surgeiq.co.uk, surgeiq.ai

**Impact:**
- Tagline: "Intelligence That Drives Growth"
- Brand identity established
- Visual system built around this name
- All marketing materials use this brand

---

### Decision: Pricing Tiers (£49/99/349)

**Date:** Day 3-4 of project  
**Status:** Active - LOCKED (DO NOT CHANGE)

**Context:**  
Needed subscription pricing that's affordable for SMBs but sustainable for business.

**Alternatives Considered:**
- Lower pricing (£29/49/99) - too cheap, unsustainable
- Higher pricing (£99/199/499) - too expensive for SMBs
- Different tier structure (2 tiers, 4 tiers)

**Rationale:**  
£49/99/349 chosen because:
- **Starter £49:** Entry point for small businesses, covers costs
- **Pro £99:** Sweet spot for growing businesses, good margin
- **Scale £349:** Enterprise-lite pricing for serious users
- Competitive with agency costs (agencies charge £1000s)
- Sustainable margins for platform operation
- Clear value differentiation between tiers

**Impact:**
- Stripe products configured with these prices
- Feature allocation designed around these tiers
- Marketing messaging built on this pricing
- **CRITICAL:** Past "meltdown" caused by AI using wrong pricing (£29/99/249)

**IMPORTANT:**  
This decision is LOCKED. Do not suggest changing pricing without explicit discussion with Christopher.

---

### Decision: Remove X/Twitter Integration

**Date:** Day 5-6 of project  
**Status:** Active

**Context:**  
Initially planned to support Facebook, Instagram, LinkedIn, and X/Twitter. Christopher requested removal of X/Twitter.

**Rationale:**  
- Christopher's explicit preference
- Focus resources on core platforms
- X/Twitter API challenges and costs
- Most SMBs prioritize Facebook, Instagram, LinkedIn

**Impact:**
- Social media distribution: Facebook, Instagram, LinkedIn only
- OAuth flow: Three platforms instead of four
- Campaign Lab: Three platforms for ad distribution
- Simplified onboarding and connection management

**IMPORTANT:**  
Do not add X/Twitter features without explicit request from Christopher.

---

## Technical Architecture Decisions

### Decision: Tech Stack (React 19 + Tailwind 4 + tRPC 11)

**Date:** Day 2 of project  
**Status:** Active

**Context:**  
Needed modern, scalable tech stack for full-stack SaaS platform.

**Chosen Stack:**
- **Frontend:** React 19 + Tailwind CSS 4 + TypeScript
- **Backend:** Express 4 + tRPC 11
- **Database:** MySQL/TiDB via Drizzle ORM
- **Auth:** Manus OAuth
- **AI:** Manus LLM integration

**Rationale:**
- React 19: Latest, most capable React version
- Tailwind 4: Modern utility-first CSS with new features
- tRPC 11: Type-safe API without REST boilerplate
- MySQL/TiDB: Reliable, scalable relational database
- Manus OAuth: Built-in, no external auth service needed
- Manus LLM: Built-in AI, no API key management

**Impact:**
- End-to-end type safety (TypeScript + tRPC)
- Fast development with Tailwind utilities
- No manual API contract management
- Built-in auth and AI capabilities
- Scalable architecture from day one

---

### Decision: Conversation Memory Implementation

**Date:** December 22, 2025  
**Status:** Active

**Context:**  
Discovered critical gap: AI Assistant had no conversation memory. Clients would have to repeat information every session, creating terrible UX.

**Problem:**
- Conversations saved to database ✅
- Conversations never loaded when AI responds ❌
- Result: AI has amnesia, clients frustrated

**Solution Implemented:**
- Load last 20 conversation turns from database
- Include in AI context with every response
- Token-efficient (20 turns = ~3000-8000 tokens)
- Recent conversations more relevant than old ones

**Rationale:**
- 20 turns balances context vs token limits
- Covers last few days/weeks of interaction
- Prevents token limit errors
- All conversations still stored permanently in database

**Impact:**
- Clients now have conversation continuity
- AI remembers previous discussions
- Better user experience
- Prevents Christopher's frustration from affecting clients

---

### Decision: Framework Documentation System

**Date:** December 22, 2025  
**Status:** Active

**Context:**  
Christopher experiencing severe frustration with AI agents losing context between sessions, asking repeated questions, and making wrong assumptions.

**Problem:**
- AI agents don't retain context across sessions
- Each new iteration starts from scratch
- Christopher has to repeat information
- Leads to "meltdowns" with wrong specs

**Solution Implemented:**
- Framework documentation in `/docs/framework/`
- Mandatory reading for all AI agents
- Bootstrap via README.md
- Quality gate: AI must address Christopher by name
- Complete chat history preserved

**Components:**
1. AI_AGENT_START_HERE.md - Entry point and reading order
2. ADMINISTRATOR_DOSSIER.md - Christopher's profile
3. PROJECT_CONTEXT.md - Full project documentation
4. COMPLETE_CHAT_HISTORY.md - 8-day conversation history
5. WORKING_METHODOLOGY.md - Development workflow
6. CLIENT_PREFERENCES.md - Specific requirements
7. DECISIONS_LOG.md - This file
8. HOW_TO_GET_CONVERSATION_HISTORY.md - Scraping method

**Rationale:**
- Prevents context loss across AI iterations
- Reduces wasted AI credits on redundant work
- Improves collaboration efficiency
- Documents project knowledge
- Solves the same problem clients would face

**Impact:**
- Future AI agents have full context
- No more repeated questions
- Faster, more effective collaboration
- Better use of AI credits
- Quality gate via name-addressing protocol

---

## Feature Decisions

### Decision: Client Dossier Auto-Research

**Date:** Day 4-5 of project  
**Status:** Active

**Context:**  
Need comprehensive business intelligence about each client to generate high-quality, personalized PR content.

**Implementation:**
- AI-powered website research and analysis
- SIC code classification (Section → Division → Group)
- Brand voice and tone configuration (5 tones × 4 styles)
- Industry context and competitive landscape
- Target audience identification
- Key messaging and value propositions

**Rationale:**
- Better AI-generated content with rich context
- Personalized press releases and social posts
- Professional quality without manual research
- Competitive advantage over generic tools

**Impact:**
- Onboarding includes dossier generation
- All AI content generation uses dossier context
- Conversation memory includes dossier access
- Higher content quality and relevance

---

### Decision: Campaign Lab with A/B Testing

**Date:** Day 5-6 of project  
**Status:** Active

**Context:**  
SMBs struggle with effective ad campaigns. Need intelligent system that tests and optimizes automatically.

**Implementation:**
- Multi-variant ad creative generation (4-6 variations)
- Psychological angle testing framework
- Real-time performance monitoring
- Automatic winning variation identification
- Continuous redeployment system
- Conversational AI for campaign management

**Rationale:**
- Democratizes advanced marketing tactics
- Removes guesswork from ad campaigns
- Continuous optimization improves ROI
- Differentiates from basic content tools

**Impact:**
- Pro tier feature (£99/month minimum)
- Requires Facebook/LinkedIn Ads API integration
- Complex feature but high value
- Competitive moat

---

### Decision: White-Label Partnership Program

**Date:** Day 2-3 of project  
**Status:** Active

**Context:**  
Opportunity to scale through B2B2C model via business networks and chambers of commerce.

**Implementation:**
- Partner registration and onboarding
- Co-branded portal customization
- 20% commission tracking
- Partner dashboard with member analytics
- Marketing materials library
- Dedicated account manager

**Rationale:**
- Faster customer acquisition through partners
- Leverages existing business networks
- Recurring revenue from partner members
- Scalable go-to-market strategy

**Impact:**
- Dual business model: Direct B2C + White-label B2B
- Partner portal development required
- Commission tracking and payout system
- Co-branding capabilities needed

---

### Decision: Media List "Share & Earn" Program

**Date:** Day 5 of project  
**Status:** Active

**Context:**  
Building comprehensive journalist databases is expensive and time-consuming. Need crowdsourced approach.

**Implementation:**
- Users can submit journalist contacts
- AI verification system for contacts
- £0.10 payment per verified contact
- GDPR-compliant opt-in system
- Quality control and deduplication

**Rationale:**
- Crowdsources database building
- Incentivizes quality contributions
- Affordable for platform (£0.10 vs £1+ per contact)
- Grows database organically
- Community engagement

**Impact:**
- Payment processing for micro-transactions
- Contact verification workflow
- Quality control system
- Database growth strategy

---

## Design Decisions

### Decision: Color Palette (Deep Teal + Lime Green)

**Date:** Day 3 of project  
**Status:** Active - LOCKED

**Context:**  
Needed distinctive, professional color scheme that conveys growth and intelligence.

**Colors Chosen:**
- **Primary:** Deep Teal (#008080)
  - Professional, trustworthy, calm
  - Associated with growth and stability
  
- **Accent:** Lime Green (#7FFF00)
  - Energy, growth, vitality
  - High contrast for CTAs and highlights
  - Modern, distinctive

**Rationale:**
- Distinctive (not generic blue/red)
- Professional yet energetic
- Good contrast and accessibility
- Memorable brand identity

**Impact:**
- Tailwind theme configuration
- All UI components use these colors
- Marketing materials and brand assets
- **DO NOT change without explicit approval**

---

### Decision: Typography (Inter + Poppins)

**Date:** Day 3 of project  
**Status:** Active

**Context:**  
Needed modern, readable font pairing for professional SaaS platform.

**Fonts Chosen:**
- **Body:** Inter - Clean, highly readable sans-serif
- **Headings:** Poppins - Modern, geometric, distinctive

**Rationale:**
- Both are Google Fonts (free, reliable CDN)
- Excellent readability across devices
- Professional, modern aesthetic
- Good pairing (geometric + humanist)

**Impact:**
- Global typography system in index.css
- All text uses these fonts
- **DO NOT introduce new fonts without discussion**

---

## Integration Decisions

### Decision: Manus OAuth for Authentication

**Date:** Day 2 of project  
**Status:** Active

**Context:**  
Needed reliable authentication system without managing auth infrastructure.

**Rationale:**
- Built into Manus platform (no setup required)
- Secure, battle-tested
- No external auth service costs
- Session management included
- User management built-in

**Impact:**
- No Auth0, Clerk, or custom auth needed
- Simplified onboarding flow
- Built-in user roles (admin/user/partner)
- Session cookies managed automatically

---

### Decision: Stripe for Payment Processing

**Date:** Day 4 of project  
**Status:** Active

**Context:**  
Needed reliable, professional payment processing for subscriptions.

**Rationale:**
- Industry standard for SaaS subscriptions
- Excellent developer experience
- Built-in subscription management
- PCI compliance handled
- Webhook system for events

**Products Configured:**
- Starter: prod_Td2pC4hUddBbAH (price_1SfmjyAGfyqPBnQ9JPZoNoWl)
- Pro: prod_Td2sl51moqbe4C (price_1SfmmWAGfyqPBnQ9LeAJ711i)
- Scale: prod_Td2tuhKJPQ41d8 (price_1SfmnuAGfyqPBnQ9U5P7KfF4)

**Impact:**
- Subscription checkout flow
- Webhook handlers for subscription events
- Invoice and billing history
- Payment method management

---

### Decision: SendGrid for Email Delivery

**Date:** Day 6 of project  
**Status:** Active

**Context:**  
Needed reliable email delivery for transactional emails and press release distribution.

**Alternatives Considered:**
- Mailgun
- Amazon SES
- Postmark

**Rationale:**
- Excellent deliverability
- Good developer experience
- Template system included
- Analytics and tracking
- Reasonable pricing

**Impact:**
- Welcome emails
- Payment confirmations
- Press release distribution
- Admin error alerts
- Email template system

---

## Reversed or Modified Decisions

### Decision: Press Release Distribution Services Integration

**Date:** Day 1-2 of project  
**Status:** Superseded

**Original Decision:**  
Integrate with free press release distribution services (PRLog, OpenPR, PR.com, IssueWire, 1888PressRelease).

**Investigation Results:**
- No native Make.com apps
- No public APIs (except PR.com read-only)
- Would require browser automation (complex, fragile)

**Revised Decision:**  
Focus on email distribution to journalist media lists instead. Free PR services are low priority.

**Rationale:**
- Email distribution more reliable and controllable
- Journalist lists provide better targeting
- Browser automation too fragile for production
- Better ROI focusing on core features

**Impact:**
- Media list management prioritized
- Email distribution system built
- Free PR services deprioritized (future enhancement)

---

## Pending Decisions

### Decision: Database Migration Strategy

**Status:** Pending

**Context:**  
Database schema has 70+ tables defined, but only some exist in actual database. Need to run full migration.

**Options:**
1. Run `pnpm db:push` interactively (requires 70+ confirmations)
2. Create tables individually via SQL as needed
3. Run migration during maintenance window

**Considerations:**
- Interactive migration takes 30+ minutes
- Individual SQL creation is faster but piecemeal
- Full migration ensures schema/database alignment

**Next Steps:**
- Schedule maintenance window for full migration
- Or continue creating tables as needed

---

### Decision: TypeScript Error Resolution

**Status:** Pending

**Context:**  
67 TypeScript errors in routers.ts, primarily related to ResultSetHeader type mismatches.

**Options:**
1. Fix all errors immediately
2. Fix errors as we work on related features
3. Add type assertions as temporary fix

**Considerations:**
- Errors don't block functionality (dev server runs)
- Fixing all at once is time-consuming
- Type safety is important for production

**Next Steps:**
- Prioritize fixing errors in critical paths
- Address remaining errors before launch

---

## How to Add New Decisions

**Template:**

```markdown
### Decision: [Clear, Descriptive Title]

**Date:** [When decided]  
**Status:** Active | Pending | Revised | Superseded

**Context:**  
[Why this decision was needed, what problem it solves]

**Alternatives Considered:**
1. Option A: Pros/Cons
2. Option B: Pros/Cons
3. Option C: Pros/Cons

**Rationale:**  
[Why the chosen option was selected, key factors]

**Impact:**  
[What this affects, what changes as a result]

**IMPORTANT:** [Any critical notes or warnings]
```

---

## Decision Review Schedule

**When to Review:**
- Before major milestones (launch, new features)
- When decisions seem outdated
- When context has changed significantly
- Quarterly for active projects

**Last Review:** December 22, 2025  
**Next Review:** Before platform launch

---

**End of Decisions Log**
