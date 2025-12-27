# Ad Platform OAuth Testing Procedures

**Purpose:** Comprehensive testing checklist for Facebook and LinkedIn OAuth integration  
**Audience:** QA Team, Developers, Christopher  
**Prerequisites:** OAuth credentials configured per AD_PLATFORM_OAUTH_SETUP_GUIDE.md

---

## Test Environment Setup

### Required Accounts
- [ ] UpsurgeIQ test user account
- [ ] Facebook test account with ad account access
- [ ] LinkedIn test account with Campaign Manager access
- [ ] Access to production/staging database
- [ ] Access to application logs

### Required Tools
- [ ] Browser with developer tools (Chrome/Firefox)
- [ ] Postman or curl for API testing
- [ ] Database client (MySQL Workbench, TablePlus, etc.)
- [ ] Log monitoring tool (Datadog, CloudWatch, etc.)

---

## Test Suite 1: OAuth Connection Flow

### Test 1.1: Facebook OAuth Initiation

**Test ID:** FB-OAUTH-001  
**Priority:** Critical  
**Estimated Time:** 5 minutes

**Steps:**
1. Log into UpsurgeIQ as test user
2. Navigate to: Campaign Lab → Settings → Ad Platforms
3. Click "Connect Facebook" button

**Expected Results:**
- ✅ Redirects to Facebook OAuth page
- ✅ URL contains: `https://www.facebook.com/v18.0/dialog/oauth`
- ✅ URL parameters include:
  - `client_id` (Facebook App ID)
  - `redirect_uri` (matches configured callback URL)
  - `scope` (includes required permissions)
  - `state` (CSRF protection token)
- ✅ Facebook page displays: "UpsurgeIQ Campaign Manager wants to access your Facebook account"
- ✅ Requested permissions are listed correctly

**Pass Criteria:**
- All expected results met
- No console errors
- State parameter is unique and secure

**Failure Actions:**
- Check `FACEBOOK_CLIENT_ID` environment variable
- Verify redirect URI in Facebook app settings
- Check browser console for errors
- Review `server/socialOAuth.ts` configuration

---

### Test 1.2: Facebook OAuth Authorization

**Test ID:** FB-OAUTH-002  
**Priority:** Critical  
**Estimated Time:** 3 minutes

**Steps:**
1. Continue from Test 1.1
2. Click "Continue" or "Authorize" on Facebook OAuth page
3. Grant all requested permissions

**Expected Results:**
- ✅ Redirects to: `https://upsurgeiq.com/api/oauth/facebook/callback`
- ✅ URL contains `code` parameter (authorization code)
- ✅ URL contains `state` parameter (matches original state)
- ✅ Page shows loading indicator
- ✅ Success message appears: "Facebook account connected successfully"
- ✅ Redirects to Ad Platforms settings page

**Pass Criteria:**
- Callback URL receives authorization code
- State validation passes
- No error messages displayed

**Failure Actions:**
- Check callback route in `server/oauthRoutes.ts`
- Verify state token validation logic
- Check server logs for errors
- Ensure database connection is active

---

### Test 1.3: Facebook Token Exchange

**Test ID:** FB-OAUTH-003  
**Priority:** Critical  
**Estimated Time:** 5 minutes

