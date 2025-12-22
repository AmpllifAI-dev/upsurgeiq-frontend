# Working Methodology

**How We Work on This Project**

---

## Core Principles

1. **Quality Over Speed** - Doing it right the first time saves time overall
2. **Document As You Go** - Don't wait until the end to document decisions
3. **Ask When Uncertain** - Better to ask than to guess wrong
4. **Think About the Next Session** - Leave things in a state where the next person can pick up easily
5. **Client First** - Every decision should consider client value and experience

---

## Communication Protocol

### Always Address Christopher by Name

**MANDATORY:** Every message to Christopher must begin with his name.

**Format:**
```
Christopher, [your message here]
```

**Why This Matters:**
- **Signals you read the framework docs** - If you know his name, you read the documentation
- **Personal and professional** - Creates direct, clear communication
- **Enables enforcement** - Christopher uses this as a checkpoint

**Christopher's Enforcement Protocol:**

If an AI agent does NOT address Christopher by name in the first message:
1. Christopher will challenge the AI immediately
2. AI must stop all work
3. AI must read all framework documentation
4. AI must return with proper context and address Christopher by name

**This is a quality gate.** It ensures AI agents have proper context before working.

**Examples of Correct Communication:**
- "Christopher, I've reviewed the bug report and identified the issue."
- "Christopher, should I proceed with implementing the conversation memory fix?"
- "Christopher, I need clarification on the subscription tier limits."

**Incorrect (will be challenged):**
- "I've reviewed the bug report..." ❌
- "The issue has been identified..." ❌
- "Should I proceed with..." ❌

---

## Development Workflow

### Planning

**How Features Are Planned:**

1. Christopher identifies need or requests feature
2. AI agent confirms understanding and proposes approach
3. Present 2-3 options with pros/cons/trade-offs
4. Christopher approves approach
5. Add to todo.md as unchecked items [ ]
6. Begin implementation

**Definition of Ready:**

Before work begins on a task, it must have:
- [x] Christopher's explicit approval or request
- [x] Clear understanding of requirements (confirmed with Christopher)
- [x] Technical approach agreed upon
- [x] Added to todo.md
- [x] Framework docs read and understood
- [x] Dependencies identified

**What NOT to Do:**
- Don't start work without reading framework docs
- Don't assume requirements - confirm with Christopher
- Don't add features not in the plan without discussion
- Don't skip adding to todo.md

### Development

**Coding Standards:**
- Use TypeScript strict mode (no `any` types)
- Follow tRPC patterns (procedures in routers.ts, queries in db.ts)
- Use Tailwind utilities (avoid custom CSS)
- Write clean, readable code over clever code
- Proper error handling with try/catch and error logging
- Update todo.md as you work (mark [x] when complete)

**Testing Requirements:**
- Write vitest tests for all tRPC procedures (see server/auth.logout.test.ts)
- Test critical paths before delivery (auth, payments, AI generation)
- Manual testing in browser before creating checkpoint
- No delivery without testing
- Fix failing tests before checkpoint

**Code Review Process:**

No formal code review (solo founder + AI development). Instead:
1. AI tests thoroughly before delivery
2. Christopher reviews in browser (Preview panel)
3. Christopher provides feedback
4. AI addresses feedback and re-tests
5. Checkpoint created when Christopher approves

### Deployment

**Deployment Frequency:**
Checkpoint-based deployment. Create checkpoint after completing features, then Christopher publishes via Manus UI.

**Deployment Process:**
1. AI completes feature and tests thoroughly
2. AI creates checkpoint with clear description
3. Christopher reviews in Preview panel
4. Christopher clicks Publish button in Manus UI
5. Platform deploys automatically

**Rollback Procedure:**
Use `webdev_rollback_checkpoint` tool to restore previous version:
1. Identify version_id of stable checkpoint
2. Call webdev_rollback_checkpoint with version_id
3. Test rolled-back version
4. Investigate and fix issue
5. Create new checkpoint when fixed

---

## Quality Standards

### Code Quality

**Before Creating Checkpoint:**
- [x] Code follows TypeScript strict mode
- [x] No console errors in browser
- [x] Tests written and passing (vitest)
- [x] Manual testing in browser completed
- [x] todo.md updated (completed items marked [x])
- [x] Framework docs updated if needed
- [x] No hardcoded values (use env vars)

**Quality Checklist:**
- [x] Logic is correct and tested
- [x] Edge cases handled (empty states, errors)
- [x] Error handling with try/catch and logging
- [x] Performance acceptable (no slow queries)
- [x] Security considered (no SQL injection, XSS)
- [x] Mobile responsive
- [x] Accessible (ARIA labels, keyboard navigation)

