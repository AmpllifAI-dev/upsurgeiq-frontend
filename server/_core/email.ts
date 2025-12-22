import sgMail from "@sendgrid/mail";
import { ENV } from "./env";
import { createLogger } from "./logger";

const logger = createLogger("EmailService");

// Initialize SendGrid
if (ENV.sendGridApiKey) {
  sgMail.setApiKey(ENV.sendGridApiKey);
  logger.info("SendGrid initialized successfully");
} else {
  logger.warn("SENDGRID_API_KEY not configured - email sending disabled");
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}



/**
 * Send an email using SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!ENV.sendGridApiKey) {
    logger.warn("Email sending skipped - SendGrid not configured", {
      action: "sendEmail",
      metadata: { to: Array.isArray(options.to) ? options.to.join(", ") : options.to },
    });
    return false;
  }

  const fromEmail = options.from || ENV.fromEmail;

  try {
    logger.info("Sending email", {
      action: "sendEmail",
      metadata: {
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        from: fromEmail,
      },
    });

    await sgMail.send({
      to: options.to,
      from: fromEmail,
      subject: options.subject,
      text: options.text,
      html: options.html,
    } as any);

    logger.info("Email sent successfully", {
      action: "sendEmail",
      metadata: {
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
      },
    });

    return true;
  } catch (error) {
    logger.error("Failed to send email", error as Error, {
      action: "sendEmail",
      metadata: {
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
      },
    });
    return false;
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
}): Promise<boolean> {
  const subject = "Welcome to upsurgeIQ - Your AI-Powered PR Platform";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #008080 0%, #7FFF00 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .button { display: inline-block; background: #008080; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Welcome to upsurgeIQ</h1>
          <p style="margin: 10px 0 0 0;">Intelligence That Drives Growth</p>
        </div>
        <div class="content">
          <p>Hi ${params.name},</p>
          
          <p>Welcome to <strong>upsurgeIQ</strong>! We're thrilled to have you join our community of forward-thinking businesses leveraging AI for PR and marketing excellence.</p>
          
          <p>Your account is now active and ready to use. Here's what you can do next:</p>
          
          <ul>
            <li><strong>Complete your business profile</strong> - Add your company details and brand voice</li>
            <li><strong>Generate your first press release</strong> - Let AI create professional content in minutes</li>
            <li><strong>Connect social media accounts</strong> - Automate your content distribution</li>
            <li><strong>Build media lists</strong> - Reach journalists in your industry</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${ENV.frontendUrl || "https://upsurgeiq.com"}/dashboard" class="button">Go to Dashboard</a>
          </div>
          
          <p>If you have any questions or need assistance, our team is here to help. Simply reply to this email or visit our support center.</p>
          
          <p>Best regards,<br>
          The upsurgeIQ Team</p>
        </div>
        <div class="footer">
          <p>© 2025 upsurgeIQ. All rights reserved.</p>
          <p>Intelligence That Drives Growth</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${params.name},

Welcome to upsurgeIQ! We're thrilled to have you join our community of forward-thinking businesses leveraging AI for PR and marketing excellence.

Your account is now active and ready to use. Here's what you can do next:

- Complete your business profile - Add your company details and brand voice
- Generate your first press release - Let AI create professional content in minutes
- Connect social media accounts - Automate your content distribution
- Build media lists - Reach journalists in your industry

Visit your dashboard: ${ENV.frontendUrl || "https://upsurgeiq.com"}/dashboard

If you have any questions or need assistance, our team is here to help. Simply reply to this email or visit our support center.

Best regards,
The upsurgeIQ Team

---
© 2025 upsurgeIQ. All rights reserved.
Intelligence That Drives Growth
  `;

  return await sendEmail({
    to: params.to,
    subject,
    html,
    text,
  });
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(params: {
  to: string;
  name: string;
  plan: string;
  amount: number;
}): Promise<boolean> {
  const subject = `Payment Confirmed - ${params.plan} Plan Activated`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #008080 0%, #7FFF00 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .invoice-box { background: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .button { display: inline-block; background: #008080; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Payment Confirmed</h1>
          <p style="margin: 10px 0 0 0;">Thank you for your subscription</p>
        </div>
        <div class="content">
          <p>Hi ${params.name},</p>
          
          <p>Your payment has been successfully processed and your <strong>${params.plan} Plan</strong> is now active!</p>
          
          <div class="invoice-box">
            <h3 style="margin-top: 0;">Subscription Details</h3>
            <p><strong>Plan:</strong> ${params.plan}</p>
            <p><strong>Amount:</strong> £${(params.amount / 100).toFixed(2)}</p>
            <p><strong>Billing:</strong> Monthly</p>
            <p><strong>Status:</strong> Active</p>
          </div>
          
          <p>You now have access to all ${params.plan} plan features:</p>
          
          ${params.plan === "Pro" || params.plan === "Scale" ? `
          <ul>
            <li>AI-powered press release generation</li>
            <li>Social media distribution</li>
            <li>Journalist media lists</li>
            <li>Conversational AI assistant</li>
            ${params.plan === "Scale" ? "<li>Intelligent Campaign Lab</li><li>White-label partnership options</li>" : ""}
          </ul>
          ` : `
          <ul>
            <li>AI-powered press release generation</li>
            <li>Social media distribution</li>
            <li>Basic media lists</li>
          </ul>
          `}
          
          <div style="text-align: center;">
            <a href="${ENV.frontendUrl || "https://upsurgeiq.com"}/dashboard" class="button">Access Your Dashboard</a>
          </div>
          
          <p>Your subscription will automatically renew on the same day each month. You can manage your subscription, update payment methods, or cancel anytime from your dashboard.</p>
          
          <p>Thank you for choosing upsurgeIQ!</p>
          
          <p>Best regards,<br>
          The upsurgeIQ Team</p>
        </div>
        <div class="footer">
          <p>© 2025 upsurgeIQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${params.name},

Your payment has been successfully processed and your ${params.plan} Plan is now active!

Subscription Details:
- Plan: ${params.plan}
- Amount: £${(params.amount / 100).toFixed(2)}
- Billing: Monthly
- Status: Active

Visit your dashboard: ${ENV.frontendUrl || "https://upsurgeiq.com"}/dashboard

Your subscription will automatically renew on the same day each month. You can manage your subscription, update payment methods, or cancel anytime from your dashboard.

Thank you for choosing upsurgeIQ!

Best regards,
The upsurgeIQ Team

---
© 2025 upsurgeIQ. All rights reserved.
  `;

  return await sendEmail({
    to: params.to,
    subject,
    html,
    text,
  });
}

/**
 * Send error alert email to admin
 */
