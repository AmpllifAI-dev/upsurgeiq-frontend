# Manus Support Issue: AI Agent Bootstrap Problem

**Date Reported:** December 22, 2025  
**Reported By:** Christopher Lembke (via AI Agent)  
**Project:** upsurgeIQ (upsurgeiq-frontend)  
**Severity:** High (affects all webdev projects using framework documentation)

---

## Issue Summary

AI agents working on webdev projects don't automatically know to read project framework documentation when starting a new session, leading to context loss and repeated questions.

---

## The Problem

### What Happens Now

1. User starts new AI conversation for webdev project
2. AI agent initializes with generic webdev context
3. AI agent has NO knowledge of:
   - Project-specific documentation
   - Previous decisions
   - Current priorities
   - Client preferences
   - Past work done
4. AI agent asks user to explain everything from scratch
5. User experiences frustration from repeating information

### Real-World Impact

**Christopher's Experience:**
> "I'm asking your customer service for help, but they are just kind of giving me an answer and then they disappear and it seems like they're suffering the same problems you are because they come back and they ask for the same information over and over again. I tell them to look in the history and they say they can't."

**This is the EXACT problem clients will experience** if the conversation memory system doesn't work properly in production.

---

## Current Workaround

### What We've Implemented

1. **Created Framework Documentation System:**
   - `/docs/framework/AI_AGENT_START_HERE.md` - Entry point
   - `/docs/framework/PROJECT_CONTEXT.md` - Comprehensive project docs
   - `/docs/framework/ADMINISTRATOR_DOSSIER.md` - Client profile
   - `/docs/framework/WORKING_METHODOLOGY.md` - How we work
   - `/docs/framework/CLIENT_PREFERENCES.md` - Specific requirements
   - `/docs/framework/DECISIONS_LOG.md` - Past decisions

2. **Added Bootstrap to README.md:**
   - Added prominent "ATTENTION AI AGENTS" section at top
   - Lists mandatory reading order
   - Explains why this matters

3. **Technical Debt Tracking:**
   - Added quick fixes log to framework docs
   - Session summaries for continuity
   - Next session priorities

### Why This Workaround is Insufficient

**Problem:** AI agents don't automatically check README.md files either.

**Reality:** Unless the AI agent is explicitly told "Read the README.md" or "Read the framework docs," it won't know they exist.

---

## Proposed Solution

### Option 1: Automatic Framework Injection (Preferred)

**Implementation:**

When a webdev project is initialized or resumed, automatically inject this instruction into the AI agent's initial context:

```
CRITICAL: Before taking any action on this webdev project, you MUST read the following files in order:

1. /docs/framework/AI_AGENT_START_HERE.md
2. Follow the mandatory reading list in that document

After reading, confirm your understanding with the user before proceeding.
```

**Where to inject:**
- In the initial system prompt for webdev tasks
- As part of the project handoff context
- When resuming an existing webdev project

**Benefits:**
- Solves the problem completely
- Works for all webdev projects
- No user action required
- Consistent experience

### Option 2: Convention-Based Discovery

**Implementation:**

Train AI agents to automatically check for these files when starting webdev work:
- `/README.md` (check for AI agent instructions)
- `/docs/framework/AI_AGENT_START_HERE.md` (if exists)
- `/docs/AI_CONTEXT.md` (alternative naming)

**Benefits:**
- Works across different project structures
- Follows common conventions
- Flexible naming

**Drawbacks:**
- Relies on AI agent training
- May not be 100% reliable
- Requires consistent behavior across all AI models

### Option 3: User-Initiated Handoff

**Implementation:**

When user starts new conversation, show prompt:
```
This project has framework documentation. Would you like the AI to read it first?
[Yes - Read Framework Docs] [No - Start Fresh]
```

**Benefits:**
- User control
- Explicit choice
- Simple to implement

**Drawbacks:**
- Extra step for user
- User might forget or skip
- Doesn't solve automatic continuity

---

## Recommended Solution

**Combination Approach:**

1. **Automatic injection** (Option 1) as primary mechanism
2. **Convention-based discovery** (Option 2) as fallback
3. **Visual indicator** in UI showing "Framework docs available" with one-click "Load Context" button

---

## Technical Implementation Details

### Where to Inject

**In the webdev system prompt template:**

```typescript
// When initializing webdev AI agent
const systemPrompt = `
You are an AI agent working on a webdev project.

CRITICAL FIRST STEP: Check if framework documentation exists.
If /docs/framework/AI_AGENT_START_HERE.md exists, you MUST read it before taking any other action.