### Documentation Quality

**Before Delivering Documentation:**
- [ ] Content is complete and accurate
- [ ] Formatting is consistent
- [ ] Links work
- [ ] Spelling and grammar are correct
- [ ] Appropriate level of detail for audience

### Design Quality

**Before Delivering Designs:**
- [ ] Meets stated requirements
- [ ] Follows design system
- [ ] Accessibility considered
- [ ] Responsive across breakpoints
- [ ] Client preferences incorporated

---

## Communication Protocols

### Update Frequency

**Proactive Updates:**
Provide progress updates during long-running tasks (>10 minutes). Christopher appreciates knowing what's happening.

**After Milestones:**
Summarize what was completed and next steps after completing significant features.

**When Blocked:**
Flag blockers immediately - don't wait. Provide options for unblocking.

### Communication Channels

**For Everything:** Manus chat (primary and only channel)

**For Urgent Issues:**
Same channel, but flag as urgent and explain impact clearly.

**For Decisions:**
Present 2-3 options with pros/cons, recommend one, ask for decision.

### Tone and Style

**When Communicating with Christopher:**
- **ALWAYS address by name:** "Christopher, [message]"
- **Tone:** Direct, practical, professional but conversational
- **Level of Detail:** Provide context and reasoning, not just answers
- **Frequency:** Proactive updates appreciated, but don't spam
- **No:** Corporate jargon, buzzwords, excessive formality

**When Documenting:**
- **Style:** Professional, clear, concise
- **Audience:** Future AI agents and Christopher
- **Format:** Markdown (GitHub-flavored)
- **Structure:** Headings, paragraphs, tables (not excessive bullets)

---

## Decision-Making Process

### When to Ask vs. When to Decide

**Always Ask About:**
- Changes to scope or requirements
- Significant architectural decisions
- Anything that affects budget or timeline
- Breaking changes to existing functionality
- Design choices that affect user experience

**You Can Decide:**
- Implementation details
- Code organization
- Technical optimizations
- Bug fixes that don't change behavior
- Documentation improvements

### How to Propose Options

When you need input on a decision:

1. **State the problem clearly**
2. **Present 2-3 options** (not just one)
3. **Recommend one** with rationale
4. **Explain tradeoffs** of each option
5. **Ask for decision**

Example:
```
We need to decide how to handle user authentication.

Options:
A) Use OAuth with Google/Facebook
   Pros: Easy for users, well-tested
   Cons: Dependency on third parties
   
B) Build custom auth
   Pros: Full control, no dependencies
   Cons: More complex, security risk
   
C) Use Auth0
   Pros: Professional, secure, flexible
   Cons: Additional cost

I recommend Option C because [rationale].

Which approach would you prefer?
```

### Documenting Decisions

**Every significant decision must be documented in DECISIONS_LOG.md with:**
- Date
- Context (what prompted the decision)
- Decision (what was decided)
- Rationale (why)
- Alternatives considered
- Consequences (expected impact)

---

## Task Management

### Task Lifecycle

**States:**
1. **Backlog** - Not yet started
2. **In Progress** - Currently being worked on
3. **Blocked** - Waiting on something
4. **Review** - Awaiting review/approval
5. **Done** - Complete and deployed

### Using todo.md

**Format:**
Flat list with markdown checkboxes, grouped by feature area:

```markdown
## Feature Area Name
- [ ] Pending task
- [x] Completed task
- [ ] Another pending task
```

**Rules:**
1. **Add items BEFORE starting work** (use file append action)
2. **Mark [x] when complete** (use file edit action)
3. **Never delete items** - keep as history
4. **Review before checkpoint** - ensure accuracy

**Update Frequency:**
- Add new items when Christopher requests features
- Mark [x] immediately when completing items
- Review entire file before creating checkpoint

---

## Version Control

### Checkpoints (Not Git Branches)

**upsurgeIQ uses Manus checkpoints, not traditional Git workflow.**

**Checkpoint Strategy:**
- Create checkpoint after completing features
- Create checkpoint before risky changes
- Create checkpoint before major refactoring
- Descriptive checkpoint messages (what, why, impact)

**Checkpoint Message Format:**
```
[Brief summary of changes]

DETAILS:
- [What was changed]
- [What was added]
- [What was fixed]

IMPACT:
- [What this affects]
- [What users can now do]

NEXT STEPS:
- [What to do next]
```