**Steps:**
1. Continue from Test 1.2
2. Open database client
3. Query `social_media_accounts` table:
   ```sql
   SELECT * FROM social_media_accounts 
   WHERE platform = 'facebook' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

**Expected Results:**
- ✅ New row exists in database
- ✅ Fields populated correctly:
  - `businessId`: Matches test user's business
  - `platform`: "facebook"
  - `accountId`: Facebook user/page ID
  - `accountName`: Facebook account name
  - `accessToken`: Encrypted token (not plain text)
  - `refreshToken`: Encrypted refresh token (if applicable)
  - `tokenExpiry`: Future timestamp
  - `isConnected`: 1
  - `createdAt`: Current timestamp

**Pass Criteria:**
- All fields populated correctly
- Token is encrypted
- Token expiry is in the future

**Failure Actions:**
- Check token exchange logic in `server/socialMediaOAuth.ts`
- Verify encryption is enabled
- Check database schema matches expected structure
- Review error logs for token exchange failures

---

### Test 1.4: Facebook UI Update

**Test ID:** FB-OAUTH-004  
**Priority:** High  
**Estimated Time:** 2 minutes

**Steps:**
1. Continue from Test 1.3
2. Verify Ad Platforms settings page

**Expected Results:**
- ✅ Facebook connection status shows "Connected"
- ✅ Green checkmark icon displayed
- ✅ Account name displayed (e.g., "John Doe" or "Company Page")
- ✅ "Disconnect" button is visible and enabled
- ✅ "Connect" button is hidden or disabled
- ✅ Connection timestamp displayed (e.g., "Connected 2 minutes ago")

**Pass Criteria:**
- UI accurately reflects connection status
- No stale data displayed

**Failure Actions:**
- Check frontend component: `client/src/components/SocialMediaConnections.tsx`
- Verify tRPC query is fetching latest data
- Check for caching issues
- Refresh page and re-test

---

### Test 1.5: LinkedIn OAuth Flow (Complete)

**Test ID:** LI-OAUTH-001  
**Priority:** Critical  
**Estimated Time:** 10 minutes

**Steps:**
1. On Ad Platforms settings page, click "Connect LinkedIn"
2. Authorize on LinkedIn OAuth page
3. Verify callback and token storage
4. Check UI update

**Expected Results:**
- ✅ Similar to Facebook tests (1.1-1.4)
- ✅ Platform in database: "linkedin"
- ✅ LinkedIn-specific scopes requested
- ✅ UI shows LinkedIn connection status

**Pass Criteria:**
- All steps complete successfully
- LinkedIn account connected and stored

**Failure Actions:**
- Follow same troubleshooting as Facebook tests
- Check LinkedIn-specific configuration in `server/socialOAuth.ts`
- Verify LinkedIn app credentials

---

## Test Suite 2: Token Validation & Refresh

### Test 2.1: Facebook Token Validity

**Test ID:** FB-TOKEN-001  
**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Get access token from database (decrypt if necessary)
2. Test token with Facebook API:
   ```bash
   curl -X GET "https://graph.facebook.com/v18.0/me?access_token=USER_ACCESS_TOKEN"
   ```

**Expected Results:**
- ✅ API returns 200 OK
- ✅ Response includes user data:
   ```json
   {
     "id": "USER_ID",
     "name": "User Name"
   }
   ```
- ✅ No error about invalid token

**Pass Criteria:**
- Token is valid and active
- API call succeeds

**Failure Actions:**
- Check if token has expired
- Verify token was stored correctly
- Re-authenticate user
- Check Facebook app status (ensure it's "Live")

---

### Test 2.2: LinkedIn Token Validity

**Test ID:** LI-TOKEN-001  
**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Get LinkedIn access token from database
2. Test token with LinkedIn API:
   ```bash
   curl -X GET "https://api.linkedin.com/v2/me" \
     -H "Authorization: Bearer USER_ACCESS_TOKEN"
   ```

**Expected Results:**
- ✅ API returns 200 OK
- ✅ Response includes user profile data
- ✅ No authentication errors

**Pass Criteria:**
- Token is valid
- API call succeeds

**Failure Actions:**
- Check token expiry
- Verify LinkedIn app has Advertising API access
- Re-authenticate if needed

---

### Test 2.3: Token Refresh (Facebook)

**Test ID:** FB-TOKEN-002  
**Priority:** High  
**Estimated Time:** 10 minutes

**Steps:**
1. Manually set token expiry to past date in database:
   ```sql
   UPDATE social_media_accounts 
   SET tokenExpiry = DATE_SUB(NOW(), INTERVAL 1 DAY)
   WHERE platform = 'facebook' AND id = TEST_ACCOUNT_ID;
   ```
2. Attempt to create ad campaign (triggers token refresh)
3. Monitor server logs for refresh attempt

**Expected Results:**
- ✅ System detects expired token
- ✅ Automatic refresh token exchange occurs
- ✅ New access token stored in database
- ✅ New expiry timestamp updated
- ✅ Ad campaign creation proceeds successfully
- ✅ No error shown to user

**Pass Criteria:**
- Token refresh happens automatically
- User experience is seamless

**Failure Actions:**
- Check refresh token logic in `server/socialMediaOAuth.ts`
- Verify refresh token is stored in database
- Check if refresh token itself has expired
- Prompt user to reconnect if refresh fails

---

## Test Suite 3: Ad Deployment

### Test 3.1: Facebook Campaign Creation

**Test ID:** FB-AD-001  
**Priority:** Critical  
**Estimated Time:** 15 minutes

**Steps:**
1. Navigate to Campaign Lab → Create Campaign
2. Fill in campaign details:
   - Name: "Test FB Campaign [TIMESTAMP]"
   - Objective: "Traffic"
   - Budget: $10/day
   - Duration: 7 days
   - Target: United States, Age 25-65
3. Add ad creative:
   - Upload test image (1200x628)
   - Headline: "Test Headline"
   - Description: "Test description"
   - URL: "https://upsurgeiq.com"
4. Select "Deploy to Facebook"
5. Choose connected Facebook account
6. Click "Deploy Campaign"

**Expected Results:**
- ✅ Campaign creation form validates successfully
- ✅ "Deploy Campaign" button triggers API call
- ✅ Loading indicator appears
- ✅ Success notification: "Campaign deployed to Facebook successfully"
- ✅ Campaign ID returned from Facebook
- ✅ Campaign appears in UpsurgeIQ dashboard with "Active" status

**Pass Criteria:**
- Campaign created without errors
- Campaign ID stored in database
- User receives confirmation

**Failure Actions:**
- Check Facebook API error response
- Verify all required fields are provided
- Check ad account permissions
- Review server logs for API call details
- Ensure ad account has sufficient budget

---

### Test 3.2: Verify Facebook Campaign in Ads Manager

**Test ID:** FB-AD-002  
**Priority:** Critical  
**Estimated Time:** 5 minutes

**Steps:**
1. Open Facebook Ads Manager: https://business.facebook.com/adsmanager
2. Search for campaign by name: "Test FB Campaign [TIMESTAMP]"
3. Click on campaign to view details

**Expected Results:**
- ✅ Campaign exists in Ads Manager
- ✅ Campaign name matches
- ✅ Budget matches ($10/day)
- ✅ Objective matches (Traffic)
- ✅ Target audience matches (US, 25-65)
- ✅ Ad creative matches (image, headline, description, URL)
- ✅ Campaign status is "Paused" (default for new campaigns)

**Pass Criteria:**
- All campaign details match exactly
- Campaign is properly configured

**Failure Actions:**
- Check API request payload in server logs
- Verify Facebook API response
- Check if campaign was created but with incorrect data
- Review mapping between UpsurgeIQ and Facebook campaign fields

---

### Test 3.3: LinkedIn Campaign Creation

**Test ID:** LI-AD-001  
**Priority:** Critical  
**Estimated Time:** 15 minutes

**Steps:**
1. Create campaign similar to Test 3.1
2. Campaign details:
   - Name: "Test LI Campaign [TIMESTAMP]"
   - Objective: "Website Visits"
   - Budget: $20/day
   - Target: United States, Job Title: Marketing Manager
3. Deploy to LinkedIn

**Expected Results:**
- ✅ Similar to Facebook test (3.1)
- ✅ Campaign created successfully
- ✅ LinkedIn campaign ID returned

**Pass Criteria:**
- Campaign deployed without errors
- Campaign ID stored

**Failure Actions:**
- Follow same troubleshooting as Facebook
- Check LinkedIn-specific API requirements
- Verify ad account has Advertising API access

---

### Test 3.4: Verify LinkedIn Campaign in Campaign Manager

**Test ID:** LI-AD-002  
**Priority:** Critical  
**Estimated Time:** 5 minutes

**Steps:**
1. Open LinkedIn Campaign Manager: https://www.linkedin.com/campaignmanager/
2. Find campaign: "Test LI Campaign [TIMESTAMP]"
3. Verify all details match

**Expected Results:**
- ✅ Campaign exists
- ✅ All details match UpsurgeIQ input
- ✅ Campaign status is "Paused"

**Pass Criteria:**
- Campaign properly configured in LinkedIn

**Failure Actions:**
- Check API payload and response
- Verify field mapping is correct

---

## Test Suite 4: Error Handling

### Test 4.1: Invalid/Expired Token

**Test ID:** ERROR-001  
**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Manually invalidate access token in database:
   ```sql
   UPDATE social_media_accounts 
   SET accessToken = 'INVALID_TOKEN_12345'
   WHERE platform = 'facebook' AND id = TEST_ACCOUNT_ID;
   ```
2. Attempt to create ad campaign

**Expected Results:**
- ✅ System detects invalid token
- ✅ Error message displayed: "Authentication expired. Please reconnect your Facebook account."
- ✅ "Reconnect" button appears in UI
- ✅ Campaign creation is blocked
- ✅ Error logged in server logs

**Pass Criteria:**
- Error handled gracefully
- User receives clear instructions

**Failure Actions:**
- Check error handling in API client
- Verify error messages are user-friendly
- Ensure proper error propagation to frontend

---

### Test 4.2: Missing Permissions

**Test ID:** ERROR-002  
**Priority:** High  
**Estimated Time:** 10 minutes

**Steps:**
1. Revoke `ads_management` permission from Facebook app
2. Attempt to create campaign

**Expected Results:**
- ✅ API call fails with permission error
- ✅ Error message: "Insufficient permissions. Please reconnect with required permissions."
- ✅ List of required permissions shown
- ✅ "Reconnect" button available

**Pass Criteria:**
- Permission errors handled properly
- User understands what's needed

**Failure Actions:**
- Check permission validation logic
- Verify error response parsing
- Ensure all required permissions are documented

---

### Test 4.3: Rate Limit Exceeded

**Test ID:** ERROR-003  
**Priority:** Medium  
**Estimated Time:** 15 minutes

**Steps:**
1. Make multiple rapid API calls (create 20 campaigns in quick succession)
2. Monitor for rate limit errors

**Expected Results:**
- ✅ System detects rate limit error
- ✅ Automatic retry with exponential backoff
- ✅ User sees "Processing..." message (not error)
- ✅ Eventually succeeds or fails gracefully after max retries
- ✅ Rate limit errors logged

**Pass Criteria:**
- Rate limits handled automatically
- User experience remains smooth

**Failure Actions:**
- Implement retry logic if missing
- Add rate limit detection
- Consider request queuing

---

### Test 4.4: Network Timeout

**Test ID:** ERROR-004  
**Priority:** Medium  
**Estimated Time:** 5 minutes

**Steps:**
1. Simulate network timeout (disconnect internet during API call)
2. Attempt campaign creation

**Expected Results:**
- ✅ Timeout detected
- ✅ Retry attempt made
- ✅ User sees "Retrying..." message
- ✅ Eventually fails with: "Network error. Please check your connection and try again."

**Pass Criteria:**
- Network errors handled gracefully
- User receives helpful error message

**Failure Actions:**
- Add timeout handling
- Implement retry logic
- Set appropriate timeout values

---

### Test 4.5: Account Disconnection

**Test ID:** ERROR-005  
**Priority:** High  
**Estimated Time:** 5 minutes

**Steps:**
1. Click "Disconnect" button for connected Facebook account
2. Confirm disconnection in dialog
3. Attempt to create campaign targeting Facebook

**Expected Results:**
- ✅ Confirmation dialog appears: "Are you sure you want to disconnect?"
- ✅ After confirmation, account removed from database
- ✅ UI updates to show "Not connected"
- ✅ "Connect" button reappears
- ✅ Campaign creation blocks Facebook deployment option
- ✅ Message: "Connect Facebook account to deploy ads"

**Pass Criteria:**
- Disconnection works properly
- UI updates correctly
- Cannot deploy to disconnected platform

**Failure Actions:**
- Check disconnect mutation in tRPC
- Verify database deletion
- Ensure UI re-fetches connection status

---

## Test Suite 5: Analytics & Reporting

### Test 5.1: Performance Data Sync (Facebook)

**Test ID:** ANALYTICS-001  
**Priority:** High  
**Estimated Time:** 24+ hours (requires live campaign)

**Prerequisites:**
- Live Facebook campaign with $5+ spend
- Campaign running for at least 24 hours

**Steps:**
1. Navigate to Campaign Lab dashboard
2. Find test campaign
3. Click to view analytics

**Expected Results:**
- ✅ Analytics page loads successfully
- ✅ Metrics displayed:
  - Impressions (> 0)
  - Clicks (≥ 0)
  - CTR (calculated correctly)
  - CPC (calculated correctly)
  - Total Spend (matches budget spent)
  - Conversions (if tracking pixel installed)
- ✅ Data matches Facebook Ads Manager (±5% variance acceptable)
- ✅ Last sync timestamp displayed
- ✅ "Refresh" button available

**Pass Criteria:**
- All metrics present and accurate
- Data syncs properly

**Failure Actions:**
- Check analytics sync service
- Verify API permissions include `ads_read`
- Check sync frequency configuration
- Review error logs for sync failures

---

### Test 5.2: Real-Time Analytics Update

**Test ID:** ANALYTICS-002  
**Priority:** Medium  
**Estimated Time:** 5 minutes

**Steps:**
1. View campaign analytics
2. Note current metrics
3. Wait 5 minutes
4. Click "Refresh" button
5. Compare metrics

**Expected Results:**
- ✅ Metrics update after refresh
- ✅ Impressions/clicks increase (if campaign is active)
- ✅ Spend increases
- ✅ Last sync timestamp updates
- ✅ No errors during refresh

**Pass Criteria:**
- Refresh works correctly
- Data updates properly

**Failure Actions:**
- Check refresh mechanism
- Verify API call is made
- Check for caching issues

---

### Test 5.3: LinkedIn Analytics Sync

**Test ID:** ANALYTICS-003  
**Priority:** High  
**Estimated Time:** 24+ hours

**Steps:**
- Same as Test 5.1 but for LinkedIn campaign

**Expected Results:**
- Similar to Facebook analytics test
- LinkedIn-specific metrics displayed

**Pass Criteria:**
- Analytics sync works for LinkedIn

**Failure Actions:**
- Follow same troubleshooting as Facebook
- Check LinkedIn Analytics API integration

---

## Test Suite 6: Security & Compliance

### Test 6.1: Token Encryption Verification

**Test ID:** SECURITY-001  
**Priority:** Critical  
**Estimated Time:** 5 minutes

**Steps:**
1. Query database for access tokens:
   ```sql
   SELECT id, platform, accessToken 
   FROM social_media_accounts 
   LIMIT 5;
   ```
2. Inspect token values

**Expected Results:**
- ✅ Tokens are NOT in plain text
- ✅ Tokens appear encrypted/hashed
- ✅ Cannot read actual token value from database
- ✅ Tokens are different lengths (if using encryption)

**Pass Criteria:**
- All tokens encrypted
- No plain text tokens in database

**Failure Actions:**
- CRITICAL: Implement encryption immediately
- Rotate all existing tokens
- Re-authenticate all users

---

### Test 6.2: CSRF Protection

**Test ID:** SECURITY-002  
**Priority:** High  
**Estimated Time:** 10 minutes

**Steps:**
1. Initiate OAuth flow
2. Capture state parameter from URL
3. Modify state parameter
4. Complete OAuth flow with modified state

**Expected Results:**
- ✅ OAuth callback rejects modified state
- ✅ Error: "Invalid state parameter" or "CSRF validation failed"
- ✅ No account connection created
- ✅ User redirected to error page

**Pass Criteria:**
- CSRF protection working
- Invalid state rejected

**Failure Actions:**
- Implement state validation
- Use cryptographically secure random state
- Store state with short expiry

---

### Test 6.3: OAuth Scope Validation

**Test ID:** SECURITY-003  
**Priority:** Medium  
**Estimated Time:** 5 minutes

**Steps:**
1. Review OAuth authorization screen
2. Check requested permissions/scopes

**Expected Results:**
- ✅ Only necessary permissions requested
- ✅ No excessive permissions (e.g., don't request `user_posts` if not needed)
- ✅ Permissions match documentation

**Pass Criteria:**
- Minimal necessary permissions requested
- Follows least-privilege principle

**Failure Actions:**
- Remove unnecessary scopes
- Document why each scope is needed

---

## Test Suite 7: Performance & Load Testing

### Test 7.1: Concurrent OAuth Flows

**Test ID:** PERF-001  
**Priority:** Medium  
**Estimated Time:** 15 minutes

**Steps:**
1. Simulate 10 users initiating OAuth flow simultaneously
2. Monitor server performance

**Expected Results:**
- ✅ All OAuth flows complete successfully
- ✅ No timeout errors
- ✅ Response time < 3 seconds per request
- ✅ Database connections managed properly
- ✅ No race conditions

**Pass Criteria:**
- System handles concurrent OAuth flows
- No performance degradation

**Failure Actions:**
- Check database connection pool size
- Implement request queuing if needed
- Optimize OAuth callback handler

---

### Test 7.2: Bulk Campaign Deployment

**Test ID:** PERF-002  
**Priority:** Medium  
**Estimated Time:** 20 minutes

**Steps:**
1. Create 20 campaigns in Campaign Lab
2. Deploy all to Facebook simultaneously
3. Monitor performance

**Expected Results:**
- ✅ All campaigns deploy successfully
- ✅ No API rate limit errors (or proper retry handling)
- ✅ Average deployment time < 10 seconds per campaign
- ✅ No database deadlocks
- ✅ UI remains responsive

**Pass Criteria:**
- Bulk deployment works
- Performance acceptable

**Failure Actions:**
- Implement request batching
- Add rate limit handling
- Consider background job queue

---

## Test Report Template

After completing all tests, document results using this template:

```markdown
# Ad Platform OAuth Testing Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Production/Staging]
**Version:** [App Version]

