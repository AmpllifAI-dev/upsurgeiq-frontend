# Ad Platform OAuth Setup Guide for Christopher

**Created:** December 26, 2025  
**Purpose:** Step-by-step instructions for configuring Facebook and LinkedIn OAuth credentials for the Intelligent Campaign Lab ad deployment feature.

---

## Overview

This guide provides detailed instructions for Christopher to set up OAuth applications on Facebook and LinkedIn platforms. These credentials are required for the ad deployment functionality in the Intelligent Campaign Lab.

**Important Notes:**
- Both platforms require business verification (2-4 weeks approval time)
- You must have admin access to Facebook Business Manager and LinkedIn Company Page
- OAuth apps must be created by the business owner (Christopher)
- Testing can only be completed after OAuth credentials are configured

---

## Part 1: Facebook Ads OAuth Setup

### Prerequisites Checklist
- ✅ Facebook Business Manager account with admin access
- ✅ Facebook Developer account (same account as Business Manager)
- ✅ Facebook Ad Account created and active
- ✅ Facebook Business Page created

### Step 1: Create Facebook Developer App

1. **Navigate to Facebook for Developers**
   - Go to: https://developers.facebook.com/
   - Click **"My Apps"** in the top-right corner
   - Click **"Create App"** button

2. **Select App Type**
   - Choose **"Business"** as the app type
   - Click **"Next"**

3. **Fill in App Details**
   ```
   App Name: UpsurgeIQ Campaign Manager
   App Contact Email: christopher@upsurgeiq.com
   Business Account: [Select your Facebook Business Manager account]
   ```
   - Click **"Create App"**
   - Complete security check if prompted

4. **Verify App Creation**
   - You should see your new app dashboard
   - Note your **App ID** (top-left corner) - you'll need this later

### Step 2: Add Marketing API Product

1. **Add Marketing API**
   - In your app dashboard, scroll to **"Add Products to Your App"**
   - Find **"Marketing API"** card
   - Click **"Set Up"** button

2. **Complete Marketing API Setup**
   - Follow the setup wizard
   - Accept terms and conditions
   - Marketing API should now appear in your left sidebar under "Products"

### Step 3: Configure App Settings

1. **Basic Settings**
   - Click **"Settings"** → **"Basic"** in left sidebar
   - Fill in required fields:
     ```
     App Domains: upsurgeiq.com
     Privacy Policy URL: https://upsurgeiq.com/privacy
     Terms of Service URL: https://upsurgeiq.com/terms
     ```
   - Click **"Save Changes"** at bottom

2. **Add App Icon** (Optional but Recommended)
   - Upload a 1024x1024 PNG logo
   - This appears during OAuth authorization

