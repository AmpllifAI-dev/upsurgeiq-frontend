# Webhook Testing Guide

## Overview

Your UpsurgeIQ platform now automatically sends client data to your Make.com webhook (which routes to Airtable) whenever a user completes the onboarding process. This guide explains how to test the webhook integration.

## Webhook Configuration

**Make.com Webhook URL**: `https://hook.eu1.make.com/s2i7454swkvep29j1tk91tn74d5dlkc8`

**Event Type**: `onboarding_completed`

**Status**: ✅ Active and configured in database

## Testing Methods

### Method 1: Manual Test Endpoint (Recommended for Initial Testing)

We've created a dedicated test endpoint that sends sample data to your webhook without requiring a full user registration.

**Endpoint**: `POST /api/trpc/webhook.test`

**How to Test**:

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Paste and run this code:

```javascript
fetch('https://3000-iyaj2igv7qriknlceiqqx-0fc0deed.manusvm.computer/api/trpc/webhook.test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({})
}).then(res => res.json()).then(data => console.log('Webhook test result:', data));
```

4. Check the console for the response
5. Check your Make.com scenario to see if it received the data
6. Check your Airtable base to verify the test record was created

**Sample Test Data Sent**:
```json
{
  "user": {
    "id": 999,
    "email": "test@example.com",
    "name": "Test User",
    "phone": "+1234567890"
  },
  "business": {
    "name": "Test Company",
    "industry": "Technology",
    "size": "11-50",
    "website": "https://test.com",
    "targetAudience": "B2B SaaS companies",
    "marketingGoals": "Increase brand awareness and generate leads"
  },
  "subscription": {
    "plan": "Pro",
    "status": "active"
  },
  "timestamp": "2025-12-19T17:45:00Z"
}
```

### Method 2: Complete Real Onboarding Flow

Test with actual user registration and onboarding:

1. **Register a New Account**:
   - Click "Get Started" on the landing page
   - Complete the Manus OAuth login
   - You'll be redirected to the onboarding page

2. **Complete Onboarding**:
   - Fill in business information:
     - Company name
     - Industry
     - Company size
     - Website
     - Target audience
     - Marketing goals
   - Click "Complete Onboarding"

3. **Verify Webhook Delivery**:
   - Check Make.com scenario execution history
   - Check Airtable for the new record
   - Check browser console for any errors

## Webhook Payload Structure

When a user completes onboarding, the following data is sent to your Make.com webhook:

```json
{
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890"
  },
  "business": {
    "name": "Acme Corporation",
    "industry": "Technology",
    "size": "11-50",
    "website": "https://acme.com",
    "targetAudience": "B2B SaaS companies in North America",
    "marketingGoals": "Increase brand awareness and generate qualified leads"
  },
  "subscription": {
    "plan": "Pro",
    "status": "active"
  },
  "timestamp": "2025-12-19T17:45:00.000Z"
}
```

## Make.com Scenario Setup

In your Make.com scenario, you should:

1. **Webhook Module** (already set up):
   - Custom Webhook listening at your URL
   - Receives the JSON payload above

2. **Airtable Module** (you need to configure):
   - Action: "Create a record"
   - Base: Your UpsurgeIQ Clients base
   - Table: UpsurgeIQ Clients (or your table name)
   - Field Mapping:
     - User ID → `{{user.id}}`
     - Email → `{{user.email}}`
     - Full Name → `{{user.name}}`
     - Phone → `{{user.phone}}`
     - Company Name → `{{business.name}}`
     - Industry → `{{business.industry}}`
     - Company Size → `{{business.size}}`
     - Website → `{{business.website}}`
     - Target Audience → `{{business.targetAudience}}`
     - Marketing Goals → `{{business.marketingGoals}}`
     - Subscription Plan → `{{subscription.plan}}`
     - Status → `{{subscription.status}}`
     - Onboarding Completed → `{{timestamp}}`

## Troubleshooting

### Webhook Not Firing

**Check 1: Database Configuration**
```sql
SELECT * FROM webhook_configs WHERE event_type = 'onboarding_completed';
```
Verify `is_active = 1` and webhook_url is correct.

**Check 2: Server Logs**
Look for webhook delivery logs in the server console when onboarding completes.

**Check 3: Make.com Scenario**
- Ensure scenario is "ON" (active)
- Check execution history for errors
- Verify webhook URL matches database configuration

### Webhook Failing

**Retry Logic**: The system automatically retries failed webhooks 3 times with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: After 2 seconds
- Attempt 3: After 4 seconds

**Check Make.com Response**:
- Make.com should return 200 status code
- Check Make.com execution history for error details

### Data Not Appearing in Airtable

**Check 1: Field Mapping**
Ensure all fields in Make.com are mapped correctly to your Airtable columns.

**Check 2: Field Types**
Verify Airtable field types match the data:
- Text fields for strings
- Email field for email
- Date field for timestamp
- Single select for industry, size, plan, status

**Check 3: Airtable Permissions**
Ensure Make.com has write access to your Airtable base.

## Monitoring Webhook Deliveries

Currently, webhook deliveries are logged to the server console. You can view logs by checking the dev server output in the Management UI.

**Future Enhancement**: Consider building an admin dashboard to view webhook delivery history, success/failure rates, and retry attempts.

## Security Notes

- Webhook URL is stored in the database (not hardcoded)
- Only admin users can modify webhook configurations
- Webhook payloads do not include sensitive data (passwords, tokens)
- Make.com webhook URL should be kept confidential

## Next Steps

1. **Test the webhook** using Method 1 (manual test endpoint)
2. **Configure Airtable mapping** in Make.com
3. **Test with real onboarding** using Method 2
4. **Monitor for a few days** to ensure reliability
5. **Optional**: Build admin UI for webhook management (currently requires database access)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Make.com execution history
3. Check server logs in Management UI
4. Verify Airtable field mappings
5. Test with the manual endpoint first before testing with real users