## Summary
- Total Tests: [Number]
- Passed: [Number]
- Failed: [Number]
- Blocked: [Number]
- Pass Rate: [Percentage]

## Critical Issues
1. [Issue description]
   - Test ID: [ID]
   - Severity: Critical
   - Status: [Open/Fixed]

## Test Results by Suite

### Suite 1: OAuth Connection Flow
- FB-OAUTH-001: ✅ PASS
- FB-OAUTH-002: ✅ PASS
- [etc.]

### Suite 2: Token Validation
- [Results]

[Continue for all suites]

## Recommendations
1. [Recommendation]
2. [Recommendation]

## Sign-off
- QA Lead: [Name] [Date]
- Engineering Lead: [Name] [Date]
- Product Owner: [Name] [Date]
```

---

## Automated Testing Script

For continuous testing, use this script:

```bash
#!/bin/bash
# test-oauth-integration.sh

echo "Starting OAuth Integration Tests..."

# Test 1: Check environment variables
echo "✓ Checking environment variables..."
if [ -z "$FACEBOOK_CLIENT_ID" ]; then
  echo "✗ FACEBOOK_CLIENT_ID not set"
  exit 1
fi

if [ -z "$LINKEDIN_CLIENT_ID" ]; then
  echo "✗ LINKEDIN_CLIENT_ID not set"
  exit 1
fi

# Test 2: Check database connectivity
echo "✓ Checking database connection..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT 1" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "✗ Database connection failed"
  exit 1
fi

# Test 3: Check OAuth callback routes
echo "✓ Checking OAuth callback routes..."
curl -s -o /dev/null -w "%{http_code}" https://upsurgeiq.com/api/oauth/facebook/callback | grep -q "400"
if [ $? -ne 0 ]; then
  echo "✗ Facebook callback route not responding"
  exit 1
fi

echo "✅ All automated tests passed!"
```

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Next Review:** After first production deployment