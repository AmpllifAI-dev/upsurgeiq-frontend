# Project Context: UpsurgeIQ

**Project Name:** UpsurgeIQ  
**Client:** Christopher Lembke  
**Start Date:** December 2025  
**Status:** Pre-Launch Testing  
**Last Updated:** December 23, 2025

---

## Project Purpose

### The Problem

Small to medium businesses struggle with PR and marketing because:
- Writing professional press releases takes hours of time
- Coordinating social media across multiple platforms is complex and time-consuming
- Finding and managing journalist contacts is tedious and expensive
- Traditional PR agencies charge thousands per month, pricing out small businesses
- DIY PR often lacks quality, consistency, and reach
- Brand voice becomes inconsistent when multiple people create content
- No centralized system for managing company information and messaging

### The Solution

UpsurgeIQ is an AI-powered PR and marketing platform that automates content creation while maintaining brand consistency. The platform uses a comprehensive Business Dossier system to understand each client's unique brand, industry, and messaging, then generates personalized press releases, social media content, and marketing advice.

**Key Innovation:** The Client Dossier + Conversation Memory system ensures AI remembers previous discussions and provides contextual, personalized advice—not generic responses.

### Target Users

**Primary:** Small to medium businesses (1-50 employees) who need professional PR but can't afford traditional agencies

**Secondary:** 
- Marketing professionals managing multiple clients
- PR agencies looking for white-label solutions
- Business consultants offering marketing services

**User Characteristics:**
- Limited marketing budget (£50-£350/month)
- Need professional-quality content quickly
- Want consistency across channels
- Value personalization and context
- Prefer conversational interfaces over complex tools

### Value Proposition

**For Businesses:** Professional PR at 1/10th the cost of traditional agencies, with AI that actually knows your business

**For Agencies:** White-label platform with 20% commission, allowing them to scale without hiring more staff

**Competitive Advantages:**
1. **Business Dossier System** - AI knows your company, not generic responses
2. **Conversation Memory** - AI remembers previous discussions for continuity
3. **Integrated Workflow** - Press release → Social posts → Media distribution in one platform
4. **Curated Media Lists** - Industry-specific journalist contacts, not generic databases
5. **Voice Interface** - Call in and dictate content (Pro/Scale tiers)

---

## Goals and Success Criteria

### Primary Goals

1. **User Adoption and Retention**
   - Success Metric: Monthly Active Users (MAU), Churn Rate
   - Target: 1000 paying users by Q2 2026, <5% monthly churn

2. **Content Quality**
   - Success Metric: User satisfaction scores, content approval rate
   - Target: >4.5/5 satisfaction, >80% first-draft approval rate

3. **Platform Reliability**
   - Success Metric: Uptime, error rate
   - Target: 99.9% uptime, <0.1% error rate on AI operations

### Secondary Goals

- Revenue growth: £50K MRR by Q2 2026
- White-label partnerships: 10 active partners by Q3 2026
- Media list quality: >95% contact accuracy
- AI response time: <3 seconds average

### What "Done" Looks Like

**MVP Complete (Current Status):**
- Users can create business dossiers
- AI generates press releases and social posts
- Social media scheduling works across platforms
- Media lists can be purchased and used
- AI assistant provides conversational advice
- Subscription and payment processing functional

**Version 1.0 (Target: Q1 2026):**
- Conversation memory working flawlessly
- Bug reporting system with auto-investigation
- Comprehensive test coverage
- Help center and documentation
- Security audit passed
- Production-ready with live payments

---

## Technical Architecture

### High-Level Overview

```
Public Website (WordPress on WP Engine)
         |
         v
Frontend (React 19) <--tRPC--> Backend (Express 4) <--> Database (MySQL/TiDB)
                                     |
                                     v
                          External Services:
                          - Manus LLM (AI)
                          - Stripe (Payments)
                          - SendGrid (Email)
                          - Twilio (Voice)
                          - Facebook/Instagram/LinkedIn APIs
```

**Key Pattern:** tRPC provides end-to-end type safety—procedures are contracts between frontend and backend

### Technology Stack

