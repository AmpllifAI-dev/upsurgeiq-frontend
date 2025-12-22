# Press Release Distribution Flow

## Overview
This document describes the complete user experience for distributing press releases to AI-generated media lists, from selection through delivery.

---

## User Journey

### Entry Points

Users can reach the distribution flow from multiple places:

1. **From Press Release Dashboard** → "Distribute" button next to each press release
2. **From Press Release Detail Page** → "Distribute Now" button
3. **From Saved Distributions** → "Complete Distribution" button
4. **From Onboarding** → "Send Your First Press Release" CTA

---

## Distribution Page Layout

### Header Section
```
┌─────────────────────────────────────────────────────────────┐
│ Distribute Press Release                                     │
│ Send your press release to journalists across multiple      │
│ media lists                                                  │
│                                                              │
│ Credits Available: 15                    [Buy More Credits] │
└─────────────────────────────────────────────────────────────┘
```

### Step 1: Select Press Release

**If coming from press release dashboard:**
- Press release is pre-selected
- Show press release card with title, date, and preview
- "Change Press Release" button to select different one

**If coming from general distribution page:**
- Dropdown to select from user's press releases
- Show preview of selected press release below dropdown

**Press Release Preview Card:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📄 TechStartup Raises £5M Series A                          │
│ Created: Dec 20, 2024                                        │
│                                                              │
│ London-based AI startup TechStartup today announced...      │
│ [Read More]                                                  │
│                                                              │
│ Images: 2 attached                                           │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 2: Select Media Lists

**Section Header:**
```
Select Media Lists
Choose which journalist groups should receive this press release
```

**Tab Navigation:**
```
[By Genre] [By Geography] [By Industry]
```

**Media List Grid:**

Each category displays as a selectable card with checkbox:

```
┌─────────────────────────────────────────────────────────────┐
│ ☑ UK Tech Media                                   [Ready] ✓ │
│                                                              │
│ Technology journalists covering UK startups and innovation  │
│                                                              │
│ 45 journalists                                   1 credit   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ☐ London Finance Press                      [Generating] ⏳ │
│                                                              │
│ Financial journalists based in London                       │
│                                                              │
│ AI is researching journalists...             Not available  │
│ [Save for Later] button appears                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ☐ National Lifestyle Media              [Not Generated] ○   │
│                                                              │
│ Lifestyle and consumer journalists across the UK            │
│                                                              │
│ Click to generate this list               [Generate Now]    │
└─────────────────────────────────────────────────────────────┘
```

**Status Indicators:**

- **✓ Ready (Green)** - List is populated and ready to use
  - Checkbox enabled
  - Shows contact count
  - Shows credit cost

- **⏳ Generating (Yellow)** - AI is currently building the list
  - Checkbox disabled
  - Shows "AI is researching journalists..."
  - Shows estimated time: "Usually takes 5-10 minutes"
  - "Save for Later" button appears

- **○ Not Generated (Gray)** - List hasn't been requested yet
  - Checkbox disabled
  - "Generate Now" button appears
  - Clicking generates list in background

- **✗ Failed (Red)** - Generation failed
  - Checkbox disabled
  - Shows error message
  - "Retry Generation" button appears

**Interactive Behaviors:**

**Scenario A: User clicks checkbox on "Ready" list**
- Checkbox checks
- List added to selection
- Credit cost updates in summary panel

**Scenario B: User clicks "Generate Now" on "Not Generated" list**
- System creates generation request
- AI agent starts researching in background
- Card updates to "Generating" status with spinner
- Alert: "Generation started! We'll email you when it's ready."
- "Save for Later" button appears below summary panel

**Scenario C: User tries to select "Generating" list**
- Checkbox remains disabled
- Tooltip: "This list is being generated. Save your distribution for later or choose a different list."

---

### Step 3: Review & Configure

**Selection Summary Panel** (sticky on right side or bottom on mobile):

```
┌─────────────────────────────────────────────────────────────┐
│ Distribution Summary                                         │
│                                                              │
│ Press Release: TechStartup Raises £5M Series A              │
│                                                              │
│ Selected Lists:                                              │
│ • UK Tech Media (45 journalists)                            │
│ • Manchester Business Press (32 journalists)                │
│ • FinTech Industry Media (58 journalists)                   │
│                                                              │
│ Total Recipients: 135 journalists                           │
│                                                              │
│ Credit Cost: 3 credits                                       │
│ Your Balance: 15 credits                                     │
│ After Distribution: 12 credits                              │
│                                                              │
│ [Save for Later]              [Send Now]                     │
└─────────────────────────────────────────────────────────────┘
```

