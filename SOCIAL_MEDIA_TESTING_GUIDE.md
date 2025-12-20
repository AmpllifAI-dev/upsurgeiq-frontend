# Social Media Webhook Testing Guide

Complete step-by-step instructions for testing the UpsurgeIQ → Make.com → Social Platforms flow.

---

## Prerequisites

Before testing, ensure you have:

1. ✅ Imported `SocialMediaPosting-Final.blueprint.json` into Make.com
2. ✅ Connected all social media accounts in Make.com:
   - Facebook Pages (business page, not personal profile)
   - Instagram Business Account (must be linked to Facebook Page)
   - LinkedIn Company Page (not personal profile)
3. ✅ Selected your pages/accounts in each module's configuration
4. ✅ Activated the Make.com scenario (toggle ON)
5. ✅ Copied the webhook URL and added it to UpsurgeIQ webhook dashboard

---

## Understanding the Router Filters

The blueprint uses intelligent routing based on the `platforms` array in the webhook payload:

| Platform | Filter Condition | Webhook Value |
|----------|-----------------|---------------|
| Facebook | `contains(platforms, "facebook")` | `"facebook"` |
| Instagram | `contains(platforms, "instagram")` | `"instagram"` |
| LinkedIn | `contains(platforms, "linkedin")` | `"linkedin"` |

**Example:** If webhook sends `platforms: ["facebook", "linkedin"]`, only Facebook and LinkedIn modules will execute.

---

## Test Scenario 1: Single Platform (Facebook Only)

### Step 1: Trigger Webhook from UpsurgeIQ

1. Go to `/webhook-settings` in UpsurgeIQ
2. Find "Social Media Posting" webhook
3. Click the **Test** button (▶️ play icon)

### Step 2: Check Make.com Execution

1. Go to Make.com scenario
2. Click **History** tab
3. Find the latest execution (should show "Success" with green checkmark)
4. Click on the execution to see details
5. Verify:
   - Webhook received data ✅
   - Router executed ✅
   - Facebook route activated ✅
   - Instagram route **skipped** (filter not met)
   - LinkedIn route activated ✅

### Step 3: Verify Facebook Post

1. Go to your Facebook Page
2. Check recent posts
3. You should see: "Test post from UpsurgeIQ! 🚀 This is a sample social media post to verify the webhook integration is working correctly."
4. Verify image is attached (placeholder image from picsum.photos)

### Expected Result
- ✅ Post appears on Facebook
- ❌ No post on Instagram (not in platforms array)
- ✅ Post appears on LinkedIn

---

## Test Scenario 2: Multiple Platforms

### Modify Test Payload

To test all platforms at once, you need to update the test endpoint payload. Currently it sends:
```json
{
  "platforms": ["facebook", "instagram", "linkedin"]
}
```

This will post to all three platforms simultaneously.

### Verification Checklist

After triggering the webhook:

| Platform | Check Location | Expected Content |
|----------|---------------|------------------|
| **Facebook** | Your Facebook Page → Posts | Test post + image |
| **Instagram** | Your Instagram Business Profile → Feed | Test post + image |
| **LinkedIn** | Your LinkedIn Company Page → Posts | Test post + image |

---

## Test Scenario 3: Platform-Specific Content

### Testing Individual Platforms

To test one platform at a time, modify the webhook test payload:

**Facebook only:**
```json
{
  "platforms": ["facebook"]
}
```

**Instagram only:**
```json
{
  "platforms": ["instagram"]
}
```

**LinkedIn only:**
```json
{
  "platforms": ["linkedin"]
}
```

This helps isolate issues if one platform fails while others succeed.

---

## Troubleshooting Common Issues

### Issue 1: "Webhook delivery failed with status 410"

**Cause:** Make.com webhook URL expired or deleted

**Solution:**
1. Go to Make.com scenario
2. Click on the Webhook module (first module)
3. Copy the webhook URL
4. Update in UpsurgeIQ webhook dashboard

---