The framework documentation contains:
- Project context and goals
- Client preferences and communication style
- Past decisions and rationale
- Current priorities and status
- Technical architecture and patterns

Reading this documentation prevents context loss and ensures continuity.

After reading framework docs (if they exist), confirm your understanding with the user before proceeding.

[... rest of webdev system prompt ...]
`;
```

### File Detection

```typescript
// Pseudo-code for framework detection
async function checkForFrameworkDocs(projectPath: string): Promise<boolean> {
  const frameworkPath = path.join(projectPath, 'docs/framework/AI_AGENT_START_HERE.md');
  return await fileExists(frameworkPath);
}

// In AI agent initialization
if (await checkForFrameworkDocs(projectPath)) {
  // Inject framework reading instruction
  systemPrompt += "\n\nFRAMEWORK DOCUMENTATION DETECTED. Read /docs/framework/AI_AGENT_START_HERE.md first.";
}
```

---

## Benefits of Fixing This

### For Users (Project Owners)

- **No more repeating information** - AI remembers context
- **Faster onboarding** - New AI sessions start with full context
- **Better continuity** - Decisions and preferences are preserved
- **Less frustration** - AI doesn't ask same questions repeatedly

### For AI Agents

- **Better performance** - Full context leads to better decisions
- **Fewer mistakes** - Understanding past decisions prevents contradictions
- **Clearer priorities** - Know what to work on immediately
- **Efficient work** - No time wasted on wrong tasks

### For Manus Platform

- **Better user experience** - Reduces support tickets
- **Competitive advantage** - Other platforms don't solve this
- **Scalability** - Works for all webdev projects
- **Professional image** - Shows attention to continuity

---

## Related Issues

### Conversation Memory in Production Apps

**Same Problem, Different Context:**

The bootstrap issue we're experiencing in development is the SAME problem that would affect production apps if conversation memory doesn't work properly.

**What we fixed today (Dec 22, 2025):**
- Implemented conversation memory for client-facing AI assistant
- AI now loads last 20 conversation turns automatically
- Conversations persist across sessions
- Clients won't experience context loss

**The lesson:** Context continuity is CRITICAL for AI systems. Both development AI (agents) and production AI (client-facing) need memory systems.

---

## Testing the Fix

### How to Verify

1. Create new webdev project with framework documentation
2. Start new AI conversation (simulate fresh session)
3. Verify AI automatically reads framework docs
4. Confirm AI has full context before starting work
5. Test with multiple AI sessions to ensure consistency

### Success Criteria

- ✅ AI agent reads framework docs automatically
- ✅ AI agent confirms understanding before working
- ✅ AI agent doesn't ask for information in framework docs
- ✅ User doesn't need to explain project from scratch
- ✅ Works consistently across all AI sessions

---

## Priority

**High Priority** because:

1. Affects all webdev projects using framework documentation
2. Causes significant user frustration
3. Wastes time for both users and AI agents
4. Undermines value of framework documentation system
5. Creates poor user experience

---

## Contact

**Project Owner:** Christopher Lembke  
**Project:** upsurgeIQ (upsurgeiq-frontend)  
**Date:** December 22, 2025

**For Questions:** Contact via Manus platform support at https://help.manus.im

---

## Appendix: Framework Documentation Structure

### What We Built

A comprehensive framework documentation system that includes:

**AI_AGENT_START_HERE.md:**
- Overview and mandatory reading list
- Current status and priorities
- Session summaries
- Technical debt tracking

**PROJECT_CONTEXT.md:**
- Comprehensive project documentation (10,000+ words)
- Technical architecture
- Features and functionality
- Business model and goals
- Current status and roadmap

**ADMINISTRATOR_DOSSIER.md:**
- Client profile and preferences
- Communication style
- Decision-making patterns
- Working hours and timezone

**WORKING_METHODOLOGY.md:**
- Development workflow
- Quality standards
- Testing requirements
- Deployment process

**CLIENT_PREFERENCES.md:**
- Specific requirements
- Preferences and pet peeves
- Things to avoid

**DECISIONS_LOG.md:**
- Past decisions and rationale
- Why things are the way they are
- Lessons learned

### Why This System Works

**When AI agents read these docs:**
- They have full project context
- They understand client preferences
- They know current priorities
- They avoid repeating past mistakes
- They make consistent decisions

**The ONLY problem:** AI agents don't automatically know to read them.

**The fix:** Make reading framework docs automatic, not optional.

---

**End of Support Issue Documentation**