3. **Note Your Credentials**
   - Copy and save these values (you'll need them later):
     ```
     App ID: [Your App ID]
     App Secret: [Click "Show" to reveal, then copy]
     ```

### Step 4: Configure OAuth Settings

1. **Add OAuth Redirect URIs**
   - Click **"Facebook Login"** → **"Settings"** in left sidebar
   - Under **"Valid OAuth Redirect URIs"**, add:
     ```
     https://upsurgeiq.com/api/oauth/facebook/callback
     https://app.upsurgeiq.com/api/oauth/facebook/callback
     ```
   - If testing on staging:
     ```
     https://staging.upsurgeiq.com/api/oauth/facebook/callback
     ```
   - Click **"Save Changes"**

2. **Enable Client OAuth Login**
   - Toggle **"Client OAuth Login"** to **ON**
   - Toggle **"Web OAuth Login"** to **ON**

### Step 5: Request Advanced Access (CRITICAL)

1. **Navigate to App Review**
   - Click **"App Review"** → **"Permissions and Features"** in left sidebar

2. **Request These Permissions:**
   - `ads_management` - Create and manage ads
   - `ads_read` - Read ad account data
   - `business_management` - Access Business Manager
   - `pages_read_engagement` - Read page engagement
   - `pages_manage_ads` - Manage ads for pages

3. **For Each Permission:**
   - Click **"Request Advanced Access"**
   - Fill out the questionnaire explaining your use case:
     ```
     Use Case: Intelligent Campaign Lab for PR and marketing agencies
     Description: Allow clients to create and manage Facebook ad campaigns 
     directly from UpsurgeIQ platform. Agencies can deploy A/B tested ad 
     variations and monitor performance in real-time.
     ```
   - Provide screenshots of your app interface (Campaign Lab)
   - Submit for review

4. **Approval Timeline**
   - Standard permissions: Instant approval
   - Advanced access: 3-7 business days
   - Check status in **"App Review"** → **"Requests"**

### Step 6: Get Long-Lived Access Token

**Option A: Using Graph API Explorer (Recommended for Testing)**

1. Go to: https://developers.facebook.com/tools/explorer/
2. Select your app from dropdown (top-right)
3. Click **"Generate Access Token"**
4. Grant all requested permissions
5. Copy the short-lived token
6. Convert to long-lived token using this command:

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token" \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=YOUR_APP_ID" \
  -d "client_secret=YOUR_APP_SECRET" \
  -d "fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

**Response:**
```json
{
  "access_token": "LONG_LIVED_TOKEN_HERE",
  "token_type": "bearer",
  "expires_in": 5183944
}
```

**Option B: OAuth Flow (Production Method)**
- Users will authenticate through the OAuth flow in the app
- Tokens are automatically stored in the database
- This is the recommended production approach

### Step 7: Find Your Ad Account ID

1. Go to: https://business.facebook.com/
2. Click **"Business Settings"** (gear icon, bottom-left)
3. Navigate to **"Accounts"** → **"Ad Accounts"**
4. Click on your ad account
5. Copy the **Ad Account ID** (format: `act_XXXXXXXXXX`)

### Step 8: Add Credentials to UpsurgeIQ

**Environment Variables to Add:**

```bash
# Facebook OAuth Credentials
FACEBOOK_CLIENT_ID=your_app_id_here
FACEBOOK_CLIENT_SECRET=your_app_secret_here

# Optional: For server-to-server API calls (if not using OAuth flow)
FACEBOOK_ACCESS_TOKEN=your_long_lived_token_here
FACEBOOK_AD_ACCOUNT_ID=act_XXXXXXXXXX
```

**How to Add:**
1. Contact your DevOps team or
2. Add to `.env` file in production environment
3. Restart the application after adding

### Step 9: Switch to Live Mode

1. **App Review Status**
   - Ensure all requested permissions are approved
   - Check **"App Review"** → **"Requests"** for status

2. **Switch to Live Mode**
   - Go to **"Settings"** → **"Basic"**
   - Scroll to top of page
   - Toggle **"App Mode"** from **"Development"** to **"Live"**
   - Confirm the switch

3. **Verification**
   - App status should show **"Live"** (green indicator)
   - Now available for public use

---

## Part 2: LinkedIn Ads OAuth Setup

### Prerequisites Checklist
- ✅ LinkedIn Company Page with admin access
- ✅ LinkedIn Campaign Manager account
- ✅ LinkedIn Developer account
- ✅ Active LinkedIn Ad Account

### Step 1: Create LinkedIn Developer App

1. **Navigate to LinkedIn Developers**
   - Go to: https://www.linkedin.com/developers/
   - Sign in with your LinkedIn account
   - Click **"Create app"** button

2. **Fill in App Details**
   ```
   App name: UpsurgeIQ Campaign Manager
   LinkedIn Page: [Select your company page]
   Privacy policy URL: https://upsurgeiq.com/privacy
   App logo: [Upload 100x100 PNG logo]
   Legal agreement: [Check the box]
   ```
   - Click **"Create app"**

3. **Verify App Creation**
   - You should see your app dashboard
   - App status will be **"In development"**

### Step 2: Request Advertising API Access

1. **Navigate to Products Tab**
   - Click **"Products"** tab in your app dashboard

2. **Request Advertising API**
   - Find **"Advertising API"** product
   - Click **"Request access"** button

3. **Fill Out Application Form**
   ```
   Company Name: UpsurgeIQ
   Company Website: https://upsurgeiq.com
   Use Case: Intelligent Campaign Lab for PR and marketing agencies
   
   Detailed Description:
   UpsurgeIQ provides an Intelligent Campaign Lab that allows PR and 
   marketing agencies to create, manage, and optimize LinkedIn ad campaigns 
   on behalf of their clients. The platform enables:
   - Programmatic campaign creation with A/B testing
   - Real-time performance monitoring and analytics
   - Automated budget optimization
   - Multi-client campaign management
   
   Expected API Usage:
   - Campaign creation and management
   - Ad creative deployment
   - Performance analytics retrieval
   - Audience targeting configuration
   ```

4. **Provide Additional Information**
   - Upload screenshots of Campaign Lab interface
   - Provide demo video if available
   - Add any relevant documentation

5. **Submit Application**
   - Click **"Submit"**
   - **Approval Timeline:** 1-2 weeks (sometimes up to 4 weeks)
   - You'll receive email notification when approved

### Step 3: Configure OAuth Settings (After Approval)

1. **Navigate to Auth Tab**
   - Click **"Auth"** tab in your app dashboard

2. **Note Your Credentials**
   - Copy and save these values:
     ```
     Client ID: [Your Client ID]
     Client Secret: [Click "Show" to reveal, then copy]
     ```

3. **Add Redirect URLs**
   - Under **"OAuth 2.0 settings"** section
   - Click **"Add redirect URL"**
   - Add these URLs:
     ```
     https://upsurgeiq.com/api/oauth/linkedin/callback
     https://app.upsurgeiq.com/api/oauth/linkedin/callback
     ```
   - If testing on staging:
     ```
     https://staging.upsurgeiq.com/api/oauth/linkedin/callback
     ```
   - Click **"Update"**

### Step 4: Configure OAuth Scopes

1. **Required Scopes for Advertising API:**
   - `r_ads` - Read advertising account data
   - `r_ads_reporting` - Read advertising analytics
   - `rw_ads` - Create and manage ads
   - `w_organization_social` - Post on behalf of organization

2. **Verify Scopes**
   - Go to **"Products"** tab
   - Click **"Advertising API"**
   - Ensure all required scopes are listed under **"OAuth 2.0 scopes"**

### Step 5: Find Your LinkedIn Ad Account ID

**Method 1: Using LinkedIn Campaign Manager**
1. Go to: https://www.linkedin.com/campaignmanager/
2. Select your ad account from dropdown
3. Look at the URL: `https://www.linkedin.com/campaignmanager/accounts/{ACCOUNT_ID}/`
4. Copy the account ID number

**Method 2: Using API (After OAuth Setup)**
```bash
curl -X GET "https://api.linkedin.com/v2/adAccountsV2?q=search" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "X-Restli-Protocol-Version: 2.0.0"
```

Response will include:
```json
{
  "elements": [
    {
      "id": 123456789,
      "name": "Your Ad Account Name",
      "type": "BUSINESS",
      "status": "ACTIVE"
    }
  ]
}
```

The ad account URN format: `urn:li:sponsoredAccount:123456789`

### Step 6: Add Credentials to UpsurgeIQ

**Environment Variables to Add:**

```bash
# LinkedIn OAuth Credentials
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here

# Optional: For server-to-server API calls (if not using OAuth flow)
LINKEDIN_ACCESS_TOKEN=your_access_token_here
LINKEDIN_AD_ACCOUNT_ID=urn:li:sponsoredAccount:123456789
```

**How to Add:**
1. Contact your DevOps team or
2. Add to `.env` file in production environment
3. Restart the application after adding

### Step 7: Verify App Status

1. **Check Product Status**
   - Go to **"Products"** tab
   - **"Advertising API"** should show **"Approved"** status
   - If still pending, wait for LinkedIn approval email

2. **Test API Access**
   - Once approved, test with a simple API call:
   ```bash
   curl -X GET "https://api.linkedin.com/v2/me" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

---

## Part 3: Testing Procedures

### Prerequisites for Testing
- ✅ Facebook OAuth credentials configured
- ✅ LinkedIn OAuth credentials configured
- ✅ UpsurgeIQ application restarted with new environment variables
- ✅ Test user account with access to both platforms

### Test 1: OAuth Connection Flow

**Facebook Connection Test:**

1. **Initiate Connection**
   - Log into UpsurgeIQ as a test user
   - Navigate to: **Campaign Lab** → **Settings** → **Ad Platforms**
   - Click **"Connect Facebook"** button

2. **Verify Authorization Screen**
   - Should redirect to Facebook OAuth page
   - App name should display: **"UpsurgeIQ Campaign Manager"**
   - Requested permissions should be listed
   - Click **"Continue"** or **"Authorize"**

3. **Verify Callback**
   - Should redirect back to UpsurgeIQ
   - URL should be: `https://upsurgeiq.com/api/oauth/facebook/callback?code=...&state=...`
   - Should see success message: **"Facebook account connected successfully"**

4. **Verify Database Storage**
   - Check `social_media_accounts` table
   - Should see new row with:
     - `platform`: "facebook"
     - `accountId`: Facebook user/page ID
     - `accessToken`: Encrypted token
     - `isConnected`: 1

5. **Verify UI Update**
   - Facebook connection status should show **"Connected"**
   - Account name should be displayed
   - **"Disconnect"** button should be available

**LinkedIn Connection Test:**

1. **Initiate Connection**
   - Click **"Connect LinkedIn"** button in same settings page

2. **Verify Authorization Screen**
   - Should redirect to LinkedIn OAuth page
   - App name: **"UpsurgeIQ Campaign Manager"**
   - Requested permissions listed
   - Click **"Allow"**

3. **Verify Callback**
   - Should redirect to: `https://upsurgeiq.com/api/oauth/linkedin/callback?code=...&state=...`
   - Success message: **"LinkedIn account connected successfully"**

4. **Verify Database & UI**
   - Same checks as Facebook test above
   - Platform should be "linkedin"

### Test 2: Token Exchange Verification

**Test Access Token Validity:**

```bash
# Facebook Token Test
curl -X GET "https://graph.facebook.com/v18.0/me?access_token=USER_ACCESS_TOKEN"

# Expected Response:
{
  "id": "USER_ID",
  "name": "User Name"
}

# LinkedIn Token Test
curl -X GET "https://api.linkedin.com/v2/me" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN"

# Expected Response:
{
  "id": "USER_ID",
  "localizedFirstName": "First",
  "localizedLastName": "Last"
}
```

**Test Token Refresh (if applicable):**

1. Wait for token to expire (or manually set expiry in database)
2. Make an API call that requires authentication
3. Verify automatic token refresh occurs
4. Check logs for refresh token exchange
5. Verify new token is stored in database

### Test 3: Ad Deployment Functionality

**Facebook Ad Creation Test:**

1. **Create Campaign in Campaign Lab**
   - Navigate to **Campaign Lab** → **Create Campaign**
   - Fill in campaign details:
     ```
     Campaign Name: Test Facebook Campaign
     Objective: Traffic
     Budget: $50/day
     Target Audience: United States, Age 25-65
     ```

2. **Add Ad Creative**
   - Upload test image (1200x628 recommended)
   - Add headline: "Test Ad Headline"
   - Add description: "Test ad description for verification"
   - Add destination URL: "https://upsurgeiq.com"

3. **Select Facebook as Platform**
   - Check **"Deploy to Facebook"** checkbox
   - Select connected Facebook account
   - Choose ad account from dropdown

4. **Deploy Campaign**
   - Click **"Deploy Campaign"** button
   - Should see loading indicator
   - Should receive success notification

5. **Verify in Facebook Ads Manager**
   - Go to: https://business.facebook.com/adsmanager
   - Find the newly created campaign
   - Verify campaign details match:
     - Campaign name
     - Budget
     - Status (should be "Paused" initially)
     - Ad creative

6. **Verify in UpsurgeIQ Database**
   - Check `ad_platform_campaigns` table (if exists)
   - Should see mapping between internal campaign ID and Facebook campaign ID

**LinkedIn Ad Creation Test:**

1. **Create Campaign**
   - Similar steps as Facebook test
   - Campaign objective: "Website Visits"
   - Budget: $30/day

2. **Deploy to LinkedIn**
   - Select LinkedIn as platform
   - Choose connected account
   - Deploy campaign

3. **Verify in LinkedIn Campaign Manager**
   - Go to: https://www.linkedin.com/campaignmanager/
   - Find newly created campaign
   - Verify all details match

### Test 4: Error Handling & Edge Cases

**Test Invalid Token:**

1. Manually expire or invalidate access token in database
2. Attempt to create ad campaign
3. **Expected:** Error message: "Authentication expired. Please reconnect your account."
4. **Expected:** UI prompts user to reconnect

**Test Missing Permissions:**

1. Revoke one required permission from Facebook/LinkedIn app
2. Attempt to create campaign
3. **Expected:** Clear error message indicating missing permission
4. **Expected:** Link to reconnect with proper permissions

**Test API Rate Limiting:**

1. Make multiple rapid API calls (if possible in test environment)
2. **Expected:** Graceful handling with retry logic
3. **Expected:** User sees "Processing..." message, not error

**Test Network Failure:**

1. Simulate network timeout (disconnect internet briefly during API call)
2. **Expected:** Retry mechanism kicks in
3. **Expected:** User sees "Retrying..." message
4. **Expected:** Eventually fails gracefully with clear error

**Test Account Disconnection:**

1. Click **"Disconnect"** button for connected account
2. **Expected:** Confirmation dialog appears
3. Confirm disconnection
4. **Expected:** Account removed from database
5. **Expected:** UI updates to show "Not connected" status
6. **Expected:** Cannot deploy ads to that platform anymore

### Test 5: Analytics & Reporting

**Test Performance Data Sync:**

1. **Create and Deploy Test Campaign**
   - Deploy a small test campaign ($5 budget)
   - Let it run for 24 hours

2. **Verify Analytics Sync**
   - Navigate to Campaign Lab dashboard
   - Find the test campaign
   - Click to view analytics

3. **Expected Metrics Displayed:**
   - Impressions
   - Clicks
   - CTR (Click-through rate)
   - CPC (Cost per click)
   - Total spend
   - Conversions (if tracking pixel installed)

4. **Verify Data Accuracy**
   - Compare metrics in UpsurgeIQ with Facebook Ads Manager
   - Numbers should match (allow for slight delay in sync)

5. **Test Real-Time Updates**
   - Refresh dashboard
   - Metrics should update (if sync is real-time)
   - Check last sync timestamp

---

## Part 4: Troubleshooting Guide

### Common Issues & Solutions

#### Issue 1: "Invalid OAuth Redirect URI"

**Symptoms:**
- Error during OAuth callback
- Message: "redirect_uri_mismatch" or similar

**Solution:**
1. Verify redirect URI in platform settings matches exactly:
   - Facebook: App Dashboard → Facebook Login → Settings
   - LinkedIn: App Dashboard → Auth → Redirect URLs
2. Check for trailing slashes (should NOT have trailing slash)
3. Ensure HTTPS is used (not HTTP)
4. Verify domain matches production domain

#### Issue 2: "Insufficient Permissions"

**Symptoms:**
- OAuth succeeds but API calls fail
- Error: "Insufficient privileges" or "Permission denied"

**Solution:**
1. **Facebook:** Check App Review → Permissions and Features
   - Ensure all required permissions have "Advanced Access"
   - Re-request if needed
2. **LinkedIn:** Check Products → Advertising API
   - Ensure product is approved
   - Verify all required scopes are enabled

#### Issue 3: "Token Expired"

**Symptoms:**
- API calls fail with "Invalid or expired token"
- User sees "Authentication expired" message

**Solution:**
1. Implement token refresh logic (should be automatic)
2. Check refresh token is stored in database
3. Verify refresh token endpoint is called before expiry
4. If refresh fails, prompt user to reconnect

#### Issue 4: "App Not Approved"

**Symptoms:**
- OAuth works but API calls return "App not approved for this endpoint"

**Solution:**
1. **Facebook:** Ensure app is in "Live" mode (not Development)
2. **LinkedIn:** Wait for Advertising API approval (check email)
3. Verify all required products/permissions are approved
4. Check app status in developer dashboard

#### Issue 5: "Rate Limit Exceeded"

**Symptoms:**
- API calls fail with "Rate limit exceeded" error
- Happens after multiple rapid requests

**Solution:**
1. Implement exponential backoff retry logic
2. Cache API responses when possible
3. Batch requests where supported
4. Monitor API usage in platform dashboards
5. Request rate limit increase if needed (for production)

#### Issue 6: Database Connection Issues

**Symptoms:**
- OAuth callback fails to store tokens
- Error: "Database not available"

**Solution:**
1. Check database connection in `server/db.ts`
2. Verify connection pool is not exhausted
3. Check database credentials in environment variables
4. Review connection retry logic

---

## Part 5: Security Best Practices

### Token Storage

1. **Encrypt Tokens at Rest**
   - Use AES-256 encryption for access tokens in database
   - Store encryption key in secure environment variable
   - Never log tokens in plain text

2. **Secure Token Transmission**
   - Always use HTTPS for OAuth callbacks
   - Validate state parameter to prevent CSRF
   - Use secure session cookies

### Access Control

1. **Limit Token Scope**
   - Request only necessary permissions
   - Use least-privilege principle
   - Regularly audit permission usage

2. **Token Rotation**
   - Implement automatic token refresh
   - Rotate tokens before expiry
   - Revoke old tokens after refresh

### Monitoring & Auditing

1. **Log OAuth Events**
   - Log all OAuth authorizations
   - Log token refresh attempts
   - Log API call failures
   - Monitor for suspicious activity

2. **Alert on Anomalies**
   - Alert on multiple failed OAuth attempts
   - Alert on unusual API usage patterns
   - Alert on token refresh failures

---

## Part 6: Production Deployment Checklist

### Pre-Deployment

- [ ] Facebook app approved and in "Live" mode
- [ ] LinkedIn Advertising API approved
- [ ] All environment variables configured in production
- [ ] Database schema includes `social_media_accounts` table
- [ ] OAuth callback routes deployed and accessible
- [ ] SSL certificate valid for production domain
- [ ] Rate limiting implemented
- [ ] Error handling tested thoroughly
- [ ] Token encryption enabled
- [ ] Logging configured for OAuth events

### Post-Deployment

- [ ] Test OAuth flow with real user account
- [ ] Verify tokens stored correctly in database
- [ ] Test ad creation on both platforms
- [ ] Verify analytics sync working
- [ ] Monitor error logs for first 24 hours
- [ ] Check API rate limit usage
- [ ] Verify webhook handlers (if applicable)
- [ ] Test token refresh mechanism
- [ ] Confirm disconnect functionality works

### Monitoring

- [ ] Set up alerts for OAuth failures
- [ ] Monitor API error rates
- [ ] Track token refresh success rate
- [ ] Monitor database connection pool
- [ ] Set up uptime monitoring for OAuth callbacks
- [ ] Track user adoption of ad platform connections

---

## Part 7: Support Resources

### Facebook Resources
- **Developer Documentation:** https://developers.facebook.com/docs/marketing-apis
- **API Reference:** https://developers.facebook.com/docs/marketing-api/reference
- **Support:** https://developers.facebook.com/support/bugs/
- **Status Page:** https://developers.facebook.com/status/

### LinkedIn Resources
- **Developer Documentation:** https://learn.microsoft.com/en-us/linkedin/marketing/
- **API Reference:** https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/advertising-api
- **Support:** https://www.linkedin.com/help/linkedin/ask/api
- **Status Page:** https://www.linkedin-apistatus.com/

### UpsurgeIQ Internal
- **Codebase:** `/workspace/upsurgeiq-frontend`
- **OAuth Implementation:** `server/socialMediaOAuth.ts`
- **Database Schema:** `drizzle/schema.ts` (socialMediaAccounts table)
- **Frontend Component:** `client/src/components/SocialMediaConnections.tsx`

---

## Next Steps for Christopher

1. **Immediate Actions (Week 1):**
   - [ ] Create Facebook Developer app
   - [ ] Create LinkedIn Developer app
   - [ ] Submit Advertising API access requests
   - [ ] Configure OAuth redirect URIs

2. **While Waiting for Approval (Weeks 1-4):**
   - [ ] Set up test Facebook ad account
   - [ ] Set up test LinkedIn ad account
   - [ ] Review and understand OAuth flow code
   - [ ] Prepare test campaigns for deployment testing

3. **After Approval (Week 4+):**
   - [ ] Add credentials to production environment
   - [ ] Run all tests from Part 3 of this guide
   - [ ] Deploy to staging environment first
   - [ ] Test with real user accounts
   - [ ] Deploy to production
   - [ ] Monitor for 48 hours

4. **Ongoing:**
   - [ ] Monitor API usage and costs
   - [ ] Review error logs weekly
   - [ ] Update documentation as needed
   - [ ] Request rate limit increases if needed

---

**Questions or Issues?**

Contact the development team or refer to:
- This guide: `/workspace/upsurgeiq-frontend/docs/AD_PLATFORM_OAUTH_SETUP_GUIDE.md`
- API Setup Guide: `/workspace/upsurgeiq-frontend/SOCIAL_MEDIA_ADS_API_SETUP.md`
- OAuth Implementation: `/workspace/upsurgeiq-frontend/server/socialMediaOAuth.ts`

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Author:** Alex (Engineer)