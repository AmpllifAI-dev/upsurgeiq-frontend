# Frontend UI Vision: Media List Management

## Overview
The media list management UI provides users with a self-service interface to browse, generate, and manage AI-powered journalist contact lists organized by Genre, Geography, and Industry.

**CRITICAL PRIVACY RULE:** AI-generated media lists are proprietary information. NEVER show journalist names, emails, or contact details for AI-generated lists. Only show publication names. Full contact details are ONLY shown for user's own uploaded custom lists.

---

## Page 1: Media List Categories Browser

### Purpose
Allow users to discover and trigger AI generation of media lists across three dimensions:
- **Genre** (lifestyle/hobby-based): Yachting, Fishing, Model Trains, Women's Interest, Men's Lifestyle, Comics, Teenage, etc.
- **Geography**: London, Manchester, Scotland, Wales, etc.
- **Industry**: FinTech, Healthcare, SaaS, Manufacturing, etc.

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
  - **Category name** (e.g., "UK Yachting Media")
  - **Description** (optional, e.g., "Lifestyle journalists covering sailing, yachts, and marine leisure")
  - **Status badge:**
    - 🟢 "Ready" (green) - List is populated with contacts
    - 🟡 "Being Generated" (yellow) - AI is currently building the list (triggered by you or another user)
    - 🔴 "Failed" (red) - Generation failed, click to retry
    - ⚪ "Not Generated" (gray) - List hasn't been requested yet
  - **Contact count** (if generated): "45 publications"
  - **Action indicator:**
    - If ready: "Click to view publications"
    - If being generated: "AI is researching journalists..." with spinner
    - If not generated: "Click to generate this list"

### User Interactions

**Scenario 1: User clicks on a "Not Generated" category**
1. System checks if category is already in generation queue (by any user)
2. If not in queue:
   - Creates new generation request and starts AI agent in background
   - Shows alert: "Generation started! We're building this media list for you. You'll receive an email when it's ready."
   - Card updates to "Being Generated" status with spinner
3. If already in queue by another user:
   - Shows alert: "This list is already being generated! You'll receive an email when it's ready."
   - Card updates to "Being Generated" status with spinner
4. User can navigate away - generation continues in background

**Scenario 2: User clicks on a "Being Generated" category**
1. Shows current generation progress
2. Displays message: "This list is being generated. You'll receive an email when it's ready."
3. Shows estimated time if available: "Usually takes 5-10 minutes"
4. Note: Generation may have been triggered by you or another user

**Scenario 3: User clicks on a "Ready" category**
1. Navigates to detailed publications view page (Page 2)
2. Shows all publications in that category (NOT individual journalist details)

**Scenario 4: User clicks on a "Failed" category**
1. Shows error message: "Generation failed: [error reason]"
2. Offers "Retry Generation" button
3. On retry, creates new generation request

### Generation Queue Status Panel
Below the category grid, show YOUR active generation requests:

```
Your Generation Requests
┌─────────────────────────────────────────────┐
│ UK Yachting Media                [Generating]│
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

## Page 2: Category Publications View (AI-Generated Lists)

### Purpose
Display all publications within a specific AI-generated media list category. **CRITICAL: Only show publication names, NOT individual journalist contact details (proprietary information).**

### Layout

**Header:**
- Breadcrumb: "Media Lists > UK Yachting Media"
- Category name and description
- Publication count: "45 publications in this list"
- "Back to Categories" button

**Privacy Notice Banner:**
```
🔒 Contact details are proprietary information. This list shows publications only.
   When you distribute a press release, our system sends individual emails to journalists at these publications.