export async function sendErrorAlertEmail(params: {
  errorMessage: string;
  component: string;
  userId?: number;
  stackTrace?: string;
}): Promise<boolean> {
  const adminEmail = ENV.adminEmail || "christopher@upsurgeiq.com";
  const subject = `[upsurgeIQ] Error Alert: ${params.component}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .error-box { background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
        .code { background: #f3f4f6; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: monospace; font-size: 12px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">⚠️ Error Alert</h1>
          <p style="margin: 10px 0 0 0;">upsurgeIQ Platform</p>
        </div>
        <div class="content">
          <div class="error-box">
            <h3 style="margin-top: 0; color: #dc2626;">Error in ${params.component}</h3>
            <p><strong>Message:</strong> ${params.errorMessage}</p>
            ${params.userId ? `<p><strong>User ID:</strong> ${params.userId}</p>` : ""}
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          </div>
          
          ${params.stackTrace ? `
          <h4>Stack Trace:</h4>
          <div class="code">${params.stackTrace.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          ` : ""}
          
          <p>This error has been logged in the system. Please review the error logs dashboard for more details.</p>
          
          <p><a href="${ENV.frontendUrl || "https://upsurgeiq.com"}/error-logs">View Error Logs Dashboard</a></p>
        </div>
        <div class="footer">
          <p>This is an automated alert from upsurgeIQ error monitoring system.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
⚠️ ERROR ALERT - upsurgeIQ Platform

Component: ${params.component}
Message: ${params.errorMessage}
${params.userId ? `User ID: ${params.userId}` : ""}
Time: ${new Date().toISOString()}

${params.stackTrace ? `Stack Trace:\n${params.stackTrace}\n` : ""}

This error has been logged in the system. Please review the error logs dashboard for more details.

View Error Logs: ${ENV.frontendUrl || "https://upsurgeiq.com"}/error-logs

---
This is an automated alert from upsurgeIQ error monitoring system.
  `;

  return await sendEmail({
    to: adminEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send press release notification email
 */
export async function sendPressReleaseNotificationEmail(params: {
  to: string;
  name: string;
  title: string;
  excerpt: string;
}): Promise<boolean> {
  const subject = `New Press Release Published: ${params.title}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #008080 0%, #7FFF00 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .press-release-box { background: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .button { display: inline-block; background: #008080; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Press Release Published</h1>
        </div>
        <div class="content">
          <p>Hi ${params.name},</p>
          
          <p>Your press release has been successfully published!</p>
          
          <div class="press-release-box">
            <h3 style="margin-top: 0;">${params.title}</h3>
            <p>${params.excerpt}</p>
          </div>
          
          <p>Your press release is now ready to be distributed to your media lists and shared across your social media channels.</p>
          
          <div style="text-align: center;">
            <a href="${ENV.frontendUrl || "https://upsurgeiq.com"}/press-releases" class="button">View Press Release</a>
          </div>
          
          <p>Best regards,<br>
          The upsurgeIQ Team</p>
        </div>
        <div class="footer">
          <p>© 2025 upsurgeIQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${params.name},

Your press release has been successfully published!

Title: ${params.title}

${params.excerpt}

Your press release is now ready to be distributed to your media lists and shared across your social media channels.

View your press release: ${ENV.frontendUrl || "https://upsurgeiq.com"}/press-releases

Best regards,
The upsurgeIQ Team

---
© 2025 upsurgeIQ. All rights reserved.
  `;

  return await sendEmail({
    to: params.to,
    subject,
    html,
    text,
  });
}

/**
 * Send trial ending reminder email
 */
export async function sendTrialEndingEmail(params: {
  to: string;
  name: string;
  trialEndDate: string;
  plan: string;
}): Promise<boolean> {
  const subject = "Your upsurgeIQ Trial Ends Soon - Continue Your Success";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #008080 0%, #7FFF00 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .highlight-box { background: #f0fdfa; padding: 20px; border-radius: 6px; border-left: 4px solid #008080; margin: 20px 0; }
        .button { display: inline-block; background: #008080; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Your Trial is Ending Soon</h1>
          <p style="margin: 10px 0 0 0;">Continue your PR success with upsurgeIQ</p>
        </div>
        <div class="content">
          <p>Hi ${params.name},</p>
          
          <p>Your <strong>${params.plan} Plan</strong> trial ends on <strong>${params.trialEndDate}</strong>. We hope you've enjoyed exploring the power of AI-driven PR and marketing!</p>
          
          <div class="highlight-box">
            <h3 style="margin-top: 0;">Don't lose access to:</h3>
            <ul style="margin-bottom: 0;">
              <li>AI-powered press release generation</li>
              <li>Automated social media distribution</li>
              <li>Curated journalist media lists</li>
              <li>Conversational AI assistant</li>
              <li>Campaign performance analytics</li>
            </ul>
          </div>
          
          <p>To continue using upsurgeIQ without interruption, simply activate your subscription before your trial ends. Your payment method will be charged automatically, and you'll maintain full access to all features.</p>
          
          <div style="text-align: center;">
            <a href="${ENV.frontendUrl || "https://upsurgeiq.com"}/dashboard" class="button">Manage Subscription</a>
          </div>
          
          <p>If you have any questions about pricing, features, or need help getting the most out of upsurgeIQ, we're here to help. Just reply to this email!</p>
          
          <p>Best regards,<br>
          The upsurgeIQ Team</p>
        </div>
        <div class="footer">
          <p>© 2025 upsurgeIQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${params.name},

Your ${params.plan} Plan trial ends on ${params.trialEndDate}. We hope you've enjoyed exploring the power of AI-driven PR and marketing!

Don't lose access to:
- AI-powered press release generation
- Automated social media distribution
- Curated journalist media lists
- Conversational AI assistant
- Campaign performance analytics

To continue using upsurgeIQ without interruption, simply activate your subscription before your trial ends.

Manage your subscription: ${ENV.frontendUrl || "https://upsurgeiq.com"}/dashboard

If you have any questions, we're here to help!

Best regards,
The upsurgeIQ Team

---
© 2025 upsurgeIQ. All rights reserved.
  `;

  return await sendEmail({
    to: params.to,
    subject,
    html,
    text,
  });
}

/**
 * Send payment action required email (3D Secure)
 */
export async function sendPaymentActionRequiredEmail(params: {
  to: string;
  name: string;
  paymentUrl: string;
}): Promise<boolean> {
  const subject = "Action Required: Confirm Your Payment";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .warning-box { background: #fffbeb; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">⚠️ Payment Action Required</h1>
          <p style="margin: 10px 0 0 0;">Please confirm your payment</p>
        </div>
        <div class="content">
          <p>Hi ${params.name},</p>
          
          <p>Your bank requires additional authentication to complete your payment for upsurgeIQ. This is a standard security measure to protect your account.</p>
          
          <div class="warning-box">
            <p style="margin: 0;"><strong>Action needed:</strong> Click the button below to complete the authentication process with your bank. This usually takes less than a minute.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${params.paymentUrl}" class="button">Confirm Payment Now</a>
          </div>
          
          <p><strong>Important:</strong> If you don't complete this step within 24 hours, your payment will be canceled and your subscription may be interrupted.</p>
          
          <p>If you didn't attempt to make a payment, please contact us immediately.</p>
          
          <p>Best regards,<br>
          The upsurgeIQ Team</p>
        </div>
        <div class="footer">
          <p>© 2025 upsurgeIQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${params.name},

⚠️ PAYMENT ACTION REQUIRED

Your bank requires additional authentication to complete your payment for upsurgeIQ. This is a standard security measure to protect your account.

Click here to confirm your payment: ${params.paymentUrl}

Important: If you don't complete this step within 24 hours, your payment will be canceled and your subscription may be interrupted.

If you didn't attempt to make a payment, please contact us immediately.

Best regards,
The upsurgeIQ Team

---
© 2025 upsurgeIQ. All rights reserved.
  `;

  return await sendEmail({
    to: params.to,
    subject,
    html,
    text,
  });
}

/**
 * Send media list purchase confirmation email
 */
export async function sendMediaListPurchaseEmail(params: {
  to: string;
  name: string;
  mediaListName: string;
  amount: number;
  pressReleaseTitle?: string;
}): Promise<boolean> {
  const subject = `Purchase Confirmed - ${params.mediaListName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #008080 0%, #7FFF00 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .purchase-box { background: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .button { display: inline-block; background: #008080; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Purchase Confirmed!</h1>
          <p style="margin: 10px 0 0 0;">Your media list is ready to use</p>
        </div>
        <div class="content">
          <p>Hi ${params.name},</p>
          
          <p>Thank you for your purchase! You now have access to distribute your press release to <strong>${params.mediaListName}</strong>.</p>
          
          <div class="purchase-box">
            <h3 style="margin-top: 0;">Purchase Details</h3>
            <p><strong>Media List:</strong> ${params.mediaListName}</p>
            <p><strong>Amount:</strong> £${(params.amount / 100).toFixed(2)}</p>
            ${params.pressReleaseTitle ? `<p><strong>Press Release:</strong> ${params.pressReleaseTitle}</p>` : ""}
            <p><strong>Status:</strong> Ready to distribute</p>
          </div>
          
          <p>You can now distribute your press release to all journalists in this media list. Each contact will receive your professionally crafted press release directly in their inbox.</p>
          
          <div style="text-align: center;">
            <a href="${ENV.frontendUrl || "https://upsurgeiq.com"}/media-lists" class="button">View Media Lists</a>
          </div>
          
          <p><strong>Next steps:</strong></p>
          <ul>
            <li>Review the journalist contacts in your purchased list</li>
            <li>Finalize your press release content</li>
            <li>Schedule or send your distribution</li>
            <li>Track opens and engagement in your analytics dashboard</li>
          </ul>
          
          <p>Need help getting started? Our team is here to assist you. Just reply to this email!</p>
          
          <p>Best regards,<br>
          The upsurgeIQ Team</p>
        </div>
        <div class="footer">
          <p>© 2025 upsurgeIQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${params.name},

Thank you for your purchase! You now have access to distribute your press release to ${params.mediaListName}.

Purchase Details:
- Media List: ${params.mediaListName}
- Amount: £${(params.amount / 100).toFixed(2)}
${params.pressReleaseTitle ? `- Press Release: ${params.pressReleaseTitle}` : ""}
- Status: Ready to distribute

You can now distribute your press release to all journalists in this media list.

View your media lists: ${ENV.frontendUrl || "https://upsurgeiq.com"}/media-lists

Next steps:
- Review the journalist contacts in your purchased list
- Finalize your press release content
- Schedule or send your distribution
- Track opens and engagement in your analytics dashboard

Need help? Just reply to this email!

Best regards,
The upsurgeIQ Team

---
© 2025 upsurgeIQ. All rights reserved.
  `;

  return await sendEmail({
    to: params.to,
    subject,
    html,
    text,
  });
}

/**
 * Send press release to journalist
 */
export async function sendPressReleaseToJournalist(params: {
  to: string;
  pressReleaseTitle: string;
  pressReleaseContent: string;
  companyName: string;
}): Promise<boolean> {
  const subject = `Press Release: ${params.pressReleaseTitle}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #ffffff; padding: 20px; border-bottom: 3px solid #008080; }
        .content { background: #ffffff; padding: 30px; }
        .press-release { background: #f9f9f9; padding: 25px; border-left: 4px solid #008080; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <p style="margin: 0; color: #666; font-size: 14px;">PRESS RELEASE</p>
          <h1 style="margin: 10px 0 0 0; color: #008080;">${params.pressReleaseTitle}</h1>
          <p style="margin: 5px 0 0 0; color: #666;">${params.companyName}</p>
        </div>
        <div class="content">
          <div class="press-release">
            ${params.pressReleaseContent.replace(/\n/g, "<br>")}
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            For media inquiries, please contact ${params.companyName}.
          </p>
        </div>
        <div class="footer">
          <p>This press release was distributed via upsurgeIQ</p>
          <p>If you wish to unsubscribe from future press releases, please contact the sender directly.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
PRESS RELEASE
${params.pressReleaseTitle}
${params.companyName}

${params.pressReleaseContent}

---
For media inquiries, please contact ${params.companyName}.

This press release was distributed via upsurgeIQ.
If you wish to unsubscribe from future press releases, please contact the sender directly.
  `;

  return await sendEmail({
    to: params.to,
    subject,
    html,
    text,
  });
}

/**
 * Send press release distribution email with tracking
 */
export async function sendDistributionEmail(params: {
  to: string;
  recipientName: string;
  pressReleaseTitle: string;
  pressReleaseContent: string;
  businessName: string;
  distributionId: number;
  trackingUrl: string;
}): Promise<boolean> {
  const subject = `${params.businessName}: ${params.pressReleaseTitle}`;
  
  // Add UTM parameters to links
  const addUTMParams = (url: string) => {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', 'upsurgeiq');
    urlObj.searchParams.set('utm_medium', 'email');
    urlObj.searchParams.set('utm_campaign', 'press_release_distribution');
    urlObj.searchParams.set('distribution_id', params.distributionId.toString());
    return urlObj.toString();
  };

  // Tracking pixel (1x1 transparent GIF)
  const trackingPixel = `<img src="${params.trackingUrl}" width="1" height="1" alt="" style="display:none;" />`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.8; color: #333; }
        .container { max-width: 650px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #008080 0%, #7FFF00 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; }
        .press-release { margin: 30px 0; }
        .press-release h2 { color: #008080; margin-bottom: 20px; }
        .footer { text-align: center; padding: 30px 20px; color: #666; font-size: 13px; border-top: 1px solid #e0e0e0; }
        .button { display: inline-block; background: #008080; color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; margin: 25px 0; font-weight: 600; }
        a { color: #008080; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">${params.businessName}</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">Press Release</p>
        </div>
        <div class="content">
          <p>Dear ${params.recipientName},</p>
          
          <p>We are pleased to share our latest press release with you:</p>
          
          <div class="press-release">
            <h2>${params.pressReleaseTitle}</h2>
            ${params.pressReleaseContent}
          </div>
          
          <div style="text-align: center;">
            <a href="${addUTMParams(ENV.frontendUrl + '/press-releases/' + params.distributionId)}" class="button">Read Full Press Release</a>
          </div>
          
          <p>For media inquiries or additional information, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          ${params.businessName}</p>
        </div>
        <div class="footer">
          <p><strong>${params.businessName}</strong></p>
          <p>This email was sent via upsurgeIQ</p>
          <p style="font-size: 11px; margin-top: 15px;">
            If you no longer wish to receive press releases from ${params.businessName}, 
            <a href="${addUTMParams(ENV.frontendUrl + '/unsubscribe?email=' + params.to)}">click here to unsubscribe</a>.
          </p>
        </div>
        ${trackingPixel}
      </div>
    </body>
    </html>
  `;

  const text = `
${params.businessName}
Press Release

Dear ${params.recipientName},

We are pleased to share our latest press release with you:

${params.pressReleaseTitle}

${params.pressReleaseContent.replace(/<[^>]*>/g, '')}

Read the full press release: ${addUTMParams(ENV.frontendUrl + '/press-releases/' + params.distributionId)}

For media inquiries or additional information, please don't hesitate to contact us.

Best regards,
${params.businessName}

---
This email was sent via upsurgeIQ
If you no longer wish to receive press releases from ${params.businessName}, visit: ${addUTMParams(ENV.frontendUrl + '/unsubscribe?email=' + params.to)}
  `;

  return await sendEmail({
    to: params.to,
    subject,
    html,
    text,
  });
}