**DO NOT:**
- Use `git reset --hard` (use webdev_rollback_checkpoint instead)
- Create checkpoints for every tiny change
- Skip checkpoint descriptions

---

## Testing Strategy

### Test Types

**Unit Tests (Vitest):**
- When: For all tRPC procedures
- Coverage: Critical paths (auth, payments, AI generation)
- Tools: Vitest (see server/auth.logout.test.ts)
- Run: `pnpm test`

**Manual Testing:**
- When: Before every checkpoint
- Where: Browser Preview panel
- What: Test the actual user flow end-to-end
- Required: Yes, no checkpoint without manual testing

**No Integration/E2E Tests:**
Currently not using Playwright/Cypress. Manual testing in browser is sufficient for now.

### Testing Workflow

1. Write vitest tests for tRPC procedures
2. Run `pnpm test` to verify tests pass
3. Manual testing in browser (Preview panel)
4. Fix any issues found
5. Re-test until working correctly
6. Create checkpoint

---

## Error Handling

### How to Handle Errors

**In Code:**
- Always use try/catch for async operations
- Log errors with context
- Return user-friendly error messages
- Never expose internal errors to users

**In Production:**
- Monitor error rates
- Alert on critical errors
- Log for debugging
- Graceful degradation when possible

### Escalation

**When to Escalate:**
- Production is down
- Data loss or corruption
- Security breach
- Can't resolve within [timeframe]

**How to Escalate:**
[Process for escalating issues]

---

## Session Workflow

### Starting a Session

1. **Load Context:**
   - Read AI_AGENT_START_HERE.md
   - Review all linked documentation
   - Check todo.md for current priorities

2. **Confirm Understanding:**
   - Summarize current state
   - Confirm next steps
   - Ask clarifying questions

3. **Begin Work:**
   - Only after context is loaded and confirmed

### During a Session

1. **Document as you go:**
   - Add decisions to DECISIONS_LOG.md
   - Update todo.md with progress
   - Capture solutions in COMMON_ISSUES.md

2. **Communicate proactively:**
   - Provide progress updates
   - Flag blockers immediately
   - Ask when uncertain

3. **Maintain quality:**
   - Follow coding standards
   - Write tests
   - Review your own work

### Ending a Session

1. **Update Documentation:**
   - Ensure all decisions are logged
   - Update todo.md
   - Add session notes

2. **Prepare Handoff:**
   - Update AI_AGENT_START_HERE.md
   - Summarize what was done
   - Note what's next

3. **Verify Completeness:**
   - Could the next session pick up easily?
   - Is anything missing?

---

## Continuous Improvement

### Retrospectives

**Frequency:** [e.g., Weekly, After each milestone]

**Questions to Ask:**
- What went well?
- What could be better?
- What should we change?

### Updating This Document

This methodology should evolve based on what works:

**When to Update:**
- When a process isn't working
- When you discover a better way
- When requirements change
- When team composition changes

**How to Update:**
- Propose changes
- Discuss with team
- Update document
- Communicate changes

---

## Common Scenarios

### Scenario: Unclear Requirements

**What to Do:**
1. List what you know
2. List what's unclear
3. Propose assumptions
4. Ask for clarification

### Scenario: Conflicting Priorities

**What to Do:**
1. Identify the conflict
2. Present the tradeoffs
3. Ask for prioritization
4. Document the decision

### Scenario: Technical Blocker

**What to Do:**
1. Describe the blocker
2. Explain the impact
3. Propose solutions or workarounds
4. Ask for guidance

### Scenario: Scope Creep

**What to Do:**
1. Identify the scope change
2. Estimate the impact
3. Propose options (add to scope, defer, reject)
4. Get explicit approval before proceeding

---
### Tools and Resources

### Development Tools

- **Platform:** Manus (all-in-one development environment)
- **Package Manager:** pnpm
- **Testing:** Vitest
- **Database:** MySQL/TiDB via Drizzle ORM
- **Database Management:** Manus Database UI panel

### Project Management

- **Task Tracking:** todo.md (flat markdown file)
- **Documentation:** /docs/framework/ (markdown files)
- **Communication:** Manus chat
- **Code Review:** Preview panel (Christopher reviews)

### Monitoring and Debugging

- **Error Tracking:** Custom error_logs table + admin dashboard
- **Logging:** Custom logging utility (server/logger.ts)
- **Analytics:** Manus built-in analytics (UV/PV)
- **Preview:** Manus Preview panel (live dev server)

---

**This document should be updated whenever the way we work changes.**

**Last Updated:** December 22, 2025  
**Updated By:** AI Agent (from 8-day chat history analysis)
