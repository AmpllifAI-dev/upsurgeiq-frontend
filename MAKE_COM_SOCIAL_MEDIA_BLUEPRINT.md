# Make.com Social Media Automation Blueprint

**Purpose**: Automate social media posting from UpsurgeIQ to Facebook, Instagram, LinkedIn, and X (Twitter) using Make.com scenarios.

---

## Overview

This blueprint enables UpsurgeIQ to trigger automated social media posts through Make.com without requiring direct API integrations. When a user schedules or publishes a social media post in UpsurgeIQ, a webhook triggers Make.com to post to the selected platforms.

### Architecture Flow

```
UpsurgeIQ → Webhook → Make.com → Social Media Platforms
                         ↓
                    [Router Logic]
                         ↓
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    Facebook        Instagram         LinkedIn
                                          ↓
                                          X
```

---

## Prerequisites

### 1. Make.com Account
- **Plan Required**: Free plan supports 1,000 operations/month (sufficient for testing)
- **Recommended**: Core plan ($9/month) for 10,000 operations/month
- **Sign up**: https://www.make.com

### 2. Social Media Accounts
- Facebook Page (not personal profile)
- Instagram Business Account (linked to Facebook Page)
- LinkedIn Company Page or Personal Profile
- X (Twitter) Account with API access

### 3. UpsurgeIQ Webhook Endpoint
- Create a webhook endpoint in UpsurgeIQ backend
- Endpoint: `POST /api/webhooks/social-media-post`
- Authentication: Bearer token or HMAC signature

---

## Scenario 1: Multi-Platform Social Media Posting

### Trigger: Webhook

**Module**: Custom Webhook
- **Webhook Name**: UpsurgeIQ Social Media Post
- **Data Structure**:
```json
{
  "post_id": "string",
  "user_id": "number",
  "content": "string",
  "platforms": ["facebook", "instagram", "linkedin", "x"],
  "media_urls": ["https://..."],
  "scheduled_time": "ISO 8601 timestamp",
  "hashtags": ["#marketing", "#PR"],
  "link_url": "https://example.com",
  "link_preview": {
    "title": "string",
    "description": "string",
    "image_url": "https://..."
  }
}
```

**Webhook URL**: Copy this URL and add it to UpsurgeIQ configuration

---

### Module 2: Router

**Purpose**: Route to different platforms based on `platforms` array

**Routes**:
1. Facebook Route (if "facebook" in platforms array)
2. Instagram Route (if "instagram" in platforms array)
3. LinkedIn Route (if "linkedin" in platforms array)
4. X Route (if "x" in platforms array)

---

### Route 1: Facebook Posting

**Module**: Facebook → Create a Post

**Configuration**:
- **Connection**: Connect your Facebook Page
- **Select Method**: Create a Page Post
- **Page**: Select your Facebook Page
- **Message**: `{{content}}`
- **Link**: `{{link_url}}` (optional)
- **Photo URL**: `{{media_urls[0]}}` (if image exists)
- **Published**: Yes (or use scheduled_time for scheduling)

**Filter Condition**: 
- `{{contains(platforms; "facebook")}}` = true

**Character Limit**: 63,206 characters (Facebook limit)

**Advanced Options**:
- **Link Preview**: Use `link_preview` data if provided
- **Multiple Images**: Use Facebook Album creation for multiple images

---

### Route 2: Instagram Posting

**Module**: Instagram → Create a Media Object

**Configuration**:
- **Connection**: Connect Instagram Business Account
- **Instagram Business Account**: Select account
- **Media Type**: Image or Video
- **Image URL**: `{{media_urls[0]}}`
- **Caption**: `{{content}} {{join(hashtags; " ")}}`
- **Location**: Optional

**Module 2**: Instagram → Publish Media

**Configuration**:
- **Creation ID**: Use output from previous module
- **Instagram Business Account**: Same as above

**Filter Condition**: 
- `{{contains(platforms; "instagram")}}` = true

**Character Limit**: 2,200 characters for caption

**Important Notes**:
- Instagram requires image/video (no text-only posts)
- Aspect ratio: 1:1 (square), 4:5 (portrait), or 1.91:1 (landscape)
- Video: Max 60 seconds, MP4 format
- Cannot post links in caption (except in Stories)

---

### Route 3: LinkedIn Posting

**Module**: LinkedIn → Create a Share Update

**Configuration**:
- **Connection**: Connect LinkedIn Company Page or Personal Profile
- **Author**: Select Company Page or Personal Profile
- **Text**: `{{content}}`
- **Content URL**: `{{link_url}}` (optional)
- **Media**: `{{media_urls[0]}}` (optional)

**Filter Condition**: 
- `{{contains(platforms; "linkedin")}}` = true

**Character Limit**: 3,000 characters (recommended: 150-300 for engagement)

**Advanced Options**:
- **Article Sharing**: Use `link_preview` for rich link previews
- **Multiple Images**: LinkedIn supports up to 9 images in a single post

---

### Route 4: X (Twitter) Posting

**Module**: X → Create a Tweet

**Configuration**:
- **Connection**: Connect X account
- **Text**: `{{content}} {{join(hashtags; " ")}}`
- **Media**: `{{media_urls[0]}}` (optional, up to 4 images)
- **Link**: Automatically extracted from text

**Filter Condition**: 
- `{{contains(platforms; "x")}}` = true

**Character Limit**: 280 characters (or 4,000 for X Premium)

**Advanced Options**:
- **Thread Creation**: If content > 280 chars, split into thread
- **Poll**: Add poll options if provided
- **Reply Settings**: Who can reply (everyone, followers, mentioned)

---

### Module 3: Update UpsurgeIQ Database

**Module**: HTTP → Make a Request

**Purpose**: Send post results back to UpsurgeIQ

**Configuration**:
- **URL**: `https://your-upsurgeiq-domain.com/api/webhooks/social-media-result`
- **Method**: POST
- **Headers**:
  - `Content-Type`: application/json
  - `Authorization`: Bearer YOUR_API_KEY
- **Body**:
```json
{
  "post_id": "{{post_id}}",
  "results": {
    "facebook": {
      "success": true,
      "post_id": "{{facebook_post_id}}",
      "url": "{{facebook_post_url}}"
    },
    "instagram": {
      "success": true,
      "media_id": "{{instagram_media_id}}",
      "url": "{{instagram_post_url}}"
    },
    "linkedin": {
      "success": true,
      "share_id": "{{linkedin_share_id}}",
      "url": "{{linkedin_post_url}}"
    },
    "x": {
      "success": true,
      "tweet_id": "{{x_tweet_id}}",
      "url": "{{x_tweet_url}}"
    }
  },
  "posted_at": "{{now}}"
}
```

---

## Scenario 2: Scheduled Posting with Delay

### Trigger: Webhook (same as Scenario 1)

### Module 2: Sleep

**Purpose**: Delay posting until scheduled time

**Configuration**:
- **Delay**: Calculate difference between `scheduled_time` and current time
- **Formula**: `{{parseDate(scheduled_time; "YYYY-MM-DDTHH:mm:ssZ") - now}}`

### Module 3-6: Same as Scenario 1 (Router + Platform Posts)

---

## Scenario 3: Content Optimization

### Optional Enhancement Modules

#### Module: OpenAI → Create a Completion

**Purpose**: Optimize content for each platform

**Configuration**:
- **Model**: gpt-4
- **Prompt**: 
```
Optimize the following social media post for {{platform}}:

Original: {{content}}

Requirements:
- Character limit: {{platform_char_limit}}
- Tone: Professional yet engaging
- Include relevant hashtags
- Maintain key message

Return only the optimized post text.
```

**Insert Before**: Each platform posting module

---

## Scenario 4: Analytics Tracking

### Module: Google Sheets → Add a Row

**Purpose**: Track all social media posts for analytics

**Configuration**:
- **Spreadsheet**: Social Media Analytics
- **Sheet**: Posts
- **Values**:
  - Post ID: `{{post_id}}`
  - User ID: `{{user_id}}`
  - Content: `{{content}}`
  - Platforms: `{{join(platforms; ", ")}}`
  - Posted At: `{{now}}`
  - Facebook URL: `{{facebook_post_url}}`
  - Instagram URL: `{{instagram_post_url}}`
  - LinkedIn URL: `{{linkedin_post_url}}`
  - X URL: `{{x_tweet_url}}`

---

## Error Handling

### Module: Error Handler

**Add to Each Platform Route**:

**Module**: Tools → Set Variable

**Configuration**:
- **Variable Name**: error_log
- **Variable Value**:
```json
{
  "platform": "{{platform_name}}",
  "error": "{{error.message}}",
  "post_id": "{{post_id}}",
  "timestamp": "{{now}}"
}
```

