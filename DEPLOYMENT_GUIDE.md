# upsurgeIQ Production Deployment Guide

This guide walks you through everything you need to do to launch upsurgeIQ in production.

---

## ✅ Completed Setup

The following items are already configured and working:

- ✅ **Stripe Product & Price IDs** - All three tiers configured
- ✅ **Email Forwarding** - christopher@upsurgeiq.com → christopher@thealchemyexperience.co.uk
- ✅ **Database Schema** - All tables created and migrated
- ✅ **Authentication** - Manus OAuth integrated
- ✅ **Design System** - Brand colors and typography configured
- ✅ **All Core Features** - Press releases, social media, media lists, AI assistant, campaign lab, partner portal

---

## 🚀 Required Actions for Production Launch

### 1. Configure Stripe Webhook Endpoint

**Why:** Stripe needs to notify your server when payments succeed, subscriptions are created, or billing changes occur.

**Steps:**

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   - **Development:** `https://3000-irlodx94q2byes4erdmgy-fd24d81b.manusvm.computer/api/stripe/webhook`
   - **Production:** `https://upsurgeiq.com/api/stripe/webhook` (after publishing)
4. Select these events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. The signing secret is already configured in your environment variables as `STRIPE_WEBHOOK_SECRET`

**Test it:**
- Stripe provides a "Send test webhook" button in the dashboard
- Click it to verify your endpoint receives events correctly

---

### 2. Test Payment Flow End-to-End

**Why:** Verify the complete user journey from signup to payment to subscription activation.

**Steps:**

1. **Open the platform** in your browser (click Preview in Management UI)
2. **Sign in** using the "Go to Dashboard" button
3. **Navigate to Subscribe page** (`/subscribe`)
4. **Click "Get Started"** on any pricing tier
5. **Use Stripe test card:**
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
6. **Complete checkout** - You'll be redirected to Stripe's checkout page
7. **Verify redirect** - After payment, you should return to `/dashboard?payment=success`
8. **Check subscription status** - Your dashboard should show your active plan
9. **Verify in Stripe Dashboard** - Check that the subscription was created under Customers

**What to verify:**
- ✅ Checkout session opens in new tab
- ✅ Payment processes successfully
- ✅ Webhook receives `checkout.session.completed` event
- ✅ Subscription record created in database
- ✅ User can access tier-appropriate features

---

### 3. Publish Your Website

**Why:** Make your platform accessible to real users on your custom domain.

**Steps:**

1. **In Manus Management UI**, click the **"Publish"** button (top-right)
2. **Choose your domain:**
   - Use the auto-generated `upsurgeiq.manus.space` domain, OR
   - Bind your custom domain `upsurgeiq.com`
3. **If using custom domain (upsurgeiq.com):**
   - Go to Cloudflare DNS settings
   - Update your A records to point to the Manus IP address (provided after publish)
   - Wait for DNS propagation (usually 5-15 minutes)
4. **Enable SSL** - Manus automatically provisions SSL certificates
5. **Test the live site** - Visit `https://upsurgeiq.com` and verify it loads

**After publishing:**
- Update your Stripe webhook URL to use the production domain
- Test the payment flow again on the live site

---

### 4. Set Up WordPress Integration (Optional)

**Why:** Sync your press releases and business profiles to WordPress for SEO and content management.

**Prerequisites:**
- WordPress site with ACF Pro plugin installed
- Application Password generated in WordPress

**Steps:**

