# Client Preferences: Christopher Lembke

**Last Updated:** December 22, 2025  
**Source:** 8-day chat history analysis

**Purpose:** Document Christopher's specific preferences, requirements, and "things to avoid" for the upsurgeIQ project.

---

## Communication Preferences

### Mandatory Protocol

**ALWAYS Address by Name:**
- Every message must begin with "Christopher, [message]"
- This is NON-NEGOTIABLE
- Serves as quality gate for context awareness
- If you forget, Christopher will challenge you immediately

**Communication Style:**
- Direct and practical - no fluff
- Professional but conversational
- No corporate jargon or buzzwords
- Provide context and reasoning, not just answers

### Information Delivery

**How to Present Information:**
- Explain trade-offs and implications
- Use concrete examples and scenarios
- Break down complex topics into digestible chunks
- Present 2-3 options with pros/cons when making recommendations

**What to Include:**
- Context: Why this matters
- Options: Different approaches available
- Recommendation: Your suggested approach with reasoning
- Trade-offs: What we gain and lose with each option

---

## Technical Preferences

### Technology Stack (DECIDED)

**Frontend:**
- React 19 (not older versions)
- Tailwind CSS 4 (not 3)
- TypeScript (strict mode)
- tRPC 11 for API calls (not REST)

**Backend:**
- Express 4
- tRPC 11 for procedures
- MySQL/TiDB via Drizzle ORM
- Manus OAuth for authentication

**AI Integration:**
- Manus LLM (built-in, no external API keys)
- Superjson for Date handling
- Conversation history (last 20 turns)

**DO NOT:**
- Suggest alternative frameworks without strong justification
- Introduce new dependencies without discussion
- Change core architecture decisions

### Code Quality Standards

**What Christopher Values:**
- Clean, readable code over clever code
- Proper TypeScript types (no `any`)
- Comprehensive error handling
- Thorough testing before delivery

**Testing Requirements:**
- Write vitest tests for critical paths
- Test before creating checkpoint
- No delivery without testing

**Documentation:**
- Update todo.md as you work
- Mark completed items as [x]
- Document decisions in DECISIONS_LOG.md
- Update framework docs with new learnings

---

## Design & UX Preferences

### Brand Identity (LOCKED)

**Brand Name:** upsurgeIQ  
**Tagline:** "Intelligence That Drives Growth"