```

**Search & Filter Bar:**
- Search input: "Search by publication name..."
- Filter dropdowns:
  - Publication type (Magazine, Newspaper, Online, Broadcast)
  - Region (if applicable)

**Publications Table:**
Sortable table with columns:
- **Publication Name** - Media outlet name only
- **Type** - Magazine, Newspaper, Online, Broadcast
- **Focus** - Coverage area/specialty
- **Region** - Geographic coverage
- **Journalist Count** - "3 journalists" (aggregate only, no names)

**NO individual journalist details shown:**
- ❌ No journalist names
- ❌ No email addresses
- ❌ No social media links
- ✅ Only publication-level information

**Bulk Actions:**
- Checkbox to select multiple publications
- "Use Selected for Distribution" button (navigates to distribution flow)

### Distribution Context
When user selects publications:
- Shows: "You've selected 12 publications (estimated 38 journalists will receive your press release)"
- Cost preview: "This will use 1 credit"
- "Continue to Distribution" button

---

## Page 2B: User's Own Custom Lists View

### Purpose
Display contacts from lists the user has uploaded themselves. **Full details are shown because this is the user's own data.**

### Layout

**Header:**
- Breadcrumb: "Media Lists > My Custom List"
- List name and description
- Contact count: "45 journalists in this list"
- "Back to Categories" button
- "Edit List" / "Delete List" buttons

**Contacts Table:**
Sortable table with columns:
- **Name** - Journalist's full name ✅ (user's own data)
- **Publication** - Media outlet name
- **Email** - Professional email address (with copy button) ✅ (user's own data)
- **Beat** - Coverage area/specialty
- **Social** - Twitter/LinkedIn icons (if available) ✅ (user's own data)
- **Actions** - "Edit" / "Remove" buttons

**Bulk Actions:**
- Checkbox to select multiple contacts
- "Export Selected" button (CSV download)
- "Delete Selected" button
- "Add Contacts" button (upload more)

### Contact Detail Modal
When user clicks "Edit":
- Full contact information (editable)
- Notes field
- "Save Changes" button
- "Delete Contact" button

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
- Description ("Purchased 10 credits" / "Used for UK Yachting Media distribution")
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
   - Shows all "Ready" categories as checkboxes with publication count
   - Shows "Being Generated" categories with spinner (disabled, can't select yet)
   - Shows "Not Generated" categories with "Generate Now" button
   - Displays credit cost: "3 lists selected = 3 credits"
   - **Privacy reminder:** "Your press release will be sent to individual journalists at the selected publications. Contact details are not shown for security reasons."
4. User can trigger generation of new lists on-the-fly
5. User can save distribution for later if lists aren't ready yet

### Email Notifications

**When list generation completes:**
```
Subject: Your UK Yachting Media List is Ready!

Hi [Name],

Great news! Your UK Yachting Media media list has been generated 
and is ready to use.

Publications Found: 45 publications (estimated 120 journalists)

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

### 1. **Privacy Protection (CRITICAL)**
- NEVER show individual journalist names/emails for AI-generated lists
- Only show publication names and aggregate stats
- Full details only for user's own uploaded lists
- Clear privacy notices explaining why details aren't shown
- Emphasize that distribution still works (system sends emails on their behalf)

### 2. **Non-Blocking Generation**
- Users never wait for AI generation
- All generation happens in background
- Email notifications keep users informed
- Users can continue working on other tasks
- Multiple users can trigger the same category (shared generation)

### 3. **Transparent Status**
- Always show current generation status
- Clear visual indicators (badges, spinners)
- Show "Being Generated" even if another user triggered it
- Estimated time when available
- Error messages are actionable

### 4. **Self-Service Discovery**
- Browse all available categories
- No need to request custom lists
- AI automatically builds what users need
- Expand categories over time based on usage

### 5. **Credit Clarity**
- Always show current balance
- Show cost before confirming distribution
- Clear pricing with savings highlighted
- Transaction history for transparency

### 6. **Progressive Enhancement**
- Core functionality works without JavaScript
- Real-time updates enhance experience
- Graceful degradation for older browsers
- Mobile-first responsive design

---

## Genre Category Examples

### Lifestyle & Hobby Categories:
- Yachting & Sailing
- Fishing & Angling
- Model Trains & Railways
- Women's Interest & Lifestyle
- Men's Lifestyle & Grooming
- Comics & Graphic Novels
- Teenage & Youth Culture
- Gardening & Horticulture
- Photography & Imaging
- Cycling & Biking
- Running & Athletics
- Golf & Country Clubs
- Wine & Spirits
- Food & Cooking
- Travel & Adventure
- Pets & Animals
- Home & Interior Design
- Fashion & Style
- Beauty & Cosmetics
- Weddings & Events

### NOT Genre (these are Industry categories):
- ❌ Technology
- ❌ Finance
- ❌ Healthcare
- ❌ Manufacturing

---

## Future Enhancements

### Phase 2 Features:
- **Custom Lists:** Users can upload their own CSV contacts (full details shown)
- **List Combining:** Merge multiple categories into one distribution
- **Contact Enrichment:** AI updates contacts with latest info
- **Engagement Tracking:** See which publications had journalists open emails (aggregate only)
- **Smart Recommendations:** AI suggests relevant categories based on press release content

### Phase 3 Features:
- **Publication Profiles:** Detailed profiles with editorial focus
- **Relationship Management:** Track interactions at publication level
- **Pitch Templates:** Personalized email templates per publication type
- **A/B Testing:** Test different subject lines and content
- **Analytics Dashboard:** Distribution performance metrics (publication-level)

---

## Technical Implementation Notes

### State Management
- Use tRPC queries for data fetching
- Implement optimistic updates for better UX
- Cache category data (changes infrequently)
- Poll generation requests every 30s when on page

### Performance
- Lazy load publication tables (paginate if >100 publications)
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
