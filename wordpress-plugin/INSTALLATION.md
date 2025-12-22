# UpsurgeIQ Blog Notifier Plugin Installation

This WordPress plugin automatically sends email notifications to your UpsurgeIQ newsletter subscribers whenever you publish a new blog post.

## Installation Steps

### 1. Upload Plugin to WordPress

1. Log in to your WordPress admin panel at `https://amplifai.wpenginepowered.com/wp-admin`
2. Navigate to **Plugins → Add New**
3. Click **Upload Plugin** button at the top
4. Click **Choose File** and select `upsurgeiq-blog-notifier.php`
5. Click **Install Now**
6. Click **Activate Plugin**

### 2. Verify Installation

1. Go to **Settings → UpsurgeIQ Notifier** in your WordPress admin
2. You should see the configuration page with:
   - Webhook URL: `https://3000-izy2a9g4czgp8rebq1e44-8eccbcdd.manusvm.computer/api/trpc/blogWebhook`
   - Status: ✓ Active

### 3. Test the Integration

1. Create a test blog post in WordPress
2. Publish the post
3. Check your UpsurgeIQ analytics dashboard to verify the notification was sent
4. Check your email (if you're subscribed to the newsletter) to see the notification

## How It Works

When you publish a new blog post:

1. WordPress triggers the plugin
2. Plugin sends post title, excerpt, and URL to UpsurgeIQ
3. UpsurgeIQ automatically emails all active newsletter subscribers
4. Subscribers receive a beautifully formatted email with:
   - Blog post title
   - Excerpt/preview
   - "Read Full Article" button linking to your blog

## Important Notes

- **Only new posts trigger notifications** - Updating existing published posts will NOT send notifications
- **Only blog posts are tracked** - Pages and custom post types are ignored
- **Requires active newsletter subscribers** - If you have no subscribers, no emails will be sent
- **Webhook secret is pre-configured** - No additional setup required

## Troubleshooting

If notifications aren't being sent:

1. Check WordPress error logs at **Tools → Site Health → Info → Server**
2. Verify the webhook URL is accessible from your WordPress server
3. Ensure you have active newsletter subscribers in UpsurgeIQ
4. Check the UpsurgeIQ analytics dashboard for webhook delivery logs

## Security

The plugin uses a secure webhook secret (`upsurgeiq-blog-secret-2025`) to authenticate requests. This prevents unauthorised access to your notification system.

## Support

For issues or questions, contact your UpsurgeIQ account manager or visit the support portal at https://help.manus.im
