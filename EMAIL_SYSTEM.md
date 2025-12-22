# Email Notification System

The upsurgeIQ platform includes a comprehensive email notification system powered by SendGrid for transactional emails and admin alerts.

## Overview

The email system provides:
- **Welcome emails** for new user registrations
- **Payment confirmation emails** when subscriptions are purchased
- **Press release notifications** when content is published
- **Error alert emails** for critical system errors (admin only)

## Setup Instructions

### 1. Get SendGrid API Key

1. Sign up for a free SendGrid account at https://sendgrid.com
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Give it a name (e.g., "upsurgeIQ Production")
5. Select **Full Access** permissions
6. Copy the API key (you'll only see it once!)

### 2. Configure Environment Variables

You need to request the following secrets through the Manus platform:

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@upsurgeiq.com
ADMIN_EMAIL=christopher@upsurgeiq.com
FRONTEND_URL=https://upsurgeiq.com
```

**To add these secrets:**
1. I'll call `webdev_request_secrets` to create an input card for you
2. You'll enter the values in the Manus UI
3. The platform will automatically inject them into the environment

### 3. Verify Sender Identity in SendGrid

SendGrid requires you to verify your sending email address:

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - **From Name**: upsurgeIQ
   - **From Email Address**: noreply@upsurgeiq.com
   - **Reply To**: christopher@upsurgeiq.com
   - **Company Address**: Your business address
4. Check your email and click the verification link
5. Wait for approval (usually instant for single sender verification)

**Alternative: Domain Authentication (Recommended for Production)**
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS setup instructions for upsurgeiq.com
4. Add the CNAME records to your Cloudflare DNS
5. This allows you to send from any @upsurgeiq.com address

## Email Templates

### Welcome Email
**Trigger**: New user registration (first login)  
**Recipient**: New user  
**Content**: Platform introduction, getting started guide, dashboard link

### Payment Confirmation Email
**Trigger**: Successful Stripe checkout completion  
**Recipient**: Paying customer  
**Content**: Subscription details, plan features, billing information, dashboard link

### Press Release Notification Email
**Trigger**: Press release status changed to "published"  
**Recipient**: Content creator  
**Content**: Press release title, excerpt, link to view full content

### Error Alert Email
**Trigger**: Critical error logged in the system  
**Recipient**: Admin (christopher@upsurgeiq.com)  
**Content**: Error message, component, user ID, stack trace, link to error logs dashboard

## Email Triggers

### Automatic Triggers

1. **Payment Confirmation**
   - Location: `server/webhooks/stripe.ts`
   - Event: `checkout.session.completed`
   - Sends email with subscription details

2. **Press Release Published**
   - Location: `server/routers.ts` (pressRelease.create)
   - Event: Press release created with status "published"
   - Sends notification to content creator

### Manual Triggers

You can manually send emails using the email functions:

```typescript
import { 
  sendWelcomeEmail,
  sendPaymentConfirmationEmail,
  sendPressReleaseNotificationEmail,
  sendErrorAlertEmail 
} from "./server/_core/email";

// Send welcome email
await sendWelcomeEmail({
  to: "user@example.com",
  name: "John Doe",
});

// Send payment confirmation
await sendPaymentConfirmationEmail({
  to: "user@example.com",
  name: "John Doe",
  plan: "Pro",
  amount: 9900, // Amount in pence (£99.00)
});

// Send press release notification
await sendPressReleaseNotificationEmail({
  to: "user@example.com",
  name: "John Doe",
  title: "Company Announces New Product",
  excerpt: "We're excited to announce...",
});

// Send error alert (admin only)
await sendErrorAlertEmail({
  errorMessage: "Database connection failed",
  component: "DatabaseService",
  userId: 123,
  stackTrace: error.stack,
});
```

## Testing Email Delivery

### Test in Development

1. Set your SendGrid API key in environment variables
2. Update `FROM_EMAIL` to your verified sender email
3. Send a test email:

```typescript
import { sendEmail } from "./server/_core/email";

await sendEmail({
  to: "your-email@example.com",
  subject: "Test Email",
  text: "This is a test email from upsurgeIQ",
  html: "<p>This is a test email from <strong>upsurgeIQ</strong></p>",
});
```

4. Check your inbox (and spam folder)
5. Verify the email arrives with correct formatting

### Test in Production

1. Create a test user account
2. Subscribe to a plan using Stripe test card: `4242 4242 4242 4242`
3. Verify payment confirmation email arrives
4. Create and publish a press release
5. Verify press release notification email arrives
6. Check admin email for any error alerts

## Email Delivery Status

### Check SendGrid Dashboard

1. Log into SendGrid dashboard
2. Go to **Activity** → **Activity Feed**
3. View email delivery status:
   - **Processed**: Email accepted by SendGrid
   - **Delivered**: Email successfully delivered to recipient
   - **Opened**: Recipient opened the email
   - **Clicked**: Recipient clicked a link in the email
   - **Bounced**: Email bounced (invalid address)
   - **Dropped**: Email dropped by SendGrid (spam, invalid, etc.)

### Monitor Email Logs

Check the application logs for email sending status:

```bash
# View recent email logs
grep "EmailService" logs/app.log

# Check for email errors
grep "Failed to send email" logs/app.log
```

## Troubleshooting

### Emails Not Sending

1. **Check SendGrid API Key**
   ```bash
   # Verify environment variable is set
   echo $SENDGRID_API_KEY
   ```

2. **Verify Sender Identity**
   - Ensure FROM_EMAIL is verified in SendGrid
   - Check SendGrid dashboard for verification status

3. **Check Application Logs**
   - Look for "Email sent successfully" or "Failed to send email" messages
   - Check for SendGrid API errors

4. **Test SendGrid Connection**
   ```bash
   curl --request POST \
     --url https://api.sendgrid.com/v3/mail/send \
     --header "Authorization: Bearer $SENDGRID_API_KEY" \
     --header 'Content-Type: application/json' \
     --data '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@upsurgeiq.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
   ```

### Emails Going to Spam

1. **Set up Domain Authentication** (DKIM, SPF, DMARC)
   - Go to SendGrid → Settings → Sender Authentication
   - Authenticate your domain
   - Add DNS records to Cloudflare

2. **Warm Up Your Sending Domain**
   - Start with low email volume
   - Gradually increase over time
   - Monitor bounce and spam rates

3. **Improve Email Content**
   - Avoid spam trigger words
   - Include unsubscribe link
   - Use proper HTML formatting
   - Include plain text version

### Rate Limiting

SendGrid free tier limits:
- **100 emails per day**
- **40,000 emails per month** (paid plans)

If you hit rate limits:
1. Upgrade your SendGrid plan
2. Implement email queuing
3. Batch non-critical emails

## Email Customization

### Update Email Templates

Email templates are in `server/_core/email.ts`. To customize:

1. Edit the HTML and text content
2. Update colors, fonts, and styling
3. Add your logo and branding
4. Test changes in development
5. Deploy to production

### Add New Email Types

1. Create a new email function in `server/_core/email.ts`:

```typescript
export async function sendCustomEmail(params: {
  to: string;
  name: string;
  // Add custom parameters
}): Promise<boolean> {
  const subject = "Your Custom Email Subject";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <!-- Your HTML template -->
    </html>
  `;
  
  const text = `Your plain text version`;
  
  return await sendEmail({
    to: params.to,
    subject,
    html,
    text,
  });
}
```

2. Add the trigger in your router or webhook
3. Test the new email type
4. Update this documentation

## Best Practices

1. **Always include plain text versions** - Some email clients don't support HTML
2. **Test emails before deploying** - Send to yourself first
3. **Monitor delivery rates** - Check SendGrid dashboard regularly
4. **Handle failures gracefully** - Don't let email failures break your app
5. **Respect user preferences** - Add unsubscribe options for marketing emails
6. **Keep templates responsive** - Ensure emails look good on mobile
7. **Use transactional emails only** - Don't send marketing emails without consent

## Support

If you need help with email configuration:
- SendGrid Documentation: https://docs.sendgrid.com
- SendGrid Support: https://support.sendgrid.com
- upsurgeIQ Support: christopher@upsurgeiq.com

## Next Steps

1. Set up SendGrid account and get API key
2. Request secrets through Manus platform
3. Verify sender identity in SendGrid
4. Test email delivery with a test account
5. Monitor email logs and delivery rates
6. Customize email templates with your branding