**Scheduling Options** (optional, collapsed by default):

```
┌─────────────────────────────────────────────────────────────┐
│ ▼ Schedule for Later                                         │
│                                                              │
│ ○ Send immediately                                           │
│ ○ Schedule for specific time                                 │
│                                                              │
│   Date: [Dec 22, 2024 ▼]                                    │
│   Time: [09:00 AM ▼]                                         │
│   Timezone: GMT (London)                                     │
│                                                              │
│ Note: You can also save and send later without scheduling   │
└─────────────────────────────────────────────────────────────┘
```

---

## User Actions & Outcomes

### Action 1: Send Now (All Lists Ready)

**Pre-conditions:**
- At least 1 media list selected
- All selected lists have "Ready" status
- User has sufficient credits

**Flow:**
1. User clicks "Send Now"
2. Confirmation modal appears:
   ```
   ┌─────────────────────────────────────────────────────────┐
   │ Confirm Distribution                                     │
   │                                                          │
   │ You're about to send this press release to:             │
   │ • 135 journalists across 3 media lists                  │
   │                                                          │
   │ This will deduct 3 credits from your account.           │
   │                                                          │
   │ [Cancel]                          [Confirm & Send]       │
   └─────────────────────────────────────────────────────────┘
   ```
3. User clicks "Confirm & Send"
4. Backend processes distribution:
   - Checks credit balance
   - Deducts 3 credits
   - Uploads images to S3 (if not already uploaded)
   - Sends individual emails to each journalist
   - Tracks success/failure counts
5. Progress indicator shows:
   ```
   Sending press release...
   ████████████████████░░░░  85% (115/135 sent)
   ```
6. Success page displays:
   ```
   ┌─────────────────────────────────────────────────────────┐
   │ ✓ Press Release Sent Successfully!                      │
   │                                                          │
   │ Your press release was sent to 135 journalists          │
   │                                                          │
   │ Delivery Summary:                                        │
   │ • Successfully sent: 132 emails                          │
   │ • Failed: 3 emails (invalid addresses)                   │
   │                                                          │
   │ Credits used: 3                                          │
   │ Remaining balance: 12 credits                            │
   │                                                          │
   │ [View Distribution Report]  [Send Another]               │
   └─────────────────────────────────────────────────────────┘
   ```

**Perceived Outcome:**
- User feels confident their press release reached journalists
- Clear feedback on delivery success
- Transparency on credit usage
- Easy path to send another press release

---

### Action 2: Save for Later (Some Lists Generating)

**Pre-conditions:**
- At least 1 media list selected
- At least 1 selected list has "Generating" status
- OR user wants to review before sending

**Flow:**
1. User clicks "Save for Later"
2. System saves distribution configuration:
   - Press release ID
   - Selected media list IDs (including generating ones)
   - Scheduled time (if set)
3. Confirmation message:
   ```
   ┌─────────────────────────────────────────────────────────┐
   │ ✓ Distribution Saved                                     │
   │                                                          │
   │ We'll email you when all selected lists are ready.      │
   │                                                          │
   │ You can complete this distribution anytime from your    │
   │ Saved Distributions page.                               │
   │                                                          │
   │ [View Saved Distributions]  [OK]                         │
   └─────────────────────────────────────────────────────────┘
   ```
4. System creates reminder:
   - If lists still generating after 24 hours → send reminder email
   - If all lists ready → send "ready to send" email

**Perceived Outcome:**
- User doesn't lose progress
- System handles the waiting for them
- Proactive notifications keep them informed
- Can return anytime to complete

---

### Action 3: Generate New List On-the-Fly

**Pre-conditions:**
- User finds a "Not Generated" category they want
- User is willing to wait or save for later

**Flow:**
1. User clicks "Generate Now" button on category card
2. System checks if generation already in progress
3. If not, creates new generation request
4. AI agent starts researching in background
5. Card updates to "Generating" status
6. Alert message:
   ```
   Generation started! We're building the UK Lifestyle Media 
   list for you. This usually takes 5-10 minutes. 
   
   You'll receive an email when it's ready.
   ```
7. "Save for Later" button becomes prominent
8. User can either:
   - **Option A:** Continue selecting other "Ready" lists and send those now
   - **Option B:** Save entire distribution for later
   - **Option C:** Navigate away and return when email arrives

**Perceived Outcome:**
- User gets exactly the media list they need
- No waiting required - can continue working
- System handles complexity in background
- Flexibility to send partial distribution or wait for all

---