### Module: HTTP → Make a Request

**Purpose**: Send error notification to UpsurgeIQ

**Configuration**:
- **URL**: `https://your-upsurgeiq-domain.com/api/webhooks/social-media-error`
- **Method**: POST
- **Body**: `{{error_log}}`

---

## UpsurgeIQ Backend Implementation

### 1. Create Webhook Endpoint

**File**: `server/webhooks.ts`

```typescript
import { Router } from "express";
import { db } from "./db";
import { socialMediaPosts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Webhook to trigger Make.com scenario
router.post("/social-media-post", async (req, res) => {
  const { postId } = req.body;

  // Get post from database
  const post = await db
    .select()
    .from(socialMediaPosts)
    .where(eq(socialMediaPosts.id, postId))
    .limit(1);

  if (!post.length) {
    return res.status(404).json({ error: "Post not found" });
  }

  const postData = post[0];

  // Prepare webhook payload
  const payload = {
    post_id: postData.id,
    user_id: postData.userId,
    content: postData.content,
    platforms: postData.platforms, // ["facebook", "instagram", "linkedin", "x"]
    media_urls: postData.mediaUrls || [],
    scheduled_time: postData.scheduledFor || new Date().toISOString(),
    hashtags: postData.hashtags || [],
    link_url: postData.linkUrl || null,
    link_preview: postData.linkPreview || null,
  };

  // Send to Make.com webhook
  const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
  
  try {
    const response = await fetch(makeWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Make.com webhook failed: ${response.statusText}`);
    }

    // Update post status
    await db
      .update(socialMediaPosts)
      .set({ status: "processing" })
      .where(eq(socialMediaPosts.id, postId));

    res.json({ success: true, message: "Post sent to Make.com" });
  } catch (error) {
    console.error("Error sending to Make.com:", error);
    res.status(500).json({ error: "Failed to send post to Make.com" });
  }
});

// Webhook to receive results from Make.com
router.post("/social-media-result", async (req, res) => {
  const { post_id, results, posted_at } = req.body;

  // Update post with results
  await db
    .update(socialMediaPosts)
    .set({
      status: "published",
      publishedAt: new Date(posted_at),
      platformResults: results,
    })
    .where(eq(socialMediaPosts.id, post_id));

  res.json({ success: true });
});

// Webhook to receive errors from Make.com
router.post("/social-media-error", async (req, res) => {
  const { platform, error, post_id, timestamp } = req.body;

  // Log error and update post status
  await db
    .update(socialMediaPosts)
    .set({
      status: "failed",
      errorMessage: `${platform}: ${error}`,
    })
    .where(eq(socialMediaPosts.id, post_id));

  res.json({ success: true });
});

export default router;
```

### 2. Add to Router

**File**: `server/routers.ts`

```typescript
import webhookRouter from "./webhooks";

