# Campaign Lab - Comprehensive Test Plan

**Version:** 1.0  
**Date:** December 26, 2025  
**Status:** Ready for Testing  
**Priority:** High

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Test Scope](#test-scope)
4. [Test Environment Setup](#test-environment-setup)
5. [Functional Test Cases](#functional-test-cases)
6. [Integration Test Cases](#integration-test-cases)
7. [Performance Test Cases](#performance-test-cases)
8. [Security Test Cases](#security-test-cases)
9. [User Acceptance Test Scenarios](#user-acceptance-test-scenarios)
10. [Known Issues & Edge Cases](#known-issues--edge-cases)
11. [Test Execution Schedule](#test-execution-schedule)
12. [Appendix](#appendix)

---

## 1. Executive Summary

### 1.1 Purpose
This document outlines the comprehensive testing strategy for the **Campaign Lab** feature - an intelligent campaign management system with AI-powered ad variant generation, autonomous optimization, and approval workflows.

### 1.2 Key Features Under Test
- **Campaign Creation & Management**: CRUD operations for campaigns
- **AI Variant Generation**: Psychological angle-based ad copy generation
- **Approval Workflow**: Multi-stage approval process for variants
- **Autonomous Optimization**: Auto-pause/deploy based on performance
- **Performance Analytics**: Real-time metrics and scoring
- **Team Collaboration**: Multi-user campaign management
- **Rate Limiting**: Generation throttling (1/24hrs, 3/week)

### 1.3 Testing Objectives
- ✅ Verify all core functionalities work as designed
- ✅ Ensure data integrity across campaign lifecycle
- ✅ Validate AI-generated content quality and consistency
- ✅ Test autonomous optimization decision-making
- ✅ Confirm security and permission controls
- ✅ Assess system performance under load
- ✅ Identify edge cases and failure scenarios

---

## 2. System Architecture Overview

### 2.1 Component Map

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  CampaignLab.tsx          │  Main campaign dashboard        │
│  CampaignDetail.tsx       │  Single campaign view           │
│  CampaignVariants.tsx     │  Variant management UI          │
│  CampaignPlanningWizard   │  Campaign creation wizard       │
│  CampaignAIAssistant      │  AI chat interface              │
│  CampaignAnalyticsCharts  │  Performance visualization      │
│  CampaignTeamManagement   │  Collaboration controls         │
│  CampaignActivityFeed     │  Activity log display           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER (tRPC)                       │
├─────────────────────────────────────────────────────────────┤
│  campaign.create          │  campaign.update                │
│  campaign.delete          │  campaign.list                  │
│  campaign.generateVariants│  campaign.optimizeCampaign      │
│  campaign.aiAssistant     │  campaign.addTeamMember         │
│  campaign.getPerformance  │  campaign.getActivityLog        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                     │
├─────────────────────────────────────────────────────────────┤
│  campaigns.ts             │  Core CRUD operations           │
│  campaignVariants.ts      │  AI variant generation          │
│  campaignOptimization.ts  │  Performance scoring & auto-opt │
│  campaignApproval.ts      │  Approval workflow logic        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  campaigns                │  Main campaign records          │
│  campaign_variants        │  Ad variations with metrics     │
│  campaign_milestones      │  Timeline tracking              │
│  campaign_deliverables    │  Content deliverables           │
│  campaign_analytics       │  Daily performance data         │
│  campaign_team_members    │  Collaboration permissions      │
│  campaign_activity_log    │  Audit trail                    │
│  campaign_templates       │  Reusable campaign templates    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

**Campaign Creation Flow:**
```
User Input → Wizard Validation → tRPC Mutation → DB Insert → 
Activity Log → Notification → UI Update
```

**Variant Generation Flow:**
```
Campaign Context → AI Prompt Builder → LLM API Call → 
JSON Response → Variant Parsing → DB Insert (5 variants) → 
Approval Queue → UI Refresh
```

**Autonomous Optimization Flow:**
```
Cron Job (hourly) → Fetch Deployed Variants → Calculate Scores → 
Decision Logic → Auto-Pause/Deploy → Activity Log → 
User Notification
```

---

## 3. Test Scope

### 3.1 In-Scope Features

#### ✅ Campaign Management
- Create campaign with wizard
- Update campaign details
- Delete campaign (with cascade)
- Bulk operations (delete, status update)
- Campaign templates (create, use, manage)

#### ✅ Variant Generation
- AI-powered generation (5 psychological angles)
- Rate limiting enforcement
- Image prompt generation
- Variant storage and retrieval

#### ✅ Approval Workflow
- Approve variant
- Reject variant (with reason)
- Deploy approved variant
- Pause deployed variant
- Resume paused variant

#### ✅ Performance Tracking
- Real-time metrics (impressions, clicks, conversions)
- Performance score calculation
- Winner identification
- Analytics dashboard

#### ✅ Autonomous Optimization
- Auto-pause underperformers (score < 30)
- Auto-deploy high performers (score > 70)
- Minimum runtime checks (24hrs)
- Notification triggers

#### ✅ Team Collaboration
- Add team members (owner/editor/viewer)
- Permission checks
- Activity logging
- Real-time updates

### 3.2 Out-of-Scope
- ❌ Actual ad platform integrations (Facebook Ads, Google Ads)
- ❌ Payment processing for ad spend
- ❌ Email marketing automation
- ❌ Advanced A/B testing statistics (chi-square, confidence intervals)

---

## 4. Test Environment Setup

### 4.1 Prerequisites

```bash
# Required software
Node.js >= 18.x
MySQL >= 8.0
Redis (optional, for caching)

# Environment variables
DATABASE_URL="mysql://user:pass@localhost:3306/upsurgeiq_test"
OPENAI_API_KEY="sk-test-..."
FRONTEND_URL="http://localhost:3000"
```

### 4.2 Test Database Setup

```sql
-- Create test database
CREATE DATABASE upsurgeiq_test;

-- Run migrations
npm run db:push

-- Seed test data
npm run db:seed:test
```

### 4.3 Test User Accounts

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@test.com | Test123! | Full access testing |
| Owner | owner@test.com | Test123! | Campaign owner tests |
| Editor | editor@test.com | Test123! | Editor permission tests |
| Viewer | viewer@test.com | Test123! | Read-only tests |

---

## 5. Functional Test Cases

### 5.1 Campaign Creation

#### TC-001: Create Campaign via Wizard
**Priority:** High  
**Prerequisites:** User logged in, has business profile

**Steps:**
1. Navigate to `/dashboard/campaigns`
2. Click "New Campaign" button
3. Fill wizard step 1:
   - Name: "Q1 2025 Product Launch"
   - Goal: "Generate 500 qualified leads"
   - Target Audience: "B2B SaaS decision makers"
4. Fill wizard step 2:
   - Budget: "5000"
   - Platforms: "LinkedIn, Facebook"
5. Fill wizard step 3:
   - Start Date: "2025-01-15"
   - End Date: "2025-03-31"
6. Click "Create Campaign"

**Expected Results:**
- ✅ Campaign created in database
- ✅ Redirected to campaign detail page
- ✅ Success notification displayed
- ✅ Activity log entry created
- ✅ Campaign status = "draft"

**Actual Results:** _[To be filled during testing]_

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-002: Create Campaign with Template
**Priority:** Medium  
**Prerequisites:** At least one public template exists

**Steps:**
1. Navigate to `/dashboard/campaigns`
2. Click "Use Template"
3. Select "Product Launch Template"
4. Modify pre-filled fields as needed
5. Submit form

**Expected Results:**
- ✅ Campaign created with template values
- ✅ Template usage count incremented
- ✅ All template fields populated correctly

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-003: Validation - Missing Required Fields
**Priority:** High  
**Prerequisites:** User on campaign creation wizard

**Steps:**
1. Click "New Campaign"
2. Leave "Name" field empty
3. Attempt to proceed to step 2

**Expected Results:**
- ❌ Form validation error displayed
- ❌ Cannot proceed to next step
- ✅ Error message: "Campaign name is required"

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### 5.2 Variant Generation

#### TC-004: Generate Variants - First Time
**Priority:** Critical  
**Prerequisites:** Campaign created, no variants exist

**Steps:**
1. Open campaign detail page
2. Click "Generate Ad Variations"
3. Wait for AI generation (5-10 seconds)
4. Review generated variants

**Expected Results:**
- ✅ Exactly 5 variants generated
- ✅ Each variant has unique psychological angle:
  - Scarcity
  - Social Proof
  - Authority
  - Reciprocity
  - Curiosity
- ✅ Each variant contains:
  - Name (e.g., "Scarcity Angle")
  - Ad copy (headline + body + CTA)
  - Image prompt
  - Status = "pending"
  - Approval status = "pending"
- ✅ Campaign.lastVariantGeneratedAt updated
- ✅ Campaign.variantGenerationCount = 1

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-005: Rate Limiting - 24 Hour Rule
**Priority:** High  
**Prerequisites:** Variants generated less than 24 hours ago

**Steps:**
1. Open campaign with recently generated variants
2. Click "Generate Ad Variations"
3. Observe response

**Expected Results:**
- ❌ Generation blocked
- ✅ Error message: "Rate limit: Can generate variants once per 24 hours"
- ✅ Next allowed time displayed
- ✅ UI button disabled with tooltip

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-006: Rate Limiting - Weekly Limit (3 generations)
**Priority:** High  
**Prerequisites:** 3 generations already done this week

**Steps:**
1. Attempt 4th generation within 7-day window
2. Observe response

**Expected Results:**
- ❌ Generation blocked
- ✅ Error message: "Weekly limit reached: Maximum 3 variant generations per week"
- ✅ Counter resets after 7 days

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-007: Variant Generation - AI Failure Handling
**Priority:** Medium  
**Prerequisites:** Mock LLM API to return error

**Steps:**
1. Trigger variant generation
2. Simulate API timeout/error

**Expected Results:**
- ✅ User-friendly error message displayed
- ✅ No partial variants saved to database
- ✅ Generation count not incremented
- ✅ User can retry

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### 5.3 Approval Workflow

#### TC-008: Approve Variant
**Priority:** High  
**Prerequisites:** Pending variant exists

**Steps:**
1. Navigate to campaign variants tab
2. Click "Review" on pending variant
3. Review ad copy and image prompt
4. Click "Approve"

**Expected Results:**
- ✅ Variant.approvalStatus = "approved"
- ✅ Variant.deploymentStatus = "not_deployed"
- ✅ Activity log entry created
- ✅ Notification sent to campaign owner
- ✅ Variant appears in "Approved" section
- ✅ "Deploy" button now enabled

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-009: Reject Variant with Reason
**Priority:** Medium  
**Prerequisites:** Pending variant exists

**Steps:**
1. Click "Review" on pending variant
2. Click "Reject"
3. Enter reason: "Copy doesn't match brand voice"
4. Confirm rejection

**Expected Results:**
- ✅ Variant.approvalStatus = "rejected"
- ✅ Activity log includes rejection reason
- ✅ Variant hidden from main list (or marked rejected)
- ✅ Can still view in "Rejected" filter

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-010: Deploy Approved Variant
**Priority:** Critical  
**Prerequisites:** Approved variant exists

**Steps:**
1. Navigate to approved variants
2. Click "Deploy" on variant
3. Confirm deployment

**Expected Results:**
- ✅ Variant.deploymentStatus = "deployed"
- ✅ Variant.deployedAt = current timestamp
- ✅ Activity log entry created
- ✅ Notification sent
- ✅ Variant appears in "Live Ads" section
- ✅ Performance metrics start tracking

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-011: Cannot Deploy Unapproved Variant
**Priority:** High  
**Prerequisites:** Pending variant exists

**Steps:**
1. Attempt to call deployVariant API directly for pending variant
2. Observe response

**Expected Results:**
- ❌ Deployment blocked
- ✅ Error: "Variant must be approved before deployment"
- ✅ Status unchanged

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-012: Pause Deployed Variant
**Priority:** High  
**Prerequisites:** Deployed variant exists

**Steps:**
1. Navigate to live ads
2. Click "Pause" on deployed variant
3. Enter reason: "Budget exhausted"
4. Confirm

**Expected Results:**
- ✅ Variant.deploymentStatus = "paused"
- ✅ Variant.pausedAt = current timestamp
- ✅ Activity log includes reason
- ✅ Notification sent
- ✅ Performance tracking continues (historical data)
- ✅ "Resume" button now available

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-013: Resume Paused Variant
**Priority:** Medium  
**Prerequisites:** Paused variant exists

**Steps:**
1. Navigate to paused variants
2. Click "Resume"
3. Confirm

**Expected Results:**
- ✅ Variant.deploymentStatus = "deployed"
- ✅ Variant.pausedAt = null
- ✅ Activity log entry created
- ✅ Performance tracking resumes

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### 5.4 Performance Tracking

#### TC-014: Update Variant Metrics
**Priority:** High  
**Prerequisites:** Deployed variant exists

**Steps:**
1. Call `campaign.updateVariant` API with metrics:
   ```json
   {
     "id": 123,
     "impressions": 1000,
     "clicks": 50,
     "conversions": 5,
     "cost": 100
   }
   ```
2. Refresh campaign dashboard

**Expected Results:**
- ✅ Metrics saved to database
- ✅ CTR calculated: 5%
- ✅ Conversion rate calculated: 10%
- ✅ Cost per conversion: £20
- ✅ Performance score calculated
- ✅ Charts updated in real-time

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-015: Performance Score Calculation
**Priority:** Critical  
**Prerequisites:** Variant with sufficient data

**Test Data:**
```javascript
// High performer
{
  impressions: 10000,
  clicks: 500,      // 5% CTR
  conversions: 50,  // 10% conversion rate
  cost: 250         // £5 per conversion
}
// Expected score: ~75-85 (weighted: CTR 30%, Conv 40%, Cost 30%)

// Low performer
{
  impressions: 10000,
  clicks: 50,       // 0.5% CTR
  conversions: 2,   // 4% conversion rate
  cost: 200         // £100 per conversion
}
// Expected score: ~15-25
```

**Expected Results:**
- ✅ High performer score > 70
- ✅ Low performer score < 30
- ✅ Score displayed in UI with color coding:
  - Green: > 70
  - Yellow: 30-70
  - Red: < 30

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-016: Winner Identification
**Priority:** High  
**Prerequisites:** Multiple variants with > 100 impressions each

**Steps:**
1. Set up 3 variants with different performance:
   - Variant A: Score 85
   - Variant B: Score 60
   - Variant C: Score 45
2. Call `campaign.optimizeCampaign`

**Expected Results:**
- ✅ Variant A identified as winner
- ✅ Winner must be 10%+ better than second place
- ✅ If difference < 10%, no winner declared
- ✅ Winner marked with badge in UI

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### 5.5 Autonomous Optimization

#### TC-017: Auto-Pause Underperformer
**Priority:** Critical  
**Prerequisites:** Deployed variant with poor performance

**Setup:**
```javascript
// Variant deployed 48 hours ago
{
  deployedAt: "2025-12-24T00:00:00Z",
  impressions: 5000,
  clicks: 25,        // 0.5% CTR
  conversions: 1,    // 4% conversion rate
  cost: 150          // £150 per conversion
  // Score: ~20 (below 30 threshold)
}
```

**Steps:**
1. Run optimization cron job (or call API manually)
2. Check variant status

**Expected Results:**
- ✅ Variant.deploymentStatus = "paused"
- ✅ Variant.pausedAt = current timestamp
- ✅ Activity log: "Auto-paused due to poor performance (score: 20/100)"
- ✅ Notification sent to campaign owner
- ✅ Recommendation: "Generate new variations"

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-018: Auto-Deploy High Performer
**Priority:** High  
**Prerequisites:** Approved but not deployed variant with high score

**Setup:**
```javascript
{
  approvalStatus: "approved",
  deploymentStatus: "not_deployed",
  // Simulated test data (would need actual impressions in real scenario)
  // Score: 75 (above 70 threshold)
}
```

**Steps:**
1. Run optimization check
2. Verify deployment

**Expected Results:**
- ✅ Variant.deploymentStatus = "deployed"
- ✅ Variant.deployedAt = current timestamp
- ✅ Activity log: "Auto-deployed due to high performance (score: 75/100)"
- ✅ Notification sent

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-019: Minimum Runtime Check
**Priority:** Medium  
**Prerequisites:** Recently deployed variant (< 24 hours)

**Setup:**
```javascript
{
  deployedAt: "2025-12-26T10:00:00Z", // 2 hours ago
  // Poor performance but too early to pause
  score: 25
}
```

**Steps:**
1. Run optimization
2. Check if paused

**Expected Results:**
- ❌ Variant NOT paused
- ✅ Reason: "Minimum runtime not met (24 hours required)"
- ✅ Will be re-evaluated in next cycle

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-020: Insufficient Data Check
**Priority:** Medium  
**Prerequisites:** Deployed variant with low sample size

**Setup:**
```javascript
{
  impressions: 50,   // Below 100 minimum
  clicks: 5,         // Below 10 minimum
  conversions: 0
}
```

**Steps:**
1. Run optimization
2. Check decision

**Expected Results:**
- ⬜ No action taken
- ✅ Reason: "Insufficient data for optimization"
- ✅ Minimum requirements: 100 impressions, 10 clicks

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### 5.6 Team Collaboration

#### TC-021: Add Team Member
**Priority:** Medium  
**Prerequisites:** User is campaign owner

**Steps:**
1. Open campaign settings
2. Click "Add Team Member"
3. Enter email: "editor@test.com"
4. Select role: "Editor"
5. Save

**Expected Results:**
- ✅ Team member added to campaign_team_members
- ✅ Email notification sent to invited user
- ✅ Editor can now view and edit campaign
- ✅ Activity log entry created

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-022: Permission Check - Viewer Cannot Edit
**Priority:** High  
**Prerequisites:** User added as "Viewer"

**Steps:**
1. Login as viewer@test.com
2. Navigate to campaign
3. Attempt to edit campaign name
4. Attempt to approve variant

**Expected Results:**
- ❌ Edit buttons disabled/hidden
- ❌ API calls return 403 Forbidden
- ✅ Can view all data
- ✅ Cannot perform mutations

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-023: Remove Team Member
**Priority:** Medium  
**Prerequisites:** Team member exists

**Steps:**
1. Login as campaign owner
2. Open team management
3. Click "Remove" on team member
4. Confirm

**Expected Results:**
- ✅ Member removed from database
- ✅ Member loses access immediately
- ✅ Activity log entry created
- ✅ Notification sent to removed user

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### 5.7 Campaign Templates

#### TC-024: Create Template from Campaign
**Priority:** Low  
**Prerequisites:** Successful campaign exists

**Steps:**
1. Open campaign detail
2. Click "Save as Template"
3. Enter template name: "SaaS Product Launch"
4. Add description
5. Mark as public (optional)
6. Save

**Expected Results:**
- ✅ Template created in campaign_templates
- ✅ Template includes:
  - Goal, target audience, platforms
  - Milestones structure
  - Deliverables structure
  - Strategy notes
- ✅ If public, visible to all users
- ✅ Usage count = 0

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-025: Use Template
**Priority:** Medium  
**Prerequisites:** Template exists

**Steps:**
1. Click "New Campaign from Template"
2. Select template
3. Review pre-filled fields
4. Modify as needed
5. Create campaign

**Expected Results:**
- ✅ Campaign created with template values
- ✅ Template.usageCount incremented
- ✅ User can customize before saving

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### 5.8 Activity Logging

#### TC-026: Activity Log Completeness
**Priority:** Medium  
**Prerequisites:** Perform various campaign actions

**Steps:**
1. Create campaign
2. Generate variants
3. Approve variant
4. Deploy variant
5. Update metrics
6. Pause variant
7. View activity log

**Expected Results:**
- ✅ All actions logged with:
  - Timestamp
  - User who performed action
  - Action type
  - Entity affected
  - Changes made (JSON diff)
- ✅ Logs ordered by timestamp (newest first)
- ✅ Pagination works for > 50 entries

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### 5.9 AI Assistant

#### TC-027: Campaign Strategy Consultation
**Priority:** Medium  
**Prerequisites:** Campaign exists

**Steps:**
1. Open campaign detail
2. Click "AI Assistant"
3. Ask: "How can I improve my CTR?"
4. Review response

**Expected Results:**
- ✅ AI provides contextual advice based on:
  - Campaign goal
  - Current performance
  - Target audience
  - Budget
- ✅ Suggestions are actionable
- ✅ Response time < 5 seconds
- ✅ Conversation history maintained

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-028: AI Assistant - Campaign Planning
**Priority:** Low  
**Prerequisites:** No campaign context

**Steps:**
1. Open AI Assistant (global)
2. Ask: "Help me plan a campaign for a new SaaS product"
3. Follow conversation flow

**Expected Results:**
- ✅ AI asks clarifying questions:
  - Target audience?
  - Budget?
  - Timeline?
  - Key features?
- ✅ Provides strategic recommendations
- ✅ Can create campaign from conversation

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 6. Integration Test Cases

### 6.1 End-to-End Campaign Lifecycle

#### TC-029: Complete Campaign Flow
**Priority:** Critical  
**Duration:** ~30 minutes

**Scenario:**
User creates a campaign, generates variants, approves and deploys them, tracks performance, and optimizes based on results.

**Steps:**
1. **Create Campaign**
   - Login as owner@test.com
   - Create "Summer Sale 2025" campaign
   - Budget: £2000, Duration: 30 days
   
2. **Generate Variants**
   - Click "Generate Ad Variations"
   - Wait for 5 variants
   - Verify all psychological angles present
   
3. **Review & Approve**
   - Review each variant
   - Approve 3 variants
   - Reject 2 variants (with reasons)
   
4. **Deploy**
   - Deploy 2 approved variants
   - Keep 1 approved but not deployed
   
5. **Simulate Performance**
   - Update metrics for deployed variants:
     - Variant A: High performance (score 80)
     - Variant B: Low performance (score 25)
   
6. **Autonomous Optimization**
   - Wait 24+ hours (or mock timestamp)
   - Run optimization
   - Verify Variant B auto-paused
   
7. **Generate New Round**
   - Wait 24 hours
   - Generate new variants
   - Approve and deploy winner
   
8. **Complete Campaign**
   - Mark campaign as "completed"
   - Export performance report

**Expected Results:**
- ✅ All steps complete without errors
- ✅ Data consistency maintained
- ✅ Activity log shows complete audit trail
- ✅ Performance metrics accurate
- ✅ Notifications sent at each stage

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### 6.2 Cross-Feature Integration

#### TC-030: Campaign + Press Release Integration
**Priority:** Medium  
**Prerequisites:** Press release exists

**Steps:**
1. Create campaign
2. Link press release as deliverable
3. Track press release performance
4. View combined analytics

**Expected Results:**
- ✅ Press release appears in campaign deliverables
- ✅ Metrics aggregated correctly
- ✅ Can navigate between campaign and press release

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-031: Campaign + Social Media Integration
**Priority:** Low  
**Prerequisites:** Social accounts connected

**Steps:**
1. Create campaign
2. Generate social media posts from variants
3. Schedule posts
4. Track engagement

**Expected Results:**
- ✅ Social posts created from ad copy
- ✅ Engagement metrics flow back to campaign
- ✅ Unified analytics dashboard

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 7. Performance Test Cases

### 7.1 Load Testing

#### TC-032: Concurrent Variant Generation
**Priority:** High  
**Setup:** 10 users simultaneously generate variants

**Steps:**
1. Create 10 campaigns
2. Trigger variant generation for all at once
3. Monitor response times and success rate

**Expected Results:**
- ✅ All requests complete within 15 seconds
- ✅ No database deadlocks
- ✅ No duplicate variants created
- ✅ Rate limiting enforced per user

**Metrics:**
- Response time: < 10s (p95)
- Success rate: > 95%
- Database connections: < 50

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-033: Large Campaign List Performance
**Priority:** Medium  
**Setup:** User has 100+ campaigns

**Steps:**
1. Seed database with 150 campaigns
2. Navigate to campaign list
3. Apply filters
4. Sort by different columns

**Expected Results:**
- ✅ Initial load < 2 seconds
- ✅ Pagination works smoothly
- ✅ Filters apply instantly
- ✅ No UI lag

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### 7.2 Stress Testing

#### TC-034: Optimization at Scale
**Priority:** Medium  
**Setup:** 50 campaigns with 5 variants each (250 variants)

**Steps:**
1. Run autonomous optimization
2. Monitor execution time
3. Check database load

**Expected Results:**
- ✅ Completes within 5 minutes
- ✅ No memory leaks
- ✅ Correct decisions for all variants
- ✅ Database CPU < 80%

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 8. Security Test Cases

### 8.1 Authentication & Authorization

#### TC-035: Unauthorized Access Prevention
**Priority:** Critical  
**Prerequisites:** User not logged in

**Steps:**
1. Attempt to access `/dashboard/campaigns` without login
2. Attempt direct API call to `campaign.create`

**Expected Results:**
- ❌ Redirected to login page
- ❌ API returns 401 Unauthorized
- ✅ No data leaked

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-036: Cross-User Data Access
**Priority:** Critical  
**Prerequisites:** Two users with separate campaigns

**Steps:**
1. Login as user A
2. Get campaign ID from user B
3. Attempt to access user B's campaign
4. Attempt to edit user B's campaign

**Expected Results:**
- ❌ Cannot view campaign (403 Forbidden)
- ❌ Cannot edit campaign
- ✅ Only team members can access

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### 8.2 Input Validation

#### TC-037: SQL Injection Prevention
**Priority:** Critical  
**Prerequisites:** Campaign creation form

**Steps:**
1. Enter malicious input in campaign name:
   ```sql
   '; DROP TABLE campaigns; --
   ```
2. Submit form

**Expected Results:**
- ✅ Input sanitized/escaped
- ✅ No SQL executed
- ✅ Campaign created with literal string

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### TC-038: XSS Prevention
**Priority:** High  
**Prerequisites:** Campaign with user-generated content

**Steps:**
1. Enter script in campaign description:
   ```html
   <script>alert('XSS')</script>
   ```
2. Save and view campaign

**Expected Results:**
- ✅ Script not executed
- ✅ Content escaped/sanitized
- ✅ Displayed as plain text

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### 8.3 Rate Limiting Security

#### TC-039: API Rate Limiting
**Priority:** Medium  
**Prerequisites:** Automated script

**Steps:**
1. Send 100 requests to `campaign.list` in 1 second
2. Observe response

**Expected Results:**
- ✅ Requests throttled after threshold
- ✅ 429 Too Many Requests returned
- ✅ Retry-After header present
- ✅ No server crash

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 9. User Acceptance Test Scenarios

### 9.1 Marketing Manager Persona

#### UAT-001: First Campaign Setup
**User Story:** As a marketing manager, I want to create my first campaign quickly so I can start testing ads.

**Acceptance Criteria:**
- ✅ Can complete setup in < 5 minutes
- ✅ Wizard guides through all required fields
- ✅ Help text explains each field
- ✅ Can save draft and return later

**Test Scenario:**
1. New user logs in for first time
2. Sees empty campaign dashboard with clear CTA
3. Clicks "Create Your First Campaign"
4. Follows wizard with inline help
5. Generates variants immediately after creation
6. Receives email confirmation

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

#### UAT-002: Daily Performance Check
**User Story:** As a marketing manager, I want to quickly see how my campaigns are performing so I can make informed decisions.

**Acceptance Criteria:**
- ✅ Dashboard loads in < 2 seconds
- ✅ Key metrics visible at a glance
- ✅ Alerts for underperforming ads
- ✅ Can drill down into details

**Test Scenario:**
1. User logs in
2. Sees campaign overview dashboard
3. Identifies underperforming campaign (red indicator)
4. Clicks to view details
5. Reviews AI recommendations
6. Takes action (pause/generate new)

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### 9.2 Business Owner Persona

#### UAT-003: ROI Tracking
**User Story:** As a business owner, I want to see clear ROI on my ad spend so I can justify the investment.

**Acceptance Criteria:**
- ✅ Cost per conversion clearly displayed
- ✅ Total spend vs. revenue tracked
- ✅ Can export reports for stakeholders
- ✅ Historical trends visible

**Test Scenario:**
1. User navigates to campaign analytics
2. Sees spend breakdown by variant
3. Views conversion funnel
4. Exports PDF report
5. Shares with team

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### 9.3 Agency User Persona

#### UAT-004: Multi-Client Management
**User Story:** As an agency user, I want to manage campaigns for multiple clients so I can efficiently serve all accounts.

**Acceptance Criteria:**
- ✅ Can switch between client accounts
- ✅ Separate campaign lists per client
- ✅ Team members can collaborate
- ✅ Activity log shows who did what

**Test Scenario:**
1. User manages 5 client accounts
2. Creates campaign for Client A
3. Adds team member from Client A
4. Switches to Client B
5. No data leakage between clients

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 10. Known Issues & Edge Cases

### 10.1 Known Limitations

#### Issue #1: Variant Generation Timeout
**Severity:** Medium  
**Description:** LLM API occasionally times out (> 30s), causing generation failure.  
**Workaround:** User can retry generation. Rate limiting still applies.  
**Fix ETA:** Q1 2026 (implement retry logic with exponential backoff)

---

#### Issue #2: Performance Score Edge Case
**Severity:** Low  
**Description:** Variants with 0 impressions show score as 0, which is correct but could be confusing.  
**Workaround:** UI shows "Insufficient data" label instead of score.  
**Fix ETA:** Not planned (working as intended)

---

#### Issue #3: Concurrent Approval Race Condition
**Severity:** Low  
**Description:** If two users approve the same variant simultaneously, duplicate activity logs created.  
**Workaround:** Use optimistic locking or transaction isolation.  
**Fix ETA:** Q2 2026

---

### 10.2 Edge Cases to Test

#### Edge Case #1: Campaign with No Variants
- User creates campaign but never generates variants
- Expected: Dashboard shows "Generate your first variants" CTA
- No errors or crashes

#### Edge Case #2: All Variants Rejected
- User rejects all 5 generated variants
- Expected: Prompt to generate new batch immediately (bypass 24hr limit)

#### Edge Case #3: Variant Deleted While Deployed
- Admin manually deletes deployed variant from database
- Expected: Graceful handling, no cascade failures

#### Edge Case #4: Budget Exhausted Mid-Campaign
- Campaign runs out of budget
- Expected: Auto-pause all variants, notify user

#### Edge Case #5: User Deletes Campaign with Active Variants
- Campaign deleted while variants are deployed
- Expected: Cascade delete or archive variants, stop tracking

---

## 11. Test Execution Schedule

### Phase 1: Unit Testing (Week 1)
**Duration:** 5 days  
**Owner:** Development Team

- [ ] Test all database CRUD operations
- [ ] Test performance score calculation
- [ ] Test rate limiting logic
- [ ] Test permission checks
- [ ] Test AI prompt generation

**Deliverable:** Unit test coverage > 80%

---

### Phase 2: Integration Testing (Week 2)
**Duration:** 5 days  
**Owner:** QA Team

- [ ] Execute TC-001 to TC-028 (Functional tests)
- [ ] Execute TC-029 to TC-031 (Integration tests)
- [ ] Document all failures
- [ ] Retest after fixes

**Deliverable:** Test execution report with pass/fail status

---

### Phase 3: Performance Testing (Week 3)
**Duration:** 3 days  
**Owner:** DevOps + QA

- [ ] Execute TC-032 to TC-034 (Load/stress tests)
- [ ] Monitor system metrics
- [ ] Identify bottlenecks
- [ ] Optimize as needed

**Deliverable:** Performance benchmark report

---

### Phase 4: Security Testing (Week 3-4)
**Duration:** 3 days  
**Owner:** Security Team

- [ ] Execute TC-035 to TC-039 (Security tests)
- [ ] Penetration testing
- [ ] Vulnerability scan
- [ ] Fix critical issues

**Deliverable:** Security audit report

---

### Phase 5: User Acceptance Testing (Week 4)
**Duration:** 5 days  
**Owner:** Product Team + Beta Users

- [ ] Execute UAT-001 to UAT-004
- [ ] Gather user feedback
- [ ] Prioritize UX improvements
- [ ] Final sign-off

**Deliverable:** UAT sign-off document

---

### Phase 6: Regression Testing (Week 5)
**Duration:** 3 days  
**Owner:** QA Team

- [ ] Re-run all critical test cases
- [ ] Verify bug fixes
- [ ] Smoke test on staging
- [ ] Production deployment checklist

**Deliverable:** Go/No-Go decision

---

## 12. Appendix

### A. Test Data Requirements

```sql
-- Seed test campaigns
INSERT INTO campaigns (name, goal, budget, status, user_id, business_id) VALUES
('Test Campaign 1', 'Generate leads', '1000', 'active', 1, 1),
('Test Campaign 2', 'Brand awareness', '5000', 'draft', 1, 1),
('Test Campaign 3', 'Product launch', '3000', 'completed', 2, 2);

-- Seed test variants
INSERT INTO campaign_variants (campaign_id, name, psychological_angle, ad_copy, status, approval_status) VALUES
(1, 'Scarcity Angle', 'Scarcity', 'Limited time offer!...', 'testing', 'approved'),
(1, 'Social Proof Angle', 'Social Proof', 'Join 10,000+ customers...', 'testing', 'approved'),
(1, 'Authority Angle', 'Authority', 'Recommended by experts...', 'testing', 'pending');
```

---

### B. API Endpoints Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `campaign.create` | Mutation | ✅ | Create new campaign |
| `campaign.list` | Query | ✅ | List user's campaigns |
| `campaign.getById` | Query | ✅ | Get campaign details |
| `campaign.update` | Mutation | ✅ | Update campaign |
| `campaign.delete` | Mutation | ✅ | Delete campaign |
| `campaign.generateVariants` | Mutation | ✅ | Generate AI variants |
| `campaign.getVariants` | Query | ✅ | List campaign variants |
| `campaign.approveVariant` | Mutation | ✅ | Approve variant |
| `campaign.rejectVariant` | Mutation | ✅ | Reject variant |
| `campaign.deployVariant` | Mutation | ✅ | Deploy variant |
| `campaign.pauseVariant` | Mutation | ✅ | Pause variant |
| `campaign.updateVariant` | Mutation | ✅ | Update metrics |
| `campaign.optimizeCampaign` | Mutation | ✅ | Run optimization |
| `campaign.getPerformanceSummary` | Query | ✅ | Get analytics |
| `campaign.addTeamMember` | Mutation | ✅ | Add collaborator |
| `campaign.getActivityLog` | Query | ✅ | Get audit trail |

---

### C. Performance Benchmarks

| Metric | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| Campaign list load | < 1s | < 2s | > 3s |
| Variant generation | < 8s | < 12s | > 15s |
| Dashboard render | < 1.5s | < 3s | > 5s |
| API response (p95) | < 500ms | < 1s | > 2s |
| Optimization job | < 2min | < 5min | > 10min |

---

### D. Browser Compatibility Matrix

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Supported |
| Firefox | Latest | ✅ Supported |
| Safari | Latest | ✅ Supported |
| Edge | Latest | ✅ Supported |
| Mobile Safari | iOS 15+ | ✅ Supported |
| Chrome Mobile | Android 10+ | ✅ Supported |

---

### E. Glossary

- **Campaign**: A marketing initiative with defined goals, budget, and timeline
- **Variant**: An ad variation with unique copy and creative approach
- **Psychological Angle**: Persuasion technique (Scarcity, Social Proof, etc.)
- **Approval Workflow**: Multi-stage process: Pending → Approved → Deployed
- **Performance Score**: Weighted metric (0-100) based on CTR, conversion rate, and cost efficiency
- **Autonomous Optimization**: Automated decision-making to pause/deploy variants
- **Rate Limiting**: Throttling to prevent abuse (1 generation/24hrs, 3/week)

---

### F. Contact Information

**Product Owner:** [Name]  
**QA Lead:** [Name]  
**Dev Lead:** [Name]  
**Security Lead:** [Name]

**Slack Channel:** #campaign-lab-testing  
**JIRA Project:** CAMP-TEST

---

## Test Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Product Owner | | | |
| Engineering Lead | | | |
| Security Lead | | | |

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Next Review:** January 15, 2026