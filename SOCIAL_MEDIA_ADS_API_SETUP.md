# Social Media Ads Management API Setup Instructions

This document provides step-by-step instructions for integrating Facebook Ads, LinkedIn Ads, and X (Twitter) Ads APIs into the UpsurgeIQ platform.

---

## Overview

The Intelligent Campaign Lab requires API integrations with major advertising platforms to:
- Create and manage ad campaigns programmatically
- Monitor campaign performance in real-time
- Optimize ad spend based on performance data
- A/B test ad variations automatically
- Track conversions and ROI

---

## 1. Facebook Ads API Integration

### Prerequisites
- Facebook Business Manager account
- Facebook Developer account
- App created in Facebook for Developers

### Step 1: Create Facebook App
1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Business" as the app type
4. Fill in app details:
   - **App Name**: UpsurgeIQ Campaign Manager
   - **Contact Email**: your-email@example.com
   - **Business Account**: Select your business

### Step 2: Add Marketing API
1. In your app dashboard, click "Add Product"
2. Find "Marketing API" and click "Set Up"
3. Complete the setup wizard

### Step 3: Get Access Tokens
1. Go to **Tools** → **Graph API Explorer**
2. Select your app from the dropdown
3. Click "Generate Access Token"
4. Request these permissions:
   - `ads_management`
   - `ads_read`
   - `business_management`
   - `pages_read_engagement`
   - `pages_manage_ads`

### Step 4: Get Long-Lived Access Token
```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token" \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=YOUR_APP_ID" \
  -d "client_secret=YOUR_APP_SECRET" \
  -d "fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

### Step 5: Find Your Ad Account ID
1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Navigate to **Business Settings** → **Accounts** → **Ad Accounts**
3. Copy your Ad Account ID (format: `act_XXXXXXXXXX`)

### Step 6: Add Credentials to UpsurgeIQ
Use the `webdev_request_secrets` tool to add:
```
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_ACCESS_TOKEN=your_long_lived_token
FACEBOOK_AD_ACCOUNT_ID=act_XXXXXXXXXX
```

### API Endpoints to Implement

#### Create Campaign
```typescript
POST https://graph.facebook.com/v18.0/{ad_account_id}/campaigns
{
  "name": "Campaign Name",
  "objective": "OUTCOME_TRAFFIC", // or OUTCOME_LEADS, OUTCOME_SALES
  "status": "PAUSED",
  "special_ad_categories": [],
  "access_token": "YOUR_ACCESS_TOKEN"
}
```

#### Create Ad Set
```typescript
POST https://graph.facebook.com/v18.0/{ad_account_id}/adsets
{
  "name": "Ad Set Name",
  "campaign_id": "CAMPAIGN_ID",
  "daily_budget": "1000", // in cents
  "billing_event": "IMPRESSIONS",
  "optimization_goal": "LINK_CLICKS",
  "bid_amount": "50",
  "targeting": {
    "geo_locations": { "countries": ["US"] },
    "age_min": 25,
    "age_max": 65
  },
  "status": "PAUSED",
  "access_token": "YOUR_ACCESS_TOKEN"
}
```

#### Create Ad Creative
```typescript
POST https://graph.facebook.com/v18.0/{ad_account_id}/adcreatives
{
  "name": "Ad Creative Name",
  "object_story_spec": {
    "page_id": "PAGE_ID",
    "link_data": {
      "message": "Ad copy text",
      "link": "https://yourwebsite.com",
      "caption": "yourwebsite.com",
      "image_hash": "IMAGE_HASH"
    }
  },
  "access_token": "YOUR_ACCESS_TOKEN"
}
```

#### Get Campaign Insights
```typescript
GET https://graph.facebook.com/v18.0/{campaign_id}/insights
?fields=impressions,clicks,ctr,cpc,spend,reach,frequency
&access_token=YOUR_ACCESS_TOKEN
```

---

## 2. LinkedIn Ads API Integration

### Prerequisites
- LinkedIn Company Page
- LinkedIn Campaign Manager account
- LinkedIn Developer account

### Step 1: Create LinkedIn App
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create App"
3. Fill in app details:
   - **App Name**: UpsurgeIQ Campaign Manager
   - **LinkedIn Page**: Select your company page
   - **Privacy Policy URL**: https://yoursite.com/privacy
   - **App Logo**: Upload your logo

### Step 2: Request API Access
1. In your app settings, go to **Products** tab
2. Request access to "Advertising API"
3. Fill out the application form (may take 1-2 weeks for approval)

### Step 3: Get OAuth Credentials
1. Go to **Auth** tab in your app
2. Copy your **Client ID** and **Client Secret**
3. Add redirect URL: `https://your-domain.com/api/linkedin/callback`