**Public Website (WordPress on WP Engine):**
- Platform: WordPress
- Hosting: WP Engine
- Purpose: Marketing pages, blog, content presentation, public-facing website
- Integration: Syncs with React app via REST API for business profiles and content

**Frontend (React App - Authenticated User Dashboard):**
- Framework: React 19
- Styling: Tailwind CSS 4
- Routing: Wouter
- State Management: tRPC + React Query
- UI Components: shadcn/ui
- Build Tool: Vite
- Purpose: Authenticated user dashboard, PR creation tools, campaign management, admin features

**Backend:**
- Runtime: Node.js 22
- Framework: Express 4
- API: tRPC 11 (not REST)
- Language: TypeScript
- ORM: Drizzle

**Database:**
- Type: MySQL/TiDB
- ORM: Drizzle ORM
- Hosting: Manus managed database

**Infrastructure:**
- Hosting: Manus platform
- CI/CD: Manus automatic deployment
- Version Control: Git (Manus managed)
- Monitoring: Custom error logging system

**External Services:**
- Authentication: Manus OAuth
- AI: Manus LLM integration (invokeLLM)
- Payments: Stripe
- Email: SendGrid
- Voice: Twilio
- Social Media: Facebook, Instagram, LinkedIn APIs

### Why These Technologies?

**WordPress on WP Engine:** Proven CMS for public-facing website, blog, and marketing content. Easy content management for non-technical users. WP Engine provides enterprise-grade hosting with excellent performance and security.

**React App (Manus Platform):** Authenticated user dashboard where customers create press releases, manage campaigns, and access AI tools. Separate from public website for security and performance.

**tRPC:** End-to-end type safety without code generation. Procedures are contracts. No manual API documentation needed. Eliminates entire class of bugs.

**React 19:** Latest features, better performance, improved developer experience. shadcn/ui provides beautiful components out of the box.

**Tailwind CSS 4:** Utility-first CSS, rapid development, consistent design system. New @theme syntax for better theming.

**Drizzle ORM:** Type-safe SQL queries, lightweight, excellent TypeScript support. Better than Prisma for this use case.

**Manus Platform:** Integrated hosting, database, OAuth, LLM access. Eliminates infrastructure complexity.

### Key Technical Decisions

**Decision:** Use tRPC instead of REST  
**Rationale:** End-to-end type safety, no API documentation needed, procedures are self-documenting contracts  
**Tradeoffs:** Less familiar to some developers, requires TypeScript

**Decision:** Store conversation history in database, not in-memory  
**Rationale:** Persistence across sessions, scalability, ability to search/analyze conversations  
**Tradeoffs:** Database queries on every AI interaction (mitigated by limiting to 20 turns)

**Decision:** Business Dossier as central context system  
**Rationale:** All AI interactions need company context. Single source of truth prevents inconsistency.  
**Tradeoffs:** Requires thorough onboarding, dossier must be kept up-to-date

**Decision:** Subscription-based with usage limits  
**Rationale:** Predictable revenue, prevents abuse, aligns with SaaS best practices  
**Tradeoffs:** Complexity in limit enforcement, potential user friction

---

## Data Model

### Core Entities

**users:**
- Purpose: User accounts and authentication
- Key Attributes: openId (Manus OAuth), email, name, role (user/admin)
- Relationships: Has one subscription, has one business, has many conversations

**businesses:**
- Purpose: Business Dossier - comprehensive company profile
- Key Attributes: name, website, industry, sicCode, brandVoice, brandTone, targetAudience, services, uniqueSellingPoints, competitors, keyMessages
- Relationships: Belongs to user, has many press releases, has many social posts, has many conversations

**subscriptions:**
- Purpose: Stripe subscription management
- Key Attributes: plan (starter/pro/scale), status, stripeCustomerId, stripeSubscriptionId, currentPeriodEnd
- Relationships: Belongs to user

**press_releases:**
- Purpose: Generated press releases
- Key Attributes: title, content, status (draft/scheduled/published), scheduledFor, imageUrl
- Relationships: Belongs to business, has many social_media_posts, has many distributions

