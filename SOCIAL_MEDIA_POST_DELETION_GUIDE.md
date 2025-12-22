# Social Media Post Deletion Guide

Step-by-step instructions for deleting test posts from Facebook, Instagram, and LinkedIn after testing the webhook integration.

---

## Why Delete Test Posts?

Test posts contain placeholder content and sample images that don't represent your actual brand. Deleting them ensures:

- Your social media feeds show only real, professional content
- Test data doesn't confuse your audience
- Analytics remain accurate (test posts don't skew engagement metrics)
- Your brand image stays polished

---

## Facebook Post Deletion

### Method 1: Via Facebook Page (Recommended)

1. Go to [facebook.com](https://facebook.com)
2. Navigate to your **Business Page** (not your personal profile)
3. Click **Posts** in the left sidebar
4. Find the test post (look for "Test post from UpsurgeIQ! 🚀...")
5. Click the **three dots (⋯)** in the top-right corner of the post
6. Select **Move to trash**
7. Confirm deletion

### Method 2: Via Meta Business Suite

1. Go to [business.facebook.com](https://business.facebook.com)
2. Select your Page
3. Click **Content** → **Posts**
4. Find the test post
5. Click **three dots (⋯)** → **Delete**
6. Confirm deletion

### Bulk Deletion (Multiple Test Posts)

If you ran multiple tests:

1. Go to your Facebook Page
2. Click **Posts**
3. For each test post:
   - Click **three dots (⋯)** → **Move to trash**
4. Go to **Settings** → **Trash**
5. Review deleted posts
6. Click **Empty trash** to permanently delete all

### Recovering Accidentally Deleted Posts

- Deleted posts go to **Trash** for 30 days
- Go to **Settings** → **Trash** → **Restore** to recover

---

## Instagram Post Deletion

### Method 1: Via Instagram App (Mobile)

1. Open **Instagram app** on your phone
2. Go to your **Business Profile**
3. Tap your **profile picture** → **Posts**
4. Find the test post
5. Tap the **three dots (⋯)** in the top-right corner
6. Tap **Delete**
7. Confirm **Delete** again

### Method 2: Via Instagram Web

1. Go to [instagram.com](https://instagram.com)
2. Click your **profile picture** (top-right)
3. Find the test post in your grid
4. Click on the post to open it
5. Click **three dots (⋯)** in the top-right
6. Click **Delete**
7. Confirm **Delete**

### Method 3: Via Meta Business Suite

1. Go to [business.facebook.com](https://business.facebook.com)
2. Select your Instagram account
3. Click **Content** → **Posts & Stories**
4. Find the test post
5. Click **three dots (⋯)** → **Delete**
6. Confirm deletion

### Important Notes

- **Instagram posts cannot be recovered** after deletion (no trash folder)
- Deleted posts are removed immediately and permanently
- If you want to keep the post but hide it, use **Archive** instead of **Delete**

### Archiving Instead of Deleting

To hide a post without deleting:

1. Open the post
2. Click **three dots (⋯)**
3. Select **Archive**
4. Post is hidden from your profile but saved in **Archive** folder

---

## LinkedIn Post Deletion

### Method 1: Via LinkedIn Company Page

1. Go to [linkedin.com](https://linkedin.com)
2. Click **Work** icon (grid, top-right) → Select your **Company Page**
3. Find the test post in your feed
4. Click **three dots (⋯)** in the top-right corner of the post
5. Select **Delete post**
6. Confirm **Delete**

### Method 2: Via LinkedIn Page Admin View

1. Go to your **LinkedIn Company Page**
2. Click **Admin tools** → **Content**
3. Find the test post
4. Click **three dots (⋯)** → **Delete**
5. Confirm deletion

### Bulk Deletion (Multiple Test Posts)

LinkedIn doesn't have bulk delete, so you must delete posts one by one:

1. Go to **Admin tools** → **Content**
2. Filter by **Date** to find test posts
3. Delete each post individually

### Important Notes

- **LinkedIn posts cannot be recovered** after deletion
- Deletion is immediate and permanent
- Consider using **Edit post** to change content instead of deleting if you want to preserve engagement metrics

---

## Verification Checklist

After deleting test posts, verify:

- [ ] Facebook Page feed no longer shows test post
- [ ] Instagram Business Profile grid no longer shows test post
- [ ] LinkedIn Company Page feed no longer shows test post
- [ ] No test posts appear in **Recent Posts** sections
- [ ] Analytics/Insights no longer include test post data (may take 24-48 hours)

---

## Best Practices for Future Testing

### 1. Use a Test/Staging Account

Instead of posting to your live business accounts:

- Create separate test accounts for Facebook, Instagram, LinkedIn
- Use these for all webhook testing
- No need to delete posts from test accounts

### 2. Use Private/Draft Posts

Some platforms support draft or private posts:

- **Facebook**: Use "Only Me" visibility setting
- **LinkedIn**: Use "Connections only" or create a private test page
- **Instagram**: Unfortunately, no draft/private option for feed posts

### 3. Schedule Posts Far in the Future

Instead of publishing immediately:

- Schedule test posts for a date far in the future (e.g., 1 year)
- Verify the post appears in scheduled posts
- Delete the scheduled post before it publishes

### 4. Use Make.com Test Mode

Make.com scenarios can run in test mode:

1. In Make.com scenario, click **Run once**
2. This triggers the scenario without actually posting
3. Review the data flow without creating real posts

**Note:** This only works if you manually trigger; webhook triggers always execute fully.

---

## Troubleshooting

### "I can't find the test post on Facebook"

**Possible causes:**
- Post was published to your personal profile instead of business page
- Post visibility is set to "Only Me"
- Post is in **Trash** or **Scheduled Posts**

**Solution:**
- Check **Settings** → **Trash**
- Check **Publishing Tools** → **Scheduled Posts**
- Verify you're looking at the correct page

---

### "Instagram post won't delete"

**Possible causes:**
- You're trying to delete from personal account instead of business account
- Post is still processing (wait 5 minutes)

**Solution:**
- Switch to your business profile
- Try deleting from mobile app instead of web
- Wait a few minutes and try again

---

### "LinkedIn post delete button is grayed out"

**Possible causes:**
- You don't have admin permissions on the company page
- Post was created by another admin

**Solution:**
- Verify you have **Super Admin** or **Content Admin** role
- Ask the page owner to grant you permissions
- Contact the admin who created the post to delete it

---

## Automated Cleanup (Advanced)

### Option 1: Make.com Scenario for Auto-Deletion

Create a separate Make.com scenario that:

1. Stores post IDs from webhook in a database
2. Waits 1 hour (or your preferred time)
3. Automatically deletes posts using platform APIs

**Complexity:** High (requires API knowledge and database)

### Option 2: Scheduled Deletion Script

Create a server-side script that:

1. Tracks test posts in your database
2. Runs daily via cron job
3. Deletes posts older than 1 day using platform APIs

**Complexity:** Medium (requires backend development)

---

## Platform API Deletion (For Developers)

If you want to delete posts programmatically:

### Facebook Graph API

```bash
DELETE https://graph.facebook.com/v18.0/{post-id}
?access_token={your-access-token}
```

### Instagram Graph API

```bash
DELETE https://graph.facebook.com/v18.0/{media-id}
?access_token={your-access-token}
```

### LinkedIn API

```bash
DELETE https://api.linkedin.com/v2/posts/{post-id}
Authorization: Bearer {your-access-token}
```

---

## Summary

| Platform | Deletion Method | Recovery | Time to Delete |
|----------|----------------|----------|----------------|
| **Facebook** | Page → Posts → ⋯ → Delete | 30 days (Trash) | ~30 seconds |
| **Instagram** | Profile → Post → ⋯ → Delete | No recovery | ~30 seconds |
| **LinkedIn** | Page → Post → ⋯ → Delete | No recovery | ~30 seconds |

**Total time to clean up all test posts:** ~2 minutes

---

**Last Updated:** December 19, 2025