### Action 4: Insufficient Credits

**Pre-conditions:**
- User selects media lists totaling more credits than they have
- Example: 2 credits remaining, 3 lists selected

**Flow:**
1. User clicks "Send Now"
2. Error modal appears:
   ```
   ┌─────────────────────────────────────────────────────────┐
   │ ⚠ Insufficient Credits                                   │
   │                                                          │
   │ You need 3 credits but only have 2 remaining.           │
   │                                                          │
   │ Options:                                                 │
   │ • Purchase more credits                                  │
   │ • Deselect 1 media list to reduce cost                  │
   │                                                          │
   │ [Buy Credits]              [Go Back]                     │
   └─────────────────────────────────────────────────────────┘
   ```
3. If user clicks "Buy Credits":
   - Redirects to `/credits` page
   - After purchase, redirects back to distribution page
   - Selection is preserved
4. If user clicks "Go Back":
   - Returns to media list selection
   - Can deselect lists to reduce cost

**Perceived Outcome:**
- Clear explanation of the problem
- Multiple solutions offered
- No lost progress
- Easy path to resolution

---

## Email Notifications

### 1. Media List Ready Notification

**Trigger:** AI completes generating a media list

**Subject:** Your [Category Name] Media List is Ready!

**Body:**
```
Hi [User Name],

Great news! Your UK Tech Media list has been generated and is 
ready to use.

Contacts Found: 45 journalists

You can now use this list when distributing your press releases.

[View Media Lists] [Distribute Press Release]

Best regards,
The UpsurgeIQ Team
```

**User Action:**
- Clicks "Distribute Press Release" → Goes to distribution page
- Clicks "View Media Lists" → Goes to category contacts page

---

### 2. Saved Distribution Reminder (24hr)

**Trigger:** 24 hours after saving distribution, if not yet sent

**Subject:** Reminder: Complete Your Press Release Distribution

**Body:**
```
Hi [User Name],

You saved a press release distribution 24 hours ago but haven't 
completed it yet.

Press Release: TechStartup Raises £5M Series A
Selected Lists: 3 media lists (135 journalists)

Status: All lists are now ready to send!

Don't forget to send your press release to maximize its impact.

[Complete Distribution Now]

Best regards,
The UpsurgeIQ Team
```

**User Action:**
- Clicks "Complete Distribution Now" → Goes to saved distribution page
- Can review and send immediately

---

### 3. Distribution Sent Confirmation

**Trigger:** Immediately after successful distribution

**Subject:** Your Press Release Has Been Sent

**Body:**
```
Hi [User Name],

Your press release "TechStartup Raises £5M Series A" has been 
successfully distributed!

Delivery Summary:
• Successfully sent: 132 emails
• Failed: 3 emails (invalid addresses)
• Total recipients: 135 journalists across 3 media lists

Credits Used: 3
Remaining Balance: 12 credits

[View Distribution Report] [Send Another Press Release]

Best regards,
The UpsurgeIQ Team
```

**User Action:**
- Clicks "View Distribution Report" → Goes to distribution analytics
- Clicks "Send Another" → Goes to distribution page

---

## Saved Distributions Page

### Purpose
Show all distributions user has saved for later, with ability to complete or delete them.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Saved Distributions                                          │
│                                                              │
│ Press releases you've saved to send later                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TechStartup Raises £5M Series A                              │
│ Saved: Dec 20, 2024 at 3:45 PM                              │
│                                                              │
│ Selected Lists: 3 (135 journalists)                         │
│ Status: ✓ All lists ready                                   │
│ Cost: 3 credits                                              │
│                                                              │
│ [Complete Distribution]  [Delete]                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ New Product Launch Announcement                              │
│ Saved: Dec 19, 2024 at 10:22 AM                             │
│                                                              │
│ Selected Lists: 2 (87 journalists)                          │
│ Status: ⏳ 1 list still generating                           │
│ Cost: 2 credits (when ready)                                 │
│                                                              │
│ [View Details]  [Delete]                                     │
└─────────────────────────────────────────────────────────────┘
```

**Status Indicators:**
- **✓ All lists ready** - Can send immediately
- **⏳ X lists still generating** - Must wait
- **✗ Generation failed** - Needs attention

**Actions:**
- **Complete Distribution** - Opens distribution page with saved configuration
- **View Details** - Shows which lists are ready/generating
- **Delete** - Removes saved distribution (doesn't delete press release)

---

## Distribution Report Page

### Purpose
Show detailed analytics for a completed distribution, including delivery status and engagement metrics (future).

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Distribution Report                                          │
│ TechStartup Raises £5M Series A                              │
│ Sent: Dec 20, 2024 at 4:15 PM                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Delivery Summary                                             │
│                                                              │
│ ✓ Successfully Sent: 132 emails                             │
│ ✗ Failed: 3 emails                                           │
│ ━ Total Recipients: 135 journalists                          │
│                                                              │
│ Credits Used: 3                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Media Lists Used                                             │
│                                                              │
│ UK Tech Media                                                │
│ • Sent: 43/45 journalists                                    │
│ • Failed: 2 (invalid email addresses)                        │
│                                                              │
│ Manchester Business Press                                    │
│ • Sent: 32/32 journalists                                    │
│ • Failed: 0                                                  │
│                                                              │
│ FinTech Industry Media                                       │
│ • Sent: 57/58 journalists                                    │
│ • Failed: 1 (bounce)                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Failed Recipients                                            │
│                                                              │
│ • john.smith@oldpublication.com - Invalid email              │
│ • editor@closedoutlet.co.uk - Domain not found               │
│ • news@bounced.com - Mailbox full                            │
│                                                              │
│ [Report Issue] [Download Full Report]                        │
└─────────────────────────────────────────────────────────────┘
```

