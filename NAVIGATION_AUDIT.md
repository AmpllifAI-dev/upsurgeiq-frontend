# Navigation Audit - UpsurgeIQ Dashboard

## Current Navigation Structure

### Main Menu (Currently in Sidebar)
- ✅ Dashboard (`/dashboard`)
- ✅ Press Releases (`/press-releases`)
- ✅ Social Media (`/social-media`)
- ✅ Campaigns (`/campaigns`)
- ✅ Sports Teams (`/dashboard/sports-teams`)
- ✅ Media Lists (`/media-lists`)
- ✅ Analytics (`/analytics`)
- ✅ Issue Tracker (`/issues`)
- ✅ Issue Analytics (`/issue-analytics`)
- ✅ AI Add-ons (`/dashboard/ai-addons`)
- ✅ Image Packs (`/dashboard/image-packs`)
- ✅ Social Connections (`/dashboard/social-connections`)

### Admin Menu
- ✅ White Label Settings (`/dashboard/white-label-settings`)

## Missing Pages (Not in Navigation)

### Email Marketing Suite (NEW SECTION NEEDED)
- ❌ Email Campaigns (`/email-campaigns`)
- ❌ Email Templates (`/email-templates`)
- ❌ Email Template Library (`/email-template-library`)
- ❌ Email Workflows (`/email-workflows`)
- ❌ Email Analytics (`/email-analytics`)
- ❌ Email Deliverability (`/email-deliverability`)
- ❌ SendGrid Setup (`/sendgrid-setup`)

### Content & Templates
- ❌ Press Release Templates (`/press-release-templates`)
- ❌ Campaign Templates (`/campaign-templates`)
- ❌ Content Calendar (`/content-calendar`)

### Settings & Configuration
- ❌ Profile (`/profile`)
- ❌ Notification Preferences (`/notification-preferences`)
- ❌ WordPress Settings (`/wordpress-settings`)
- ❌ Webhook Settings (`/webhook-settings`)
- ❌ Team Management (`/team-management`)

### Billing & Subscription
- ❌ Billing History (`/billing-history`)
- ❌ Purchases (`/purchases`)
- ❌ Usage Tracking (`/usage-tracking`)
- ❌ Subscription Upgrade (`/subscription-upgrade`)

### Admin Tools
- ❌ Error Logs (`/error-logs`)
- ❌ Admin Credit Management (`/admin-credit-management`)
- ❌ Admin Credit Monitoring (`/admin-credit-monitoring`)
- ❌ Admin Alert Management (`/admin-alert-management`)
- ❌ Newsletter Admin (`/newsletter-admin`)

### Partner Portal
- ❌ Partners (`/partners`)

### Detail/Action Pages (Accessible via parent pages - don't need direct nav)
- Press Release Detail (`/press-releases/:id`)
- Press Release Edit (`/press-releases/:id/edit`)
- Press Release New (`/press-releases/new`)
- Press Release Distribution (`/press-releases/:id/distribute`)
- Distribute Press Release (`/distribute/:id`)
- Campaign Detail (`/campaigns/:id`)
- Campaign Review (`/campaigns/:id/review`)
- Campaign Lab Sales (`/campaign-lab-sales`)
- Journalist Detail (`/journalists/:id`)
- Journalist Form (`/journalists/new`)
- Journalist List (`/media-lists/:id/journalists`)
- Issue Detail (`/issues/:id`)
- Report Issue (`/report-issue`)
- Social Media New (`/social-media/new`)

### Public Pages (Accessible via hamburger menu - already implemented)
- Home (`/`)
- About (`/about`)
- Contact (`/contact`)
- Blog (`/blog`)
- Blog Post (`/blog/:slug`)
- FAQ (`/faq`)
- Help (`/help`)
- Resources (`/resources`)
- Case Studies (`/case-studies`)
- Testimonials (`/testimonials`)
- Privacy (`/privacy`)
- Terms (`/terms`)
- Cookie Policy (`/cookie-policy`)
- Status (`/status`)

### Utility Pages (Don't need navigation)
- Subscribe (`/subscribe`)
- Subscriber Preferences (`/subscriber-preferences`)
- Onboarding (`/onboarding`)
- Purchase Success (`/purchase-success`)
- Purchase Cancel (`/purchase-cancel`)
- Not Found (404)
- Component Showcase (`/component-showcase`)
- Pricing Calculator (`/pricing-calculator`)
- Upgrade (`/upgrade`)

## Recommended Navigation Structure

### Main Sections
1. **Dashboard** - Overview
2. **Content Creation**
   - Press Releases
   - Social Media
   - Content Calendar
3. **Marketing**
   - Campaigns
   - Email Campaigns
   - Email Templates
   - Email Workflows
4. **Distribution**
   - Media Lists
   - Social Connections
5. **Analytics & Reporting**
   - Analytics Dashboard
   - Email Analytics
   - Issue Analytics
6. **Tools & Add-ons**
   - AI Assistant
   - AI Add-ons
   - Image Packs
   - Sports Teams
7. **Support**
   - Issue Tracker
   - Help Center
8. **Settings**
   - Profile
   - Team Management
   - Notifications
   - Integrations (WordPress, Webhooks, SendGrid)
   - Billing & Usage
   - Subscription

### Admin Section (role-based)
- White Label Settings
- Error Logs
- Credit Management
- Alert Management
- Newsletter Admin
- Partner Portal

## Implementation Priority

### High Priority (Core Features)
1. Add Settings submenu with Profile, Notifications, Team
2. Add Email Marketing section
3. Add Content Calendar to content section
4. Add Billing & Usage to settings

### Medium Priority (Enhanced Features)
1. Add Templates section
2. Add Integrations submenu
3. Reorganize analytics into one section

### Low Priority (Admin/Advanced)
1. Expand admin section
2. Add partner portal access

## Notes
- Many detail pages are correctly accessible only through parent pages
- Public pages are accessible via hamburger menu (already implemented)
- Focus should be on making key feature pages discoverable
- Consider using collapsible sections for complex menus
