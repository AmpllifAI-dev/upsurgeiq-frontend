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