**social_media_posts:**
- Purpose: Platform-specific social media content
- Key Attributes: platform (facebook/instagram/linkedin), content, status, scheduledFor
- Relationships: Belongs to press_release, belongs to business

**media_lists:**
- Purpose: Curated journalist contact lists
- Key Attributes: name, industry, region, geography, price
- Relationships: Has many media_list_contacts

**ai_conversations:**
- Purpose: **Conversation memory for AI continuity**
- Key Attributes: role (user/assistant/system), content, conversationType (chat/phone_call/email), metadata
- Relationships: Belongs to user, belongs to business (dossier)
- **Critical:** This enables AI to remember previous discussions

**campaigns:**
- Purpose: Campaign Lab campaigns
- Key Attributes: name, goal, budget, platform, status
- Relationships: Belongs to business, has many campaign_variants

### Data Flow

**Press Release Generation:**
1. User fills guided prompt form
2. Frontend sends to `pressRelease.generate` tRPC procedure
3. Backend loads business dossier
4. Backend calls `invokeLLM` with dossier context
5. AI generates press release content
6. Backend saves to database
7. Backend generates image via ImageService
8. Response sent to frontend with press release ID
9. Frontend navigates to editor for refinement

**AI Chat with Memory:**
1. User sends chat message
2. Frontend calls `aiAssistant.chat` tRPC procedure
3. Backend loads business dossier
4. **Backend loads last 20 conversation turns from ai_conversations table**
5. Backend builds messages array: [system_prompt, ...conversation_history, current_message]
6. Backend calls `invokeLLM` with full context
7. AI generates response with conversation continuity
8. Backend saves user message and AI response to ai_conversations
9. Response sent to frontend
10. Frontend displays message with full context

---

## Key Features

### Must-Have Features (MVP) - COMPLETE ✅

1. **Business Dossier Creation**
   - Description: AI-powered website analysis to auto-populate company profile
   - User Value: Saves hours of manual data entry, ensures comprehensive context
   - Status: Complete

2. **AI Press Release Generation**
   - Description: Generate professional press releases using dossier context
   - User Value: Professional content in minutes, not hours
   - Status: Complete

3. **Social Media Automation**
   - Description: Auto-generate platform-specific posts from press releases
   - User Value: Consistent messaging across channels with one click
   - Status: Complete

4. **Media List Management**
   - Description: Purchase and use curated journalist contact lists
   - User Value: Reach relevant journalists without manual research
   - Status: Complete

5. **AI Assistant with Conversation Memory**
   - Description: Chat interface with AI that remembers previous discussions
   - User Value: Contextual advice without repeating information
   - Status: **Complete (Dec 22, 2025)** - Conversation memory implemented

6. **Subscription Management**
   - Description: Stripe integration for subscription billing
   - User Value: Secure, professional payment processing
   - Status: Complete (test mode)

### In Progress Features 🔄

1. **Bug Reporting System**
   - Description: Users can report issues, AI investigates automatically
   - User Value: Faster issue resolution, transparent tracking
   - Status: 90% complete (investigation status field added, trigger button pending)

2. **Framework Documentation**
   - Description: Comprehensive documentation for AI agent continuity
   - User Value: Prevents context loss between AI iterations
   - Status: In progress (Dec 22, 2025)

### Nice-to-Have Features (Post-MVP)

- Advanced analytics dashboard with trend analysis
- Multi-language support for international markets
- Integration with additional social platforms (TikTok, Pinterest)
- AI-powered competitor monitoring
- Automated media monitoring and sentiment analysis
- Advanced Campaign Lab features (multi-variate testing, ML optimization)

### Out of Scope

- Native mobile apps (web-responsive only for now)
- Video content generation
- Podcast production
- In-house journalist database (use curated lists only)
- Traditional PR agency services (human-led campaigns)

---

## Constraints and Limitations

### Technical Constraints

- Must work in modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- API response time must be <5 seconds for AI operations
- Database queries must be <200ms
- Must support concurrent users (target: 1000 simultaneous)

### Business Constraints