### Step 4: OAuth 2.0 Flow
```typescript
// Step 1: Redirect user to LinkedIn authorization
const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
  `response_type=code&` +
  `client_id=YOUR_CLIENT_ID&` +
  `redirect_uri=YOUR_REDIRECT_URI&` +
  `scope=r_ads,r_ads_reporting,rw_ads,w_organization_social`;

// Step 2: Exchange authorization code for access token
POST https://www.linkedin.com/oauth/v2/accessToken
{
  "grant_type": "authorization_code",
  "code": "AUTHORIZATION_CODE",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "redirect_uri": "YOUR_REDIRECT_URI"
}
```

### Step 5: Find Your Ad Account ID
```typescript
GET https://api.linkedin.com/v2/adAccountsV2
?q=search
&search=(status:(values:List(ACTIVE)))
&projection=(elements*(id,name,type,status))
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Step 6: Add Credentials to UpsurgeIQ
```
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_ACCESS_TOKEN=your_access_token
LINKEDIN_AD_ACCOUNT_ID=urn:li:sponsoredAccount:XXXXXXXXX
```

### API Endpoints to Implement

#### Create Campaign
```typescript
POST https://api.linkedin.com/v2/adCampaignsV2
{
  "account": "urn:li:sponsoredAccount:ACCOUNT_ID",
  "name": "Campaign Name",
  "type": "SPONSORED_UPDATES",
  "costType": "CPM",
  "dailyBudget": {
    "currencyCode": "USD",
    "amount": "50.00"
  },
  "status": "PAUSED",
  "targetingCriteria": {
    "include": {
      "and": [
        {
          "or": {
            "urn:li:geo:103644278": {} // United States
          }
        }
      ]
    }
  }
}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Get Campaign Analytics
```typescript
GET https://api.linkedin.com/v2/adAnalyticsV2
?q=analytics
&pivot=CAMPAIGN
&dateRange=(start:(year:2024,month:1,day:1),end:(year:2024,month:12,day:31))
&campaigns[0]=urn:li:sponsoredCampaign:CAMPAIGN_ID
&fields=impressions,clicks,costInLocalCurrency,externalWebsiteConversions
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 3. X (Twitter) Ads API Integration

### Prerequisites
- X (Twitter) Ads account
- X Developer account with Elevated access
- Approved X Ads API access

### Step 1: Apply for X Ads API Access
1. Go to [X Developer Portal](https://developer.twitter.com/)
2. Apply for **Elevated** access
3. Once approved, apply for **Ads API** access
4. Fill out the Ads API application (requires business use case)
5. Wait for approval (can take 2-4 weeks)

### Step 2: Create X App
1. In X Developer Portal, click "Create Project"
2. Create an app within the project
3. Note your **API Key**, **API Secret**, **Bearer Token**

### Step 3: OAuth 1.0a Setup
```typescript
// X uses OAuth 1.0a for authentication
const oauth = {
  consumer_key: 'YOUR_API_KEY',
  consumer_secret: 'YOUR_API_SECRET',
  token: 'YOUR_ACCESS_TOKEN',
  token_secret: 'YOUR_ACCESS_TOKEN_SECRET'
};
```

### Step 4: Find Your Ads Account ID
```bash
curl --request GET \
  --url 'https://ads-api.twitter.com/12/accounts' \
  --header 'Authorization: Bearer YOUR_BEARER_TOKEN'
```

### Step 5: Add Credentials to UpsurgeIQ
```
X_API_KEY=your_api_key
X_API_SECRET=your_api_secret
X_ACCESS_TOKEN=your_access_token
X_ACCESS_TOKEN_SECRET=your_access_token_secret
X_ADS_ACCOUNT_ID=XXXXXXXXX
```

### API Endpoints to Implement

#### Create Campaign
```bash
curl --request POST \
  --url 'https://ads-api.twitter.com/12/accounts/{account_id}/campaigns' \
  --header 'Authorization: Bearer YOUR_BEARER_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "Campaign Name",
    "funding_instrument_id": "FUNDING_INSTRUMENT_ID",
    "daily_budget_amount_local_micro": 50000000,
    "start_time": "2024-01-01T00:00:00Z",
    "entity_status": "PAUSED"
  }'
