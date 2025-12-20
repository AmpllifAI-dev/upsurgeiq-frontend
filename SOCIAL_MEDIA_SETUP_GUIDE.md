# Fixed Social Media Blueprint - Setup Guide

## What Was Wrong

The blueprint you exported from Make.com was **incomplete** because Make.com strips out sensitive configuration data during export. The modules were empty shells missing:

- Connection parameters (`__IMTCONN__`)
- Field mappings (what data goes where)
- Router filters (which platforms to post to)
- Module-specific settings

This caused the "Value must not be empty" errors you saw.

---

## What's Fixed

The new `SocialMediaPosting-Complete.blueprint.json` includes:

✅ **Complete webhook configuration** with proper data structure  
✅ **Router with 4 platform routes** (Facebook, Instagram, LinkedIn, X)  
✅ **Platform filters** that check if each platform is selected  
✅ **Field mappings** from webhook data to platform APIs  
✅ **Proper module configurations** for each social media platform  

---

## Import Instructions

### 1. Delete the Old Scenario

1. Go to Make.com → Scenarios
2. Find "UpsurgeIQ Social Media Posting"
3. Click the **three dots** (⋯) → **Delete**
4. Confirm deletion

### 2. Import the Fixed Blueprint

1. Click **Create a new scenario**
2. Click **three dots** (⋯) in top right
3. Select **Import Blueprint**
4. Upload `SocialMediaPosting-Complete.blueprint.json`
5. Click **Save**

### 3. Configure the Webhook

1. Click the **Custom Webhook** module (first circle)
2. Click **Add** next to "Webhook"
3. Name it: "UpsurgeIQ Social Media"
4. Click **Save**
5. **Copy the webhook URL** (starts with `https://hook.eu1.make.com/...`)

### 4. Connect Social Media Accounts

Now you need to connect each platform. Click on each module and follow these steps:

#### Facebook Pages

1. Click the **Facebook Pages: Create Post** module
2. Click **Add** next to "Connection"
3. Click **Create a connection**
4. Log in with Facebook
5. Grant permissions
6. After connection is created, select your **Facebook Page** from the dropdown

#### Instagram Business

1. Click the **Instagram Business: Create Post Photo** module
2. Click **Add** next to "Connection"
3. Click **Create a connection**
4. Log in with Instagram
5. **Important:** Must be Instagram Business or Creator account
6. After connection, select your **Instagram Business Account**

#### LinkedIn

1. Click the **LinkedIn: Create Company Image Post** module
2. Click **Add** next to "Connection"
3. Click **Create a connection**
4. Log in with LinkedIn
5. After connection, select your **Company Page** (or personal profile)

#### X (Twitter) - Special Instructions

The X/Twitter module uses a generic HTTP request because Make.com's native Twitter integration has limitations. You have two options:

**Option A: Use a Third-Party Service (Recommended)**