- **Budget:** Bootstrap/self-funded, must be cost-efficient
- **Timeline:** MVP complete, V1.0 target Q1 2026
- **Resources:** Solo developer + AI assistance (Christopher + AI agents)

### Regulatory/Compliance

- GDPR compliance required (EU users)
- Email opt-in required for journalist contacts
- Stripe PCI compliance (handled by Stripe)
- Data retention policies for conversation history

### Known Limitations

- AI-generated content requires human review (not 100% autonomous)
- Voice transcription accuracy depends on audio quality
- Social media posting requires OAuth (users must connect accounts)
- Media list accuracy depends on journalist database quality
- Conversation memory limited to last 20 turns (token management)

---

## Integration Points

### External Systems

**Manus OAuth:**
- Purpose: User authentication
- Integration Method: OAuth 2.0 flow
- Data Exchanged: User openId, email, name

**Stripe:**
- Purpose: Payment processing and subscription management
- Integration Method: Stripe API + Webhooks
- Data Exchanged: Customer info, subscription status, payment events

**SendGrid:**
- Purpose: Transactional emails (welcome, notifications, press release distribution)
- Integration Method: SendGrid API
- Data Exchanged: Email content, recipient lists, delivery status

**Twilio:**
- Purpose: Voice call-in feature for AI assistant
- Integration Method: Twilio Voice API + Webhooks
- Data Exchanged: Call recordings, transcriptions, call metadata

**Facebook/Instagram/LinkedIn:**
- Purpose: Social media posting and OAuth
- Integration Method: Platform-specific APIs + OAuth 2.0
- Data Exchanged: Post content, images, scheduling data, user tokens

**WordPress REST API:**
- Purpose: Sync business profiles and preset prompts
- Integration Method: WordPress REST API with custom endpoints
- Data Exchanged: Business profiles, press releases, preset prompts

**Manus LLM:**
- Purpose: AI content generation and conversation
- Integration Method: `invokeLLM` helper function
- Data Exchanged: Messages array, AI responses, token usage

### Authentication/Authorization

- **Method:** Manus OAuth 2.0
- **Provider:** Manus platform
- **Roles:** user, admin
- **Session:** JWT cookie, httpOnly, secure
- **Authorization:** Role-based access control (RBAC), subscription tier checks

---

## Security Considerations

### Authentication

- Manus OAuth handles authentication
- Session cookies are httpOnly and secure
- No passwords stored (OAuth only)
- Admin role required for platform management

### Authorization

- Role-based access control (user/admin)
- Subscription tier enforcement (checkLimit function)
- User can only access their own data
- Admin can access all data for support

### Data Protection

- **Encryption:** TLS in transit (HTTPS), database encryption at rest (managed by Manus)
- **PII Handling:** Email, name stored securely. No credit cards (Stripe handles)
- **Secrets Management:** Environment variables, never committed to git
- **API Keys:** Stored in Manus platform, injected at runtime

### Compliance

- GDPR: User data deletion on request, data export available
- Email: Opt-in required for journalist contacts
- Stripe: PCI DSS compliance (handled by Stripe)

---

## Performance Requirements

### Response Time

- **API Endpoints:** <200ms for database queries
- **AI Operations:** <5 seconds for content generation
- **Page Load:** <2 seconds for initial load
- **Social Media Posting:** <3 seconds per platform

### Scalability

- **Expected Users:** 1000 concurrent users by Q2 2026
- **Data Volume:** 10K press releases/month, 100K conversations/month
- **Traffic Patterns:** Business hours (9am-5pm GMT), weekday heavy

### Availability

- **Uptime Target:** 99.9% (managed by Manus platform)
- **Maintenance Windows:** Sunday 2am-4am GMT if needed

---

## Development Workflow

### Environments

- **Local:** Developer machine, localhost:3000
- **Development:** Manus dev server (auto-deployed on save)
- **Production:** Manus production (deployed via checkpoint + publish)

### Deployment Process

1. Develop and test locally
2. Save checkpoint via `webdev_save_checkpoint`
3. Test in dev environment (automatic)
4. Click "Publish" button in Manus UI
5. Production deployment (automatic)

### Version Control

- Git managed by Manus platform
- Checkpoints = commits
- Rollback available via `webdev_rollback_checkpoint`

---

## Timeline and Milestones

### Key Milestones

**MVP Complete:** December 2025 ✅
- All core features functional
- Stripe integration working (test mode)
- User onboarding complete

**Conversation Memory Fixed:** December 22, 2025 ✅
- AI conversations stored in database
- Last 20 turns loaded automatically
- Conversation continuity working

**V1.0 Launch:** Q1 2026 (Target)
- Bug reporting system complete
- Comprehensive test coverage
- Security audit passed
- Live Stripe payments
- Help center and documentation
- Production-ready

### Current Phase

**Phase:** Active Development (Post-MVP Refinement)

**Started:** December 2025

**Expected Completion:** Q1 2026

**Progress:** MVP complete, fixing critical issues (conversation memory, bug reporting), preparing for production launch

---

## Team and Stakeholders

### Project Team

- **Project Owner:** Christopher Lembke
- **Development:** Christopher Lembke + AI Agents (Manus platform)
- **Design:** Christopher Lembke + AI assistance
- **QA:** Christopher Lembke + automated testing

### Stakeholders

- **Client Contact:** Christopher Lembke (founder/owner)
- **End Users:** Small business owners, marketing professionals
- **Future Partners:** Marketing agencies (white-label program)

---

## Resources and References

### Documentation

- **Framework Docs:** `/docs/framework/` (this directory)
- **API Documentation:** tRPC procedures are self-documenting (see `/server/routers.ts`)
- **Database Schema:** `/drizzle/schema.ts`

### External Resources

- **React 19 Docs:** https://react.dev
- **tRPC Docs:** https://trpc.io
- **Tailwind CSS 4 Docs:** https://tailwindcss.com
- **Drizzle ORM Docs:** https://orm.drizzle.team
- **shadcn/ui Docs:** https://ui.shadcn.com

### Project Management

- **Repository:** Managed by Manus platform
- **Communication:** Manus chat interface
- **Checkpoints:** Version control via Manus

---

## Glossary

**Business Dossier:** Comprehensive company profile that provides context for all AI operations

**Conversation Memory:** System that stores and retrieves AI chat history for continuity

**Client Dossier:** Same as Business Dossier (used interchangeably)

**tRPC Procedure:** Backend function that can be called from frontend with full type safety

**Checkpoint:** Git commit in Manus platform, used for version control and rollback

**Media List:** Curated list of journalist contacts by industry/region

**Campaign Lab:** A/B testing system for ad creative

**White-Label:** Rebranded version of platform for agency partners

**SIC Code:** Standard Industrial Classification code for industry categorization

**Brand Voice:** Tone and style of company communications (e.g., Professional, Casual, Technical)

---

## Change Log

### December 22, 2025
- **Conversation Memory System Implemented:** AI now loads last 20 conversation turns for continuity
- **ai_conversations Table Created:** Database table for storing all AI chat history
- **Framework Documentation Started:** Populating framework docs with real project context
- **Technical Debt Log Added:** Tracking quick fixes for future cleanup

### December 2025
- **MVP Complete:** All core features functional
- **Stripe Integration:** Payment processing working (test mode)
- **Error Logging System:** Comprehensive error tracking implemented
- **Email Notifications:** SendGrid integration complete

---

**This document should be updated whenever:**
- New features are added or completed
- Major technical decisions are made
- Architecture changes
- Business model evolves
- Critical bugs are discovered and fixed
- New integrations are added

**Last Updated:** December 22, 2025  
**Updated By:** AI Agent (Session with Christopher Lembke)

---

**CRITICAL FOR NEXT AI AGENT:**

1. **Read this document FIRST** before taking any action
2. **Conversation memory is now working** - don't break it
3. **Business Dossier is central** - always load it for AI operations
4. **tRPC is the API** - no REST routes, procedures are contracts
5. **Check subscription limits** - use `checkLimit()` before paid operations
6. **Test your changes** - write vitest tests for new features
7. **Update this document** - add your learnings to the change log