**Colors:**
- Primary: Deep Teal (#008080)
- Accent: Lime Green (#7FFF00)
- DO NOT change these without explicit approval

**Typography:**
- Headings: Poppins
- Body: Inter
- DO NOT introduce new fonts

### Design Philosophy

**Christopher's Preferences:**
- Modern, professional, elegant
- Clean layouts with good whitespace
- Responsive design (mobile-first)
- Accessibility is important

**Avoid:**
- Generic, template-looking designs
- Cluttered interfaces
- Poor mobile experience
- Low contrast or readability issues

---

## Business Model Preferences

### Pricing (LOCKED - DO NOT CHANGE)

**Subscription Tiers:**
- **Starter:** £49/month
  - 2 press releases
  - 3 media lists
  - 10 social media posts
  
- **Pro:** £99/month
  - 5 press releases
  - 5 media lists
  - 25 social media posts
  
- **Scale:** £349/month
  - 15 press releases
  - 10 media lists
  - 100 social media posts

**Add-Ons:**
- AI Chat Assistant: £39/month
- AI Call-In Service: £99/month
- White-Label Partnership: Custom pricing

**CRITICAL:**
- These prices are FINAL
- DO NOT suggest different pricing without explicit discussion
- Past "meltdown" was caused by AI using wrong pricing

### Feature Access by Tier

**Starter Tier:**
- Basic press release generation
- Social media distribution
- Media list access (purchase additional)
- Standard support

**Pro Tier:**
- Everything in Starter
- Campaign Lab access
- Advanced analytics
- Priority support
- AI Chat Assistant (add-on)

**Scale Tier:**
- Everything in Pro
- Unlimited campaigns
- White-label capabilities
- Dedicated account manager
- AI Call-In Service (add-on)

**DO NOT:**
- Change feature allocation without approval
- Add features to lower tiers without discussion
- Remove features from higher tiers

---

## Feature Development Preferences

### What Christopher Wants

**Priority Features:**
1. **Conversation Memory** - ✅ COMPLETED (critical fix)
2. **Bug Reporting System** - PENDING (trigger button, debug auto-investigation)
3. **Framework Documentation** - IN PROGRESS (this work)
4. **Platform Launch Readiness** - UPCOMING

**Feature Philosophy:**
- Quality over quantity
- Complete features properly before moving to next
- Test thoroughly before delivery
- Document as you go

### What to Avoid

**Don't:**
- Add features not in the plan without discussion
- Half-finish features and move on
- Skip testing to save time
- Assume requirements without checking

**Do:**
- Confirm understanding before starting
- Update todo.md as you work
- Test thoroughly
- Create checkpoints at milestones

---

## Platform-Specific Preferences

### Social Media Integration

**Platforms to Support:**
- Facebook (yes)
- Instagram (yes)
- LinkedIn (yes)
- X/Twitter (removed per Christopher's preference)

**IMPORTANT:**
- X/Twitter was explicitly removed from the platform
- DO NOT add X/Twitter features without explicit request
- Focus on Facebook, Instagram, LinkedIn

### Press Release Distribution

**Approach:**
- Focus on email distribution to journalist lists
- Free press release services integration (low priority)
- Quality over quantity of distribution channels

**Media Lists:**
- Default lists by industry/region
- Custom lists (user-created)
- CSV import functionality
- "Share & Earn" program (£0.10 per verified contact)

### AI Content Generation

**Quality Standards:**
- Professional, publication-ready content
- Minimal editing required
- Respects brand voice and tone
- Appropriate for target audience

**Customization:**
- Brand voice configuration (5 tones × 4 styles)
- Industry-specific templates
- SIC code classification for context

---

## White-Label Partnership Preferences

### Business Model

**Target Partners:**
- Business networks
- Chambers of commerce
- Industry associations
- Marketing agencies

**Commission Structure:**
- 20% commission to partners
- Partners provide service under their brand
- upsurgeIQ provides platform and support

**Partner Portal Features:**
- Co-branded customization
- Member analytics dashboard
- Marketing materials library
- Commission tracking and reporting

---

## Development Workflow Preferences

### How Christopher Likes to Work

**Ideal Process:**
1. AI reads framework docs first
2. AI addresses Christopher by name and confirms understanding
3. AI proposes approach with options
4. Christopher provides feedback/approval
5. AI implements with progress updates
6. AI tests thoroughly
7. AI documents and creates checkpoint

**Progress Updates:**
- Proactive updates appreciated
- Flag blockers early
- Don't hide problems
- Provide options, not just problems

### Decision-Making

**What Christopher Decides:**
- Strategic direction
- Feature priorities
- Pricing and business model
- Major architectural changes
- User-facing design

**What AI Can Decide:**
- Implementation details
- Code organization
- Testing approaches
- Documentation structure
- Minor UI/UX improvements

---

## Things Christopher REALLY Dislikes

### Major Pet Peeves

**Context Loss:**
- AI agents asking for information already provided
- Having to repeat himself
- Agents not reading framework docs
- Starting over instead of building on previous work

**Inaccuracy:**
- Wrong pricing information (£29/99/249 vs £49/99/349)
- Wrong feature specifications
- Wrong subscription limits
- Assumptions not based on actual specs

**Wasted Resources:**
- AI credits spent on redundant work
- Time spent re-explaining context
- Effort on features that don't align with vision
- Fixing problems that shouldn't have happened

**Lack of Follow-Through:**
- Starting work without full context
- Not checking documentation first
- Jumping to implementation without confirmation
- Incomplete features

### How to Avoid These

**Before Starting Work:**
- Read ALL framework documentation
- Address Christopher by name
- Confirm your understanding
- Get explicit approval for major changes

**During Work:**
- Update todo.md as you go
- Test before delivery
- Document decisions
- Flag issues early

**After Work:**
- Create checkpoint with clear description
- Update framework docs
- Mark completed items in todo.md
- Provide clear next steps

---

## Quality Standards

### What "Good" Looks Like

**Code Quality:**
- All tests passing
- No TypeScript errors
- Proper error handling
- Clean, readable code

**User Experience:**
- Intuitive, self-explanatory UI
- Fast, responsive performance
- Mobile-friendly design
- Accessible to all users

**Documentation:**
- Framework docs up to date
- todo.md accurately reflects status
- Decisions logged with rationale
- Clear checkpoint descriptions

### What "Not Good" Looks Like

**Red Flags:**
- TypeScript errors ignored
- Tests failing or not written
- Features half-finished
- Documentation outdated
- Wrong specifications used

**Immediate Escalation:**
- Pricing errors
- Feature specification errors
- Scope creep without discussion
- Major architectural changes without approval

---

## Current Project Phase Preferences

### Launch Readiness Focus

**Priorities (as of Dec 22, 2025):**
1. Complete framework documentation
2. Fix remaining critical bugs
3. Ensure all core features work end-to-end
4. Prepare for first client onboarding

**NOT Priorities Right Now:**
- Adding new features
- Major refactoring
- Experimental features
- Nice-to-have improvements

### Credit Management

**Important Context:**
- Christopher is tracking AI credit usage carefully
- Project has used ~90,000 credits
- Budget management is important
- Avoid wasted credits on redundant work

**How to Help:**
- Read framework docs to avoid redundant questions
- Test before delivery to avoid rework
- Confirm understanding before starting
- Don't repeat work already done

---

## Success Criteria

### What Christopher Measures

**Development Success:**
- Features completed per plan
- Tests passing
- No critical bugs
- Framework docs up to date

**Platform Success:**
- User adoption and retention
- Content quality (AI-generated)
- Platform reliability
- Customer satisfaction

**Business Success:**
- Monthly recurring revenue
- Customer acquisition cost
- Churn rate
- White-label partnerships

---

## Special Requests

### Specific Things Christopher Has Asked For

**Framework Documentation:**
- Complete, accurate, up-to-date
- Populated with real information (not templates)
- Accessible to future AI iterations
- Prevents context loss

**Conversation Memory:**
- AI Assistant loads last 20 conversation turns
- Clients have continuity across sessions
- No repeating information

**Bug Reporting System:**
- Manual "Trigger Investigation" button
- Debug why automatic investigation isn't running
- Status badge on Issues list

**Bootstrap Problem:**
- Document for Manus support
- AI agents should automatically read framework docs
- README.md serves as temporary bootstrap

---

## Evolution and Updates

### How to Update This Document

**After Each Session:**
- Add new preferences discovered
- Update priorities if they change
- Document new "things to avoid"
- Add to success criteria if relevant

**When to Update:**
- Christopher expresses a strong preference
- A pattern emerges in feedback
- Priorities shift
- New requirements are added

---

## Quick Reference

### TL;DR - Most Important Preferences

**Communication:**
- ALWAYS address Christopher by name
- Direct, practical, no fluff
- Provide options with pros/cons

**Technical:**
- Use the decided tech stack (React 19, Tailwind 4, tRPC 11)
- Test before delivery
- Update documentation as you work

**Business:**
- Pricing is LOCKED (£49/99/349)
- Feature allocation by tier is LOCKED
- Don't change without explicit approval

**Avoid:**
- Context loss (read framework docs!)
- Inaccuracy (check specs!)
- Wasted resources (confirm before starting!)

---

**This document captures Christopher's specific preferences for the upsurgeIQ project. Follow these guidelines to work effectively and avoid frustration.**

**Last Updated:** December 22, 2025  
**Next Review:** After each major milestone or when preferences change

---

**End of Client Preferences**