Use a service like [Zapier](https://zapier.com) or [IFTTT](https://ifttt.com) that has better Twitter API access, or use Make.com's "X (Twitter)" app if available in your region.

**Option B: Set Up Twitter OAuth 2.0 (Advanced)**

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create an app and get OAuth 2.0 credentials
3. In the HTTP module, add an **Authorization** header:
   - Name: `Authorization`
   - Value: `Bearer YOUR_TWITTER_BEARER_TOKEN`
4. Add a **Content-Type** header:
   - Name: `Content-Type`
   - Value: `application/json`

**Option C: Skip Twitter for Now**

You can disable the Twitter route and only use Facebook, Instagram, and LinkedIn initially.

### 5. Test Each Platform

1. Click **Run once** at the bottom
2. The webhook will wait for data
3. Send a test webhook from UpsurgeIQ or use this curl command:

```bash
curl -X POST https://hook.eu1.make.com/YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "event": "social_media.post_created",
    "timestamp": "2025-12-19T23:00:00Z",
    "post": {
      "id": 1,
      "content": "Test post from UpsurgeIQ! 🚀",
      "platforms": ["facebook", "instagram", "linkedin"],
      "imageUrl": "https://picsum.photos/1200/630"
    },
    "user": {
      "id": 1,
      "email": "test@example.com",
      "name": "Test User"
    },
    "business": {
      "name": "Test Company",
      "brandVoice": "professional"
    }
  }'
```

4. Check Make.com execution history
5. Verify posts appeared on your social media accounts

### 6. Activate the Scenario

1. Toggle **ON** at the bottom left
2. Set to run **Immediately as data arrives**
3. Click **Save**

---

## Configure in UpsurgeIQ

Once the webhook is working in Make.com:

1. Go to UpsurgeIQ → Admin Dashboard → Webhook Settings
2. Click **Add Webhook**
3. Fill in:
   - **Name:** "Social Media Posting"
   - **Event Type:** "social_media.post_created"
   - **Webhook URL:** (paste your Make.com webhook URL)
   - **Retry Attempts:** 3
4. Click **Save**

---

## Webhook Payload Reference

UpsurgeIQ will send this structure:

```json
{
  "event": "social_media.post_created",
  "timestamp": "2025-12-19T23:00:00Z",
  "post": {
    "id": 123,
    "content": "Your post text here",
    "platforms": ["facebook", "instagram", "linkedin", "twitter"],
    "scheduledFor": "2025-12-20T10:00:00Z",
    "imageUrl": "https://storage.example.com/image.jpg"
  },
  "user": {
    "id": 456,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "business": {
    "name": "Acme Corp",
    "brandVoice": "professional"
  }
}
```

---

## Platform-Specific Requirements

### Facebook
- Requires a **Facebook Page** (not personal profile)
- Image is optional
- Character limit: 63,206

### Instagram
- Requires **Instagram Business** or **Creator** account
- Must be linked to a Facebook Page
- **Image is required** (text-only posts not supported)
- Character limit: 2,200
- Image must be at least 320px wide

### LinkedIn
- Can post as Company Page or Personal Profile
- Image is optional
- Character limit: 3,000

### X (Twitter)
- Character limit: 280 characters
- Image is optional
- Requires OAuth 2.0 setup (see instructions above)

---

## Troubleshooting

### "Value must not be empty" errors

**Cause:** Module is missing required configuration  
**Fix:** Click the module and fill in all required fields (marked with *)

### Webhook not triggering

**Cause:** Webhook URL not configured or scenario is OFF  
**Fix:** 
1. Verify scenario is ON (toggle at bottom left)
2. Check webhook URL is correct in UpsurgeIQ
3. Look at Make.com execution history for errors

### Instagram posts failing

**Cause:** Account type or image issues  
**Fix:**
1. Confirm account is Instagram Business/Creator
2. Verify account is linked to a Facebook Page
3. Ensure `imageUrl` is provided (required)
4. Check image is publicly accessible and at least 320px

### Facebook connection expired

**Cause:** Facebook tokens expire after 60 days  
**Fix:**
1. Click the Facebook module
2. Click **Reconnect** next to the connection
3. Log in again to refresh the token

### LinkedIn posts not appearing

**Cause:** Wrong visibility setting or permissions  
**Fix:**
1. Check "Visibility" is set to "PUBLIC"
2. Verify your LinkedIn account has permission to post to the selected page
3. Try posting manually to LinkedIn to confirm permissions

---

## Router Logic

The blueprint uses **filters** on each route:

- **Facebook route:** Only runs if `platforms` array contains `"facebook"`
- **Instagram route:** Only runs if `platforms` array contains `"instagram"`
- **LinkedIn route:** Only runs if `platforms` array contains `"linkedin"`
- **X route:** Only runs if `platforms` array contains `"twitter"`

**Example:**
```json
"platforms": ["facebook", "linkedin"]
```
→ Only Facebook and LinkedIn routes execute  
→ Instagram and X routes are skipped

---

## Next Steps

1. **Test with real content** - Create a post in UpsurgeIQ and verify it appears on all selected platforms
2. **Monitor execution history** - Check Make.com for any errors or warnings
3. **Set up error notifications** - Add email alerts for failed posts
4. **Add scheduling** - Implement delayed posting for scheduled content
5. **Track analytics** - Send post IDs back to UpsurgeIQ for performance tracking

---

## Support

If you encounter issues:

1. Check Make.com **execution history** for detailed error logs
2. Verify all **social media connections** are active and not expired
3. Test each platform **individually** by temporarily removing others from the `platforms` array
4. Review **platform-specific requirements** above
5. Contact Make.com support for connection or API issues

---

**Blueprint Version:** 1.1 (Fixed)  
**Last Updated:** December 19, 2025  
**Status:** Ready to use