### Issue 2: "Value must not be empty" in Facebook module

**Cause:** Missing required fields (Page ID, File name, or Data)

**Solution:**
1. In Make.com, click on Facebook Photos module
2. Verify mappings:
   - **Page**: Select your Facebook Page from dropdown
   - **Photos → Item 1 → File name**: `{{1.post.image.fileName}}`
   - **Photos → Item 1 → Data**: `{{1.post.image.dataUrl}}`
   - **Caption**: `{{1.post.content}}`

---

### Issue 3: Instagram post fails with "Invalid image URL"

**Cause:** Instagram requires publicly accessible image URLs

**Solution:**
- The test payload uses `https://picsum.photos/1200/630` which should work
- If using custom images, ensure they are:
  - Publicly accessible (no authentication required)
  - HTTPS (not HTTP)
  - Valid image format (JPG, PNG)
  - Under 8MB file size

---

### Issue 4: LinkedIn post succeeds but no image appears

**Cause:** LinkedIn module not configured for file upload

**Solution:**
1. Click on LinkedIn module in Make.com
2. Verify **Choose Upload Method** is set to "Upload by file"
3. Verify mappings:
   - **File name**: `{{1.post.image.fileName}}`
   - **Data**: `{{1.post.image.dataUrl}}`
   - **Content**: `{{1.post.content}}`

---

### Issue 5: Router shows "All routes skipped"

**Cause:** Platforms array is empty or contains invalid values

**Solution:**
- Check webhook payload in Make.com execution history
- Verify `post.platforms` contains at least one of: `"facebook"`, `"instagram"`, `"linkedin"`
- Platform names must be lowercase and exact match

---

## Verifying Webhook Payload

### In Make.com:

1. Go to scenario **History**
2. Click on an execution
3. Click on **Webhook** module (module #1)
4. Click **Output** tab
5. Verify structure:

```json
{
  "event": "social_media.post_created",
  "timestamp": "2025-12-19T22:00:00Z",
  "post": {
    "id": 1,
    "content": "Test post from UpsurgeIQ! 🚀...",
    "platforms": ["facebook", "instagram", "linkedin"],
    "scheduledFor": null,
    "image": {
      "url": "https://picsum.photos/1200/630",
      "fileName": "test-post-image.jpg",
      "dataUrl": "https://picsum.photos/1200/630"
    }
  },
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Test User"
  },
  "business": {
    "name": "Test Business Corp",
    "brandVoice": "professional"
  }
}
```

---

## Testing Checklist

Before marking testing complete, verify:

- [ ] Webhook URL is active in Make.com
- [ ] Webhook URL is configured in UpsurgeIQ dashboard
- [ ] Make.com scenario is activated (ON)
- [ ] All social accounts are connected in Make.com
- [ ] Facebook Page is selected in Facebook module
- [ ] Instagram Business Account is selected in Instagram module
- [ ] LinkedIn Company Page is selected in LinkedIn module
- [ ] Test webhook triggers successfully from UpsurgeIQ
- [ ] Make.com execution history shows "Success"
- [ ] Test post appears on Facebook
- [ ] Test post appears on Instagram
- [ ] Test post appears on LinkedIn
- [ ] Images are attached to all posts
- [ ] Router filters work correctly (posts only go to selected platforms)

---

## Next Steps After Testing

Once testing is complete:

1. **Delete test posts** (see SOCIAL_MEDIA_POST_DELETION_GUIDE.md)
2. **Build the social media composer UI** in UpsurgeIQ
3. **Test end-to-end flow** from UI → Webhook → Make.com → Social Platforms
4. **Monitor webhook delivery logs** for any failures

---

## Support

If you encounter issues not covered in this guide:

1. Check Make.com execution history for detailed error messages
2. Check UpsurgeIQ webhook delivery logs at `/webhook-settings` → Delivery Logs tab
3. Verify all API connections are still authorized (tokens don't expire)
4. Test each platform individually to isolate the problem

---

**Last Updated:** December 19, 2025