```

#### Create Promoted Tweet
```bash
curl --request POST \
  --url 'https://ads-api.twitter.com/12/accounts/{account_id}/promoted_tweets' \
  --header 'Authorization: Bearer YOUR_BEARER_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "line_item_id": "LINE_ITEM_ID",
    "tweet_ids": ["TWEET_ID"]
  }'
```

#### Get Campaign Analytics
```bash
curl --request GET \
  --url 'https://ads-api.twitter.com/12/stats/accounts/{account_id}' \
  --header 'Authorization: Bearer YOUR_BEARER_TOKEN' \
  --data 'entity=CAMPAIGN' \
  --data 'entity_ids=CAMPAIGN_ID' \
  --data 'start_time=2024-01-01T00:00:00Z' \
  --data 'end_time=2024-12-31T23:59:59Z' \
  --data 'granularity=DAY' \
  --data 'metric_groups=ENGAGEMENT,BILLING'
```

---

## Implementation Checklist

### Database Schema Updates
- [ ] Add `adPlatformCampaigns` table to link internal campaigns with platform campaign IDs
- [ ] Add `adPlatformCredentials` table to store encrypted API tokens per business
- [ ] Add `adPlatformSyncLog` table to track sync status and errors

### Backend Implementation
- [ ] Create `server/adPlatforms/facebook.ts` with Facebook Ads API client
- [ ] Create `server/adPlatforms/linkedin.ts` with LinkedIn Ads API client
- [ ] Create `server/adPlatforms/x.ts` with X Ads API client
- [ ] Implement OAuth flows for each platform
- [ ] Create unified interface for campaign creation across platforms
- [ ] Build analytics sync service to pull performance data
- [ ] Implement error handling and retry logic
- [ ] Add rate limiting to respect API quotas

### Frontend Implementation
- [ ] Add platform connection UI in Campaign Lab settings
- [ ] Create OAuth callback handlers for each platform
- [ ] Build platform selection UI in campaign creation wizard
- [ ] Add real-time sync status indicators
- [ ] Display platform-specific metrics in campaign dashboard
- [ ] Implement disconnect/reconnect functionality

### Security Considerations
- [ ] Encrypt all API tokens in database
- [ ] Implement token refresh logic for expired tokens
- [ ] Add audit logging for all API calls
- [ ] Validate webhook signatures from platforms
- [ ] Implement rate limiting on API endpoints
- [ ] Add CSRF protection to OAuth flows

### Testing
- [ ] Test campaign creation on each platform
- [ ] Verify analytics data accuracy
- [ ] Test token refresh flows
- [ ] Validate error handling for API failures
- [ ] Load test with multiple concurrent campaigns
- [ ] Test OAuth flows in production environment

---

## Rate Limits & Best Practices

### Facebook Ads API
- **Rate Limit**: 200 calls per hour per user
- **Best Practice**: Batch requests when possible, cache insights data

### LinkedIn Ads API
- **Rate Limit**: 100 requests per day per user (may increase with approval)
- **Best Practice**: Use projection parameters to reduce data transfer

### X Ads API
- **Rate Limit**: 1,000 requests per 24 hours per account
- **Best Practice**: Use async endpoints for bulk operations

---

## Support Resources

- **Facebook Ads API**: https://developers.facebook.com/docs/marketing-apis
- **LinkedIn Ads API**: https://learn.microsoft.com/en-us/linkedin/marketing/
- **X Ads API**: https://developer.twitter.com/en/docs/twitter-ads-api

---

## Next Steps

1. Apply for API access on all three platforms (start immediately as approval takes time)
2. Once approved, add credentials using `webdev_request_secrets`
3. Implement database schema changes
4. Build backend API clients for each platform
5. Create frontend UI for platform connections
6. Test thoroughly in sandbox/test mode before going live
7. Monitor API usage and costs closely

---

**Note**: All three platforms require business verification and may take 2-4 weeks for API access approval. Start the application process immediately to avoid delays.
