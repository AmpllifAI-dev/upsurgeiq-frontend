# Frontend UI Vision: Media List Management

## Overview
The media list management UI provides users with a self-service interface to browse, generate, and manage AI-powered journalist contact lists organized by Genre, Geography, and Industry.

---

## Page 1: Media List Categories Browser

### Purpose
Allow users to discover and trigger AI generation of media lists across three dimensions: Genre (e.g., Technology, Finance), Geography (e.g., London, Manchester), and Industry (e.g., FinTech, Healthcare).

### Layout

**Header Section:**
- Page title: "Media List Categories"
- Subtitle: "Browse and select media lists by genre, geography, or industry. Lists are automatically generated when you select them."
- Credit balance indicator in top-right: "Credits: 15" with link to purchase page

**Tab Navigation:**
- Three tabs: "By Genre" | "By Geography" | "By Industry"
- Default to "By Genre" on first visit

**Category Grid:**
- 3-column responsive grid (1 column on mobile, 2 on tablet, 3 on desktop)
- Each category displayed as a card with:
  - **Category name** (e.g., "UK Tech Media")
  - **Description** (optional, e.g., "Technology journalists covering UK startups and innovation")
  - **Status badge:**
    - 🟢 "Ready" (green) - List is populated with contacts
    - 🟡 "Generating" (yellow) - AI is currently building the list
    - 🔴 "Failed" (red) - Generation failed, click to retry
    - ⚪ "Not Generated" (gray) - List hasn't been requested yet
  - **Contact count** (if generated): "45 journalists"
  - **Action indicator:**
    - If ready: "Click to view contacts"
    - If generating: "AI is researching journalists..." with spinner
    - If not generated: "Click to generate this list"

### User Interactions

**Scenario 1: User clicks on a "Not Generated" category**
1. System checks if category is already in generation queue
2. If not, creates new generation request and starts AI agent in background
3. Shows alert: "Generation started! We're building this media list for you. You'll receive an email when it's ready."
4. Card updates to "Generating" status with spinner
5. User can navigate away - generation continues in background

**Scenario 2: User clicks on a "Generating" category**
1. Shows current generation progress
2. Displays message: "This list is being generated. You'll receive an email when it's ready."
3. Shows estimated time if available: "Usually takes 5-10 minutes"

**Scenario 3: User clicks on a "Ready" category**
1. Navigates to detailed contacts view page (Page 2)
2. Shows all journalist contacts in that category

**Scenario 4: User clicks on a "Failed" category**
1. Shows error message: "Generation failed: [error reason]"
2. Offers "Retry Generation" button
3. On retry, creates new generation request

### Generation Queue Status Panel
Below the category grid, show active generation requests:

```
Your Generation Requests
┌─────────────────────────────────────────────┐
│ UK Tech Media                    [Generating]│
│ Requested 2 minutes ago                      │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ London Finance Press             [Processing]│
│ Requested 15 minutes ago                     │
└─────────────────────────────────────────────┘
```

**Auto-refresh:**
- Poll generation requests every 30 seconds
- Update status badges in real-time
- Show notification when generation completes (if user is still on page)

---

## Page 2: Category Contacts View

### Purpose
Display all journalist contacts within a specific media list category, with search and filtering capabilities.

### Layout

**Header:**
- Breadcrumb: "Media Lists > UK Tech Media"
- Category name and description
- Contact count: "45 journalists in this list"
- "Back to Categories" button

**Search & Filter Bar:**
- Search input: "Search by name, publication, or beat..."
- Filter dropdowns:
  - Publication (multi-select)
  - Beat/Topic (multi-select)
  - Region (if applicable)

**Contacts Table:**
Sortable table with columns:
- **Name** - Journalist's full name
- **Publication** - Media outlet name
- **Email** - Professional email address (with copy button)
- **Beat** - Coverage area/specialty
- **Social** - Twitter/LinkedIn icons (if available)
- **Actions** - "View Details" button

**Bulk Actions:**
- Checkbox to select multiple contacts
- "Export Selected" button (CSV download)
- "Add to Custom List" button (for future feature)

### Contact Detail Modal
When user clicks "View Details":
- Full contact information
- Recent articles (if available from AI research)
- Notes field (editable by user)
- "Send Test Email" button
- "Report Incorrect Info" button

---

## Page 3: Credit Management & Purchase

### Purpose
Allow users to view their credit balance, transaction history, and purchase credit bundles.

### Layout

**Credit Balance Card:**
```
┌─────────────────────────────────────────────┐
│ Your Credit Balance                          │
│                                              │
│         15 Credits                           │
│                                              │
│ Each credit = 1 media list per distribution │
└─────────────────────────────────────────────┘
```

