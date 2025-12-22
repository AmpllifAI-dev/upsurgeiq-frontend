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
[Describe your planning process]

Example:
1. Client requests feature or identifies need
2. Create detailed requirements document
3. Break down into tasks
4. Estimate effort
5. Add to backlog with priority

**Definition of Ready:**
Before work begins on a task, it must have:
- [ ] Clear requirements
- [ ] Acceptance criteria
- [ ] Design mockups (if UI work)
- [ ] Technical approach agreed upon
- [ ] Dependencies identified

### Development

**Coding Standards:**
- [Standard #1: e.g., "Follow ESLint configuration"]
- [Standard #2: e.g., "Use TypeScript strict mode"]
- [Standard #3: e.g., "Write self-documenting code with clear variable names"]

**Testing Requirements:**
- [Requirement #1: e.g., "All new features must have unit tests"]
- [Requirement #2: e.g., "Critical paths must have integration tests"]
- [Requirement #3: e.g., "Manual testing checklist for UI changes"]

**Code Review Process:**
[Describe how code is reviewed]

Example:
1. Create pull request with description
2. Request review from [person/role]
3. Address feedback
4. Merge after approval

### Deployment

**Deployment Frequency:**
[How often code is deployed]

**Deployment Process:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Rollback Procedure:**
[How to roll back if something goes wrong]

---

## Quality Standards

### Code Quality

**Before Committing Code:**
- [ ] Code follows project conventions
- [ ] No console errors or warnings
- [ ] Tests are written and passing
- [ ] Code is self-documenting or has comments
- [ ] No hardcoded values (use config/env vars)

**Code Review Checklist:**
- [ ] Logic is correct
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Performance is acceptable
- [ ] Security considerations addressed

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

**Daily Updates:** [When and how]

**Weekly Updates:** [When and how]

**Ad-Hoc Updates:** [When to provide unexpected updates]

### Communication Channels

**For Questions:** [Channel/method]

**For Updates:** [Channel/method]

**For Urgent Issues:** [Channel/method]

**For Decisions:** [Channel/method]

### Tone and Style

**When Communicating with Client:**
- Tone: [Formal/Casual/Technical/etc.]
- Level of Detail: [High-level/Detailed/etc.]
- Frequency: [How often they want to hear from you]

**When Documenting:**
- Style: [Professional, clear, concise]
- Audience: [Who will read this]
- Format: [Markdown, PDF, etc.]

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
```markdown
## In Progress
- [ ] [Task] - [Assigned to] - [Started date]

## Up Next
- [ ] [Task] - [Priority: High/Medium/Low]

## Blocked
- [ ] [Task] - [Blocker description]

## Done
- [x] [Task] - [Completed date]
```

**Update Frequency:**
- Update immediately when starting a task
- Update immediately when completing a task
- Update daily with progress notes

---

## Version Control

### Branch Naming

**Format:** `[type]/[description]`

**Types:**
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation changes
- `test/` - Test additions/changes

**Examples:**
- `feature/user-authentication`
- `fix/login-button-alignment`
- `refactor/database-queries`

### Commit Messages

**Format:** `[type]: [description]`

**Examples:**
- `feat: add user authentication`
- `fix: resolve login button alignment issue`
- `docs: update API documentation`
- `refactor: optimize database queries`

**Guidelines:**
- Use present tense ("add" not "added")
- Be specific and descriptive
- Reference issue numbers when applicable

### Pull Requests

**Title:** Clear, descriptive summary

**Description Must Include:**
- What changed
- Why it changed
- How to test it
- Screenshots (for UI changes)
- Breaking changes (if any)

---

## Testing Strategy

### Test Types

**Unit Tests:**
- When: For all business logic
- Coverage Target: [e.g., 80%]
- Tools: [e.g., Jest, Vitest]

**Integration Tests:**
- When: For critical user flows
- Coverage: [e.g., All API endpoints]
- Tools: [e.g., Supertest]

**End-to-End Tests:**
- When: For critical paths
- Coverage: [e.g., Login, checkout, core features]
- Tools: [e.g., Playwright, Cypress]

**Manual Testing:**
- When: Before every deployment
- Checklist: [Link to testing checklist]

### Testing Workflow

1. Write tests before or alongside code
2. Run tests locally before committing
3. CI runs tests on every PR
4. Manual testing before deployment

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

## Tools and Resources

### Development Tools

- **IDE:** [Recommended IDE]
- **Version Control:** [Git, GitHub, etc.]
- **Package Manager:** [npm, yarn, pnpm]
- **Testing:** [Jest, Vitest, etc.]

### Project Management

- **Task Tracking:** [Jira, Linear, etc.]
- **Documentation:** [Notion, Confluence, etc.]
- **Communication:** [Slack, Discord, etc.]

### Monitoring and Debugging

- **Error Tracking:** [Sentry, etc.]
- **Logging:** [LogRocket, etc.]
- **Analytics:** [Google Analytics, etc.]

---

**This document should be updated whenever the way we work changes.**

**Last Updated:** [DATE]  
**Updated By:** [NAME]