1. **Install ACF Pro on your WordPress site**
   - Purchase from [advancedcustomfields.com](https://www.advancedcustomfields.com/pro/)
   - Upload and activate the plugin

2. **Create ACF Field Groups** in WordPress Admin:

   **Business Profile Fields** (Post Type: Post, Category: Business Profiles):
   - `company_name` (Text)
   - `industry` (Text)
   - `sic_code` (Text)
   - `website_url` (URL)
   - `brand_voice` (Text)
   - `brand_tone` (Text)
   - `target_audience` (Textarea)
   - `key_messages` (Textarea)

   **Press Release Fields** (Post Type: Post, Category: Press Releases):
   - `headline` (Text)
   - `subheadline` (Text)
   - `body_content` (Wysiwyg Editor)
   - `contact_name` (Text)
   - `contact_email` (Email)
   - `contact_phone` (Text)
   - `release_date` (Date Picker)

3. **Generate Application Password in WordPress:**
   - Go to Users → Your Profile
   - Scroll to "Application Passwords"
   - Enter name: "upsurgeIQ Integration"
   - Click "Add New Application Password"
   - Copy the generated password (format: `xxxx xxxx xxxx xxxx xxxx xxxx`)

4. **Configure in upsurgeIQ:**
   - Navigate to `/wordpress-settings` in your platform
   - Enter your WordPress site URL (e.g., `https://yourblog.com`)
   - Enter your WordPress username
   - Paste the Application Password
   - Click "Test Connection"
   - Click "Save Settings"

5. **Test the integration:**
   - Create a press release in upsurgeIQ
   - Check that it appears in your WordPress site

---

### 5. Configure Social Media OAuth (Coming Soon)

**Status:** The database and UI are ready, but OAuth flows need to be implemented.

**What you'll need when ready:**
- Facebook App ID and Secret
- Instagram Business Account
- LinkedIn App credentials
- X (Twitter) API keys

**Current workaround:**
- Users can manually copy content from upsurgeIQ and post to social platforms
- Scheduled posts are saved in the database for reference

---

### 6. Set Up Monitoring and Alerts

**Why:** Get notified when things go wrong so you can fix them quickly.

**Recommended tools:**

1. **Stripe Dashboard Notifications:**
   - Go to Settings → Notifications
   - Enable email alerts for:
     - Failed payments
     - Successful payments
     - Disputes
     - Subscription changes

2. **Database Monitoring:**
   - Check the Database panel in Manus Management UI regularly
   - Monitor table sizes and query performance

3. **Error Tracking (Optional):**
   - Consider integrating Sentry for error tracking
   - Add to `server/_core/index.ts` for backend errors
   - Add to `client/src/main.tsx` for frontend errors

---

### 7. Create Your First Admin Account

**Why:** You need admin access to manage partners and access admin-only features.

**Steps:**

1. **Sign in to the platform** with your personal account
2. **Open the Database panel** in Manus Management UI
3. **Find the `users` table** and locate your user record
4. **Edit your user record:**
   - Change `role` from `user` to `admin`
   - Save changes
5. **Refresh the dashboard** - You should now see admin features like Partner Management

**Admin features you'll have access to:**
- Partner Management (`/partners`)
- White-label partnership portal
- Commission tracking
- All user data and analytics

---

### 8. Prepare Marketing Materials

**Why:** You need content to attract and onboard your first customers.

**Recommended materials:**

1. **Landing Page Content:**
   - The homepage is already designed with your brand
   - Consider adding customer testimonials (when available)
   - Add case studies or success stories

2. **Help Documentation:**
   - Create a help center at `help.upsurgeiq.com` (separate WordPress site)
   - Document common workflows:
     - How to create a press release
     - How to schedule social media posts
     - How to manage media lists
     - How to use the AI assistant

3. **Email Templates:**
   - Welcome email for new signups
   - Payment confirmation emails
   - Subscription renewal reminders
   - Feature announcement emails

4. **Social Media Assets:**
   - Create branded graphics for social sharing
   - Prepare launch announcement posts
   - Design promotional materials for each pricing tier

---

## 🧪 Testing Checklist

Before launching to real customers, test these critical flows:

### Authentication Flow
- [ ] User can sign in with Manus OAuth
- [ ] User is redirected to dashboard after login
- [ ] User can log out successfully
- [ ] Session persists across page refreshes

### Subscription Flow
- [ ] User can view pricing tiers on `/subscribe`
- [ ] Clicking "Get Started" opens Stripe checkout
- [ ] Test card payment completes successfully
- [ ] Webhook creates subscription in database
- [ ] User is redirected to dashboard with success message
- [ ] Dashboard shows correct subscription tier
- [ ] User can access tier-appropriate features

### Onboarding Flow
- [ ] New user is redirected to `/onboarding`
- [ ] User can complete all onboarding steps
- [ ] Business dossier is saved to database
- [ ] User is redirected to dashboard after completion

### Press Release Creation
- [ ] User can navigate to `/press-releases/new`
- [ ] AI generates content based on business dossier
- [ ] User can edit generated content
- [ ] Press release saves successfully
- [ ] Press release appears in `/press-releases` list

### Social Media Distribution
- [ ] User can create social media posts
- [ ] Platform-specific content can be customized
- [ ] Posts can be scheduled for future dates
- [ ] Posts save successfully to database

### Media Lists
- [ ] User can view default media lists
- [ ] User can create custom media lists
- [ ] Media lists display correctly

### AI Assistant (Pro/Scale only)
- [ ] Pro/Scale users can access `/ai-assistant`
- [ ] Starter users see upgrade prompt
- [ ] Chat interface works correctly
- [ ] AI responses use business context

### Campaign Lab (Scale only)
- [ ] Scale users can access `/campaign-lab`
- [ ] Pro/Starter users see upgrade prompt
- [ ] Campaigns can be created with variants
- [ ] Budget tracking displays correctly

### Partner Management (Admin only)
- [ ] Admin users can access `/partners`
- [ ] Non-admin users see access denied
- [ ] Partners can be created and managed
- [ ] Commission tracking displays correctly

---

## 📊 Post-Launch Monitoring

After launching, monitor these metrics:

### Business Metrics
- **Signups:** Track new user registrations
- **Conversions:** Monitor free → paid conversion rate
- **Churn:** Track subscription cancellations
- **MRR (Monthly Recurring Revenue):** Sum of all active subscriptions
- **ARPU (Average Revenue Per User):** MRR / Active Users

### Technical Metrics
- **Uptime:** Server availability percentage
- **Response Time:** Average API response time
- **Error Rate:** Failed requests / Total requests
- **Database Size:** Monitor storage usage

### User Engagement
- **Press Releases Created:** Total and per user
- **Social Posts Scheduled:** Total and per user
- **AI Assistant Usage:** Messages sent (Pro/Scale)
- **Campaign Lab Usage:** Campaigns created (Scale)

---

## 🆘 Troubleshooting

### Stripe Checkout Not Opening
**Symptoms:** Clicking "Get Started" does nothing or shows error

**Solutions:**
1. Check browser console for errors
2. Verify Stripe Price IDs are correct in `server/products.ts`
3. Ensure `STRIPE_SECRET_KEY` environment variable is set
4. Check that user is authenticated

### Webhook Not Receiving Events
**Symptoms:** Payment succeeds but subscription not created

**Solutions:**
1. Verify webhook URL is correct in Stripe Dashboard
2. Check webhook signing secret matches `STRIPE_WEBHOOK_SECRET`
3. Test webhook using Stripe Dashboard "Send test webhook"
4. Check server logs for webhook errors

### User Can't Access Paid Features
**Symptoms:** User paid but still sees "Upgrade" prompts

**Solutions:**
1. Check `subscriptions` table in database
2. Verify subscription status is "active"
3. Check that subscription tier matches expected tier
4. Refresh user session (log out and log back in)

### Database Connection Errors
**Symptoms:** "Database not available" errors

**Solutions:**
1. Check `DATABASE_URL` environment variable is set
2. Verify database server is running
3. Test connection using Database panel in Management UI
4. Check database credentials are correct

---

## 📞 Support

If you encounter issues not covered in this guide:

1. **Check the logs** in the Management UI → Dashboard panel
2. **Review the test suite** - Run `pnpm test` to verify core functionality
3. **Consult the README** - See `README.md` for technical details
4. **Contact Manus support** - Visit [help.manus.im](https://help.manus.im)

---

## 🎉 You're Ready to Launch!

Once you've completed the required actions above, your upsurgeIQ platform is ready for production use. Good luck with your launch!

**Next steps after launch:**
1. Monitor signups and conversions
2. Gather user feedback
3. Iterate on features based on usage data
4. Expand marketing efforts
5. Consider adding social media OAuth integrations
6. Build out the help center and documentation

---

**upsurgeIQ** - Intelligence That Drives Growth 🚀