**Purchase Options:**
Three pricing cards side-by-side:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Starter      │  │ Professional │  │ Enterprise   │
│              │  │              │  │              │
│ 10 Credits   │  │ 20 Credits   │  │ 30 Credits   │
│ £36          │  │ £68          │  │ £96          │
│ £3.60/credit │  │ £3.40/credit │  │ £3.20/credit │
│              │  │              │  │              │
│ Save £4      │  │ Save £12     │  │ Save £24     │
│              │  │ [POPULAR]    │  │              │
│ [Purchase]   │  │ [Purchase]   │  │ [Purchase]   │
└──────────────┘  └──────────────┘  └──────────────┘
```

**How Credits Work Section:**
- "1 credit = 1 media list per press release distribution"
- "Example: Sending a press release to 3 media lists costs 3 credits"
- "Credits never expire"
- "Unused credits roll over"

**Transaction History:**
Table showing:
- Date
- Type (Purchase / Deduction / Refund)
- Amount (+10 / -3)
- Description ("Purchased 10 credits" / "Used for UK Tech Media distribution")
- Balance after transaction

### Purchase Flow

**Step 1: User clicks "Purchase" button**
- Creates Stripe Checkout session
- Redirects to Stripe hosted payment page

**Step 2: User completes payment**
- Stripe processes payment
- Webhook triggers credit fulfillment
- User redirected back to credit management page

**Step 3: Credits added**
- Success message: "Payment successful! 10 credits added to your account."
- Balance updates immediately
- Transaction appears in history

**Error Handling:**
- Payment failed: "Payment was not completed. Please try again."
- Webhook failed: "Payment received but credits not added yet. Contact support if this persists."

---

## Integration Points

### With Onboarding Flow
During user onboarding:
1. Show "Select Your Media Lists" step
2. Display category browser (same as Page 1)
3. User selects 2-3 categories they're interested in
4. AI automatically queues generation for selected categories
5. User receives email when lists are ready
6. Onboarding continues (doesn't block on generation)

### With Press Release Distribution Flow
When user wants to distribute a press release:
1. Navigate to "Distribute Press Release" page
2. Select press release to distribute
3. **Media List Selection Section:**
   - Shows all "Ready" categories as checkboxes
   - Shows "Generating" categories with spinner (disabled, can't select yet)
   - Shows "Not Generated" categories with "Generate Now" button
   - Displays credit cost: "3 lists selected = 3 credits"
4. User can trigger generation of new lists on-the-fly
5. User can save distribution for later if lists aren't ready yet

### Email Notifications

**When list generation completes:**
```
Subject: Your UK Tech Media List is Ready!

Hi [Name],

Great news! Your UK Tech Media media list has been generated 
and is ready to use.

Contacts Found: 45 journalists

You can now use this list when distributing your press releases.

[View Media Lists]

Best regards,
The UpsurgeIQ Team
```

**When saved distribution reminder triggers (24hr):**
```
Subject: Reminder: Complete Your Press Release Distribution

Hi [Name],

You saved a press release distribution 24 hours ago but haven't 
completed it yet.

Don't forget to send your press release to maximize its impact!

[Complete Distribution]

Best regards,
The UpsurgeIQ Team
```

---

## Key UX Principles

### 1. **Non-Blocking Generation**
- Users never wait for AI generation
- All generation happens in background
- Email notifications keep users informed
- Users can continue working on other tasks

### 2. **Transparent Status**
- Always show current generation status
- Clear visual indicators (badges, spinners)
- Estimated time when available
- Error messages are actionable

### 3. **Self-Service Discovery**
- Browse all available categories
- No need to request custom lists
- AI automatically builds what users need
- Expand categories over time based on usage

### 4. **Credit Clarity**
- Always show current balance
- Show cost before confirming distribution
- Clear pricing with savings highlighted
- Transaction history for transparency

### 5. **Progressive Enhancement**
- Core functionality works without JavaScript
- Real-time updates enhance experience
- Graceful degradation for older browsers
- Mobile-first responsive design

---

## Future Enhancements

### Phase 2 Features:
- **Custom Lists:** Users can upload their own CSV contacts
- **List Combining:** Merge multiple categories into one distribution
- **Contact Enrichment:** AI updates contacts with latest info
- **Engagement Tracking:** See which journalists opened emails
- **Smart Recommendations:** AI suggests relevant categories based on press release content

### Phase 3 Features:
- **Journalist Profiles:** Detailed profiles with article history
- **Relationship Management:** Track interactions with each journalist
- **Pitch Templates:** Personalized email templates per journalist
- **A/B Testing:** Test different subject lines and content
- **Analytics Dashboard:** Distribution performance metrics

---

## Technical Implementation Notes

### State Management
- Use tRPC queries for data fetching
- Implement optimistic updates for better UX
- Cache category data (changes infrequently)
- Poll generation requests every 30s when on page

### Performance
- Lazy load contact tables (paginate if >100 contacts)
- Debounce search input (300ms)
- Cache Stripe checkout sessions
- Preload "Ready" categories for faster navigation

### Error Handling
- Retry failed generations automatically (max 3 attempts)
- Show user-friendly error messages
- Log errors for debugging
- Provide "Contact Support" fallback

### Accessibility
- Keyboard navigation for all interactions
- Screen reader announcements for status changes
- High contrast mode support
- Focus management in modals

---

## Success Metrics

### User Engagement:
- % of users who generate at least 1 list
- Average number of categories generated per user
- Time from signup to first distribution

### Generation Performance:
- Average generation time per category
- Success rate (% completed vs failed)
- User satisfaction with contact quality

### Revenue:
- Credit purchase conversion rate
- Average credits purchased per transaction
- Credit utilization rate (used vs unused)

### Distribution:
- Average lists per distribution
- Most popular categories
- Distribution completion rate (saved vs sent)