// Add webhook routes
app.use("/api/webhooks", webhookRouter);
```

### 3. Add Environment Variable

**File**: `.env`

```
MAKE_WEBHOOK_URL=https://hook.us1.make.com/YOUR_WEBHOOK_ID
```

---

## Database Schema Updates

### Add to `social_media_posts` table:

```typescript
export const socialMediaPosts = sqliteTable("social_media_posts", {
  // ... existing fields
  status: text("status").default("draft"), // draft, processing, published, failed
  platformResults: text("platform_results", { mode: "json" }), // Store Make.com results
  errorMessage: text("error_message"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
});
```

---

## Testing the Integration

### Step 1: Set Up Make.com Scenario

1. Create new scenario in Make.com
2. Add Custom Webhook trigger
3. Copy webhook URL
4. Add to UpsurgeIQ `.env` as `MAKE_WEBHOOK_URL`

### Step 2: Connect Social Media Accounts

1. In Make.com, add each platform module
2. Click "Create a connection"
3. Authorize each social media account
4. Test connection

### Step 3: Test with Sample Post

**Sample Payload**:
```json
{
  "post_id": "test-123",
  "user_id": 1,
  "content": "🚀 Exciting news! We're launching our new AI-powered PR platform. Check it out!",
  "platforms": ["facebook", "linkedin"],
  "media_urls": ["https://example.com/image.jpg"],
  "scheduled_time": "2025-12-20T10:00:00Z",
  "hashtags": ["#AI", "#PR", "#Marketing"],
  "link_url": "https://upsurgeiq.com",
  "link_preview": {
    "title": "UpsurgeIQ - AI-Powered PR Platform",
    "description": "Amplify your voice with AI",
    "image_url": "https://example.com/preview.jpg"
  }
}
```

### Step 4: Monitor Execution

1. Go to Make.com → Scenarios → History
2. Check execution log for each run
3. Verify posts appear on social media platforms
4. Check UpsurgeIQ database for updated status

---

## Cost Estimation

### Make.com Operations per Post

- 1 Webhook trigger
- 1 Router
- 4 Platform posts (max)
- 1 Database update
- 1 Analytics tracking (optional)

**Total**: ~7-8 operations per post

### Monthly Costs

**Free Plan** (1,000 operations):
- ~125-140 posts/month
- Good for testing

**Core Plan** ($9/month, 10,000 operations):
- ~1,250-1,400 posts/month
- Suitable for most businesses

**Pro Plan** ($16/month, 40,000 operations):
- ~5,000-5,700 posts/month
- For agencies or high-volume users

---

## Advanced Features

### 1. Content Recycling

**Scenario**: Automatically repost top-performing content

**Trigger**: Scheduled (weekly)
**Logic**:
1. Query UpsurgeIQ API for top posts by engagement
2. Modify content slightly (add "Throwback:" prefix)
3. Repost to platforms

### 2. Cross-Platform Analytics

**Scenario**: Aggregate analytics from all platforms

**Modules**:
- Facebook → Get Page Insights
- Instagram → Get Media Insights
- LinkedIn → Get Share Statistics
- X → Get Tweet Metrics

**Output**: Send to UpsurgeIQ analytics dashboard

### 3. Auto-Hashtag Generation

**Module**: OpenAI → Create a Completion

**Prompt**:
```
Generate 5 relevant hashtags for this social media post:

{{content}}

Industry: {{user_industry}}
Target audience: {{user_target_audience}}

Return only hashtags, comma-separated.
```

### 4. Image Optimization

**Module**: CloudConvert → Convert File

**Purpose**: Resize/optimize images for each platform

**Configuration**:
- Facebook: Max 2048px
- Instagram: 1080x1080px (square)
- LinkedIn: 1200x627px
- X: 1200x675px

---

## Troubleshooting

### Common Issues

**1. Webhook not triggering**
- Check webhook URL is correct
- Verify Make.com scenario is active
- Check UpsurgeIQ logs for errors

**2. Platform connection expired**
- Reconnect social media accounts in Make.com
- Check token expiration dates
- Re-authorize if needed

**3. Character limit exceeded**
- Add text truncation module before posting
- Use platform-specific content optimization

**4. Media upload fails**
- Verify image URL is publicly accessible
- Check file size and format
- Ensure aspect ratio is correct

---

## Security Best Practices

1. **Use HMAC signatures** for webhook authentication
2. **Rotate API keys** regularly
3. **Limit webhook IP addresses** to Make.com IPs
4. **Store credentials** in Make.com encrypted storage
5. **Monitor for suspicious activity** in execution logs

---

## Maintenance

### Monthly Tasks

- Review execution logs for errors
- Check social media connection status
- Update character limits if platforms change
- Monitor operation usage

### Quarterly Tasks

- Review and optimize scenarios
- Update content optimization prompts
- Analyze posting performance
- Adjust scheduling logic

---

## Alternative: Zapier Blueprint

If you prefer Zapier over Make.com, the logic is similar:

**Trigger**: Webhook by Zapier
**Actions**:
1. Filter by Zapier (for each platform)
2. Facebook Pages → Create Page Post
3. Instagram for Business → Create Media
4. LinkedIn → Share an Update
5. Twitter → Create Tweet
6. Webhooks by Zapier → POST (send results back)

**Cost**: Zapier Professional plan ($19.99/month) for multi-step Zaps

---

## Conclusion

This Make.com blueprint provides a complete solution for social media automation from UpsurgeIQ without requiring direct API integrations. It's flexible, scalable, and cost-effective for businesses of all sizes.

**Next Steps**:
1. Set up Make.com account
2. Create scenario using this blueprint
3. Connect social media accounts
4. Implement webhook endpoints in UpsurgeIQ
5. Test with sample posts
6. Monitor and optimize

For questions or support, refer to Make.com documentation: https://www.make.com/en/help
