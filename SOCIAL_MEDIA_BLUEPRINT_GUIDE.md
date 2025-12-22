# UpsurgeIQ Social Media Posting Blueprint Guide

## Overview

This Make.com blueprint automates social media posting across **Facebook, Instagram, LinkedIn, and X (Twitter)** when UpsurgeIQ triggers a webhook. The workflow intelligently routes posts to the selected platforms based on user preferences.

---

## Blueprint Architecture

```
Webhook → Router → [Facebook | Instagram | LinkedIn | X]
```

**Flow:**
1. **Custom Webhook** receives post data from UpsurgeIQ
2. **Router** evaluates which platforms are selected
3. **Platform modules** post content to enabled social media accounts
4. Each route has a filter that checks if the platform is in the `platforms` array

---

## Installation Steps

### 1. Import Blueprint into Make.com

1. Log in to [Make.com](https://www.make.com)
2. Click **Scenarios** in the left sidebar
3. Click **Create a new scenario**
4. Click the **three dots** menu (⋯) in the top right
5. Select **Import Blueprint**
6. Upload the `SocialMediaPosting.blueprint.json` file
7. Click **Save**

### 2. Configure the Webhook

1. Click on the **Custom Webhook** module (first module)
2. Click **Create a webhook**
3. Give it a name: "UpsurgeIQ Social Media"
4. Click **Save**
5. **Copy the webhook URL** (you'll need this for UpsurgeIQ)

### 3. Connect Social Media Accounts

You need to connect each platform you want to use:

#### Facebook
1. Click the **Facebook: Create a Page Post** module
2. Click **Create a connection**
3. Log in with your Facebook account
4. Grant permissions
5. Select the **Facebook Page** you want to post to

#### Instagram
1. Click the **Instagram: Create Media Object Post** module
2. Click **Create a connection**
3. Log in with your Instagram Business account
4. Select the **Instagram Business Account**
5. **Note:** Requires Instagram Business or Creator account linked to a Facebook Page

#### LinkedIn
1. Click the **LinkedIn: Create Share** module
2. Click **Create a connection**
3. Log in with your LinkedIn account
4. Select **Profile** or **Company Page** to post as

#### X (Twitter)
1. Click the **X: Create a Tweet** module
2. Click **Create a connection**
3. Log in with your X account
4. Authorize Make.com

### 4. Test the Scenario

1. Click **Run once** in the bottom left
2. The webhook will wait for data
3. In UpsurgeIQ, create a test social media post
4. Select platforms and click "Post Now"
5. Check Make.com to see the execution
6. Verify posts appeared on your social media accounts

### 5. Activate the Scenario

1. Toggle the **ON** switch in the bottom left
2. Set scheduling to **Immediately as data arrives**
3. Click **Save**

---

## Webhook Payload Structure

UpsurgeIQ sends the following data to Make.com:

```json
{
  "event": "social_media.post_created",
  "timestamp": "2025-12-19T23:00:00Z",
  "post": {
    "id": 123,
    "content": "Excited to announce our new product launch! 🚀",
    "platforms": ["facebook", "linkedin", "twitter"],
    "scheduledFor": "2025-12-20T10:00:00Z",
    "imageUrl": "https://storage.example.com/images/product-launch.jpg"
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

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Always "social_media.post_created" |
| `timestamp` | ISO 8601 date | When the webhook was triggered |
| `post.id` | number | Unique post ID in UpsurgeIQ |
| `post.content` | string | The social media post text |
| `post.platforms` | array | List of platforms: "facebook", "instagram", "linkedin", "twitter" |
| `post.scheduledFor` | ISO 8601 date | When to post (optional, for future scheduling) |
| `post.imageUrl` | string | URL to image attachment (optional) |
| `user.id` | number | UpsurgeIQ user ID |
| `user.email` | string | User's email |
| `user.name` | string | User's full name |
| `business.name` | string | Company name |
| `business.brandVoice` | string | Brand voice preference |

---

## Router Logic

The blueprint uses **filters** on each route to determine which platforms to post to:

```
Facebook Route: contains(post.platforms, "facebook") = true
Instagram Route: contains(post.platforms, "instagram") = true
LinkedIn Route: contains(post.platforms, "linkedin") = true
X Route: contains(post.platforms, "twitter") = true
```

**Example:**
- If `post.platforms = ["facebook", "linkedin"]`
- Only Facebook and LinkedIn routes will execute
- Instagram and X routes will be skipped

---

## Platform-Specific Notes

### Facebook
- Requires a **Facebook Page** (not personal profile)
- Supports text, links, and images
- Character limit: 63,206 characters
- Image format: JPG, PNG, GIF

### Instagram
- Requires **Instagram Business** or **Creator** account
- Must be linked to a Facebook Page
- **Image is required** (Instagram doesn't support text-only posts)
- Character limit: 2,200 characters
- Image format: JPG, PNG (minimum 320px)

### LinkedIn
- Can post as **Personal Profile** or **Company Page**
- Supports text, links, and images
- Character limit: 3,000 characters
- Image format: JPG, PNG, GIF

### X (Twitter)
- Character limit: 280 characters (UpsurgeIQ should truncate)
- Supports text and images
- Image format: JPG, PNG, GIF, WebP
- Maximum 4 images per tweet

---

## Troubleshooting

### Webhook not receiving data
- Check that the webhook URL is correctly configured in UpsurgeIQ
- Verify the scenario is **ON** and **active**
- Check Make.com execution history for errors

### Posts not appearing on social media
- Verify social media account connections are active
- Check platform-specific permissions
- Review Make.com execution logs for API errors
- Ensure content meets platform requirements (character limits, image formats)

### Instagram posts failing
- Confirm account is Instagram Business or Creator
- Verify account is linked to a Facebook Page
- Ensure `imageUrl` is provided (required for Instagram)
- Check image URL is publicly accessible

### Character limit errors
- UpsurgeIQ should handle platform-specific limits
- If errors occur, add a **Text Aggregator** module before each platform to truncate content

---

## Advanced Customization

### Add Scheduling
To post at a specific time instead of immediately:

1. Add a **Sleep** module after the webhook
2. Set delay to: `{{formatDate(1.post.scheduledFor; "X")}} - {{formatDate(now; "X")}}`
3. This calculates seconds until scheduled time

### Add Error Notifications
To get notified when posts fail:

1. Add an **Error Handler** route to each platform module
2. Add a **SendGrid** or **Email** module
3. Send yourself an alert with error details

### Add Analytics Tracking
To track post performance:

1. Add an **HTTP** module after each platform
2. Make a POST request back to UpsurgeIQ API
3. Send platform response data (post ID, URL, etc.)

---

## Webhook URL for UpsurgeIQ

After creating the webhook in Make.com, you'll get a URL like:

```
https://hook.eu1.make.com/xxxxxxxxxxxxxxxxx
```

**To configure in UpsurgeIQ:**

1. Go to Admin Dashboard → Webhook Settings
2. Click **Add Webhook**
3. Set:
   - **Name:** "Social Media Posting"
   - **Event Type:** "social_media.post_created"
   - **Webhook URL:** (paste your Make.com webhook URL)
   - **Retry Attempts:** 3
4. Click **Save**

---

## Testing Checklist

- [ ] Blueprint imported successfully
- [ ] Webhook created and URL copied
- [ ] Facebook connection configured and page selected
- [ ] Instagram connection configured and account selected
- [ ] LinkedIn connection configured and profile/page selected
- [ ] X connection configured
- [ ] Test post sent from UpsurgeIQ
- [ ] All selected platforms received the post
- [ ] Images displayed correctly
- [ ] Character limits respected
- [ ] Scenario activated and running

---

## Support

If you encounter issues:

1. Check Make.com execution history for detailed error logs
2. Verify all social media connections are active
3. Test each platform individually by temporarily disabling others
4. Review platform-specific API documentation for requirements
5. Contact Make.com support for platform connection issues

---

## Next Steps

Once the blueprint is working:

1. **Monitor performance** - Check Make.com operations usage
2. **Add error handling** - Set up email alerts for failures
3. **Optimize content** - Use platform-specific formatting
4. **Scale up** - Add more social accounts or platforms
5. **Track analytics** - Send post IDs back to UpsurgeIQ for performance tracking

---

**Blueprint Version:** 1.0  
**Last Updated:** December 19, 2025  
**Compatible with:** Make.com (all regions)
