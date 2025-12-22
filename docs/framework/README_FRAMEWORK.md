# UpsurgeIQ Framework Documentation

**Location:** `/home/ubuntu/upsurgeiq-frontend/docs/framework/`  
**Purpose:** Persistent documentation for AI agent onboarding and project continuity  
**Last Updated:** December 22, 2025

---

## 🔒 Critical: This Directory is Checkpoint-Protected

**ALL files in this directory are included in webdev checkpoints** and will survive sandbox resets.

**DO NOT** store framework documents outside this directory - they will be lost on sandbox reset.

---

## 📁 Directory Structure

### Core AI Agent Documents
- **AI_AGENT_START_HERE.md** - First file to read, contains greeting protocol and mandatory reading list
- **ADMINISTRATOR_DOSSIER.md** - Christopher Lembke's profile, preferences, timezone (GMT)
- **AI_AGENT_OPERATING_MANUAL.md** - How to operate effectively
- **AI_AGENT_INSTRUCTIONS_CREDIT_TRACKING.md** - Project-specific instructions

### Project Context
- **PROJECT_CONTEXT.md** - What UpsurgeIQ is and why it exists
- **WORKING_METHODOLOGY.md** - How we work on this project
- **DECISIONS.md** - Past decisions and their rationale
- **BUG_FIX_SESSION_DEC21.md** - Bug fix history

### Cost & Performance Tracking
- **AI_CREDIT_TRACKING_METHODOLOGY.md** - How to track AI credits during development
- **TIME_BASED_COST_ANALYSIS.md** - Time vs tokens vs credits methodology
- **UpsurgeIQ Infrastructure Cost Analysis (REVISED).md** - Client credit operational costs
- **Programming Error Analysis Report.md** - Analysis of the "meltdown" incident

### Implementation Guides
- **IMPLEMENTATION_GUIDE.md** - Technical implementation details
- **FRONTEND_UI_VISION.md** - UI/UX vision and guidelines
- **DISTRIBUTION_FLOW.md** - Press release distribution workflow
- **STRIPE_SETUP.md** - Stripe integration setup

### Reference Documents
- **upsurgeIQ_Services_and_Features.md** - Complete service catalog
- **UPSURGEIQ_CASE_STUDY.md** - Project case study
- **UpsurgeIQ Master Blueprint - Updated.md** - Master blueprint
- **GLOBAL_RULES.md** - Global project rules
- **QUICK_START_CHECKLIST.md** - Quick start checklist

### Conversation Backups
- **CONVERSATION_DEC22_AFTERNOON.md** - December 22 afternoon session
- **CONVERSATION_HISTORY_DEC14-22.md** - Full 8-day conversation history (partial)

### Context Loss Documentation
- **CONTEXT_LOSS_RECOVERY_PLAN.md** - Recovery plan for context loss incidents
- **Manus Support Report: Critical File Access Issue.md** - Support ticket documentation
- **Token Usage Report - Misaligned Implementation Due to Missing Context.md** - Token waste analysis

### Legacy/Deprecated
- **CLIENT_DOSSIER.md** - OLD NAME (now ADMINISTRATOR_DOSSIER.md) - kept for reference

---

## 🚨 For New AI Iterations

**When you start a new conversation:**

1. **FIRST:** Greet Christopher with "Hello Christopher,"
2. **THEN:** Read `AI_AGENT_START_HERE.md`
3. **FOLLOW:** The mandatory reading list in that document
4. **CHECK:** `todo.md` in project root for current priorities

---

## 🔄 Backup Protocol

**Automatic:** All files in this directory are backed up in webdev checkpoints

**Manual:** Update `CONVERSATION_DEC22_AFTERNOON.md` (or create new dated file) every 30 minutes during active sessions

**Recovery:** If sandbox resets, all files here will be restored from the last checkpoint

---

## 📝 Document Maintenance

**When to Update:**
- After major decisions → Update DECISIONS.md
- After completing features → Update todo.md and mark items complete
- After context loss incidents → Update CONTEXT_LOSS_RECOVERY_PLAN.md
- After cost analysis → Update cost tracking documents
- Every 30 minutes during active work → Update conversation backup

**Who Updates:**
- AI Agent (you) - responsible for keeping documents current
- Christopher - may provide corrections or additional context

---

## ⚠️ Known Issues

**Context Loss:** AI iterations may lose conversation history. The greeting protocol helps detect this.

**Sandbox Resets:** Files outside `/home/ubuntu/upsurgeiq-frontend/` are lost. Keep everything here.

**Checkpoint Timing:** Only create checkpoints at major milestones, not during active development.

---

**Remember:** These documents are your lifeline. Keep them updated, keep them safe, keep them inside the project directory.