**Future Enhancements:**
- Email open rates (requires tracking pixels)
- Click-through rates (requires tracked links)
- Journalist responses/replies
- Coverage secured (manual input or auto-detection)

---

## Key UX Principles

### 1. **Progressive Disclosure**
- Show essential information first
- Hide advanced options (scheduling) behind collapsible sections
- Reveal details only when needed

### 2. **Clear Status Communication**
- Visual indicators (colors, icons) for list status
- Real-time updates when lists become ready
- Transparent credit costs before commitment

### 3. **Non-Blocking Workflow**
- Users never wait for AI generation
- Can send to ready lists immediately
- Can save and return later for generating lists
- Background processing with email notifications

### 4. **Flexible Decision Points**
- Generate new lists on-the-fly
- Send partial distribution or wait for all
- Save for later at any point
- Change selection before sending

### 5. **Confidence Through Transparency**
- Show exact recipient count before sending
- Display credit cost clearly
- Confirm before deducting credits
- Detailed delivery report after sending

### 6. **Error Prevention & Recovery**
- Check credit balance before allowing send
- Validate all selections before processing
- Preserve saved distributions indefinitely
- Allow deletion of saved distributions

### 7. **Contextual Guidance**
- Tooltips explain why checkboxes are disabled
- Inline help for scheduling options
- Clear next steps after each action
- Proactive suggestions (e.g., "Buy more credits")

---

## Technical Implementation Notes

### State Management
- Use tRPC queries for real-time data
- Poll generation status every 30s when on page
- Optimistic updates for checkbox selections
- Persist saved distributions in database

### Performance
- Lazy load journalist contacts (not needed for distribution)
- Cache media list categories (change infrequently)
- Debounce credit balance checks
- Stream email sending (don't wait for all to complete)

### Error Handling
- Retry failed email sends (max 3 attempts)
- Log all failures for debugging
- Show user-friendly error messages
- Provide "Contact Support" fallback

### Analytics Tracking
- Track which categories are most popular
- Monitor generation success rates
- Measure time from save to send
- Track credit purchase conversion after "insufficient credits" error

---

## Success Metrics

### User Engagement
- % of users who complete first distribution
- Average media lists per distribution
- Time from press release creation to distribution
- Saved distribution completion rate

### System Performance
- Email delivery success rate (target: >98%)
- Average generation time per media list
- Credit purchase conversion rate
- Distribution abandonment rate

### Business Impact
- Revenue from credit purchases
- Average credits used per user per month
- User retention after first distribution
- Referrals from satisfied users

---

## Future Enhancements

### Phase 2
- **Smart Recommendations:** AI suggests relevant media lists based on press release content
- **Batch Distribution:** Send same press release to multiple lists over time
- **A/B Testing:** Test different subject lines or content variations
- **Engagement Tracking:** See which journalists opened emails

### Phase 3
- **Journalist Profiles:** View detailed profiles before sending
- **Relationship Management:** Track interactions with each journalist
- **Coverage Tracking:** Link press releases to resulting articles
- **ROI Analytics:** Measure press release effectiveness

### Phase 4
- **API Access:** Programmatic distribution for power users
- **White-Label:** Custom branding for agency clients
- **Team Collaboration:** Multiple users managing distributions
- **Advanced Targeting:** Filter journalists by beat, region, publication type
