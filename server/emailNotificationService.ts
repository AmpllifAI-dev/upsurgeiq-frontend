import { ENV } from "./_core/env";
import { createLogger } from "./_core/logger";

const logger = createLogger("EmailNotificationService");

interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

/**
 * Send email via SendGrid
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.sendGridApiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: params.to }],
            subject: params.subject,
          },
        ],
        from: {
          email: ENV.fromEmail,
          name: "UpsurgeIQ",
        },
        content: [
          {
            type: "text/html",
            value: params.htmlContent,
          },
          ...(params.textContent
            ? [
                {
                  type: "text/plain",
                  value: params.textContent,
                },
              ]
            : []),
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error("SendGrid API error", undefined, { metadata: { errorText: error, status: response.status } });
      return false;
    }

    logger.info("Email sent successfully", { metadata: { to: params.to, subject: params.subject } });
    return true;
  } catch (error) {
    logger.error("Failed to send email", error instanceof Error ? error : undefined, { metadata: { errorMessage: String(error) } });
    return false;
  }
}

/**
 * Send notification email for pending approval
 */
export async function sendPendingApprovalEmail(
  userEmail: string,
  userName: string,
  campaignName: string,
  variantCount: number,
  campaignId: number
) {
  const subject = `${variantCount} New Ad Variants Ready for Approval`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ New Ad Variants Ready</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p><strong>${variantCount} new ad variations</strong> have been generated for your campaign <strong>"${campaignName}"</strong>.</p>
      
      <p>Our AI has created variations using proven psychological angles including:</p>
      <ul>
        <li>Scarcity & Urgency</li>
        <li>Social Proof</li>
        <li>Authority & Trust</li>
        <li>Reciprocity</li>
        <li>Curiosity</li>
      </ul>
      
      <p>Review and approve the variants you want to test. Once approved, our system will automatically deploy and optimize them based on performance.</p>
      
      <a href="${ENV.frontendUrl}/campaigns/${campaignId}" class="button">Review Variants →</a>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        <strong>Tip:</strong> Approve multiple variants to enable A/B testing. Our system will automatically identify winners and pause underperformers.
      </p>
    </div>
    <div class="footer">
      <p>UpsurgeIQ - AI-Powered PR & Marketing</p>
      <p><a href="${ENV.frontendUrl}/notification-preferences">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Hi ${userName},

${variantCount} new ad variations have been generated for your campaign "${campaignName}".

Our AI has created variations using proven psychological angles including Scarcity, Social Proof, Authority, Reciprocity, and Curiosity.

Review and approve the variants you want to test: ${ENV.frontendUrl}/campaigns/${campaignId}

Tip: Approve multiple variants to enable A/B testing. Our system will automatically identify winners and pause underperformers.

---
UpsurgeIQ - AI-Powered PR & Marketing
Manage notification preferences: ${ENV.frontendUrl}/notification-preferences
  `;

  return await sendEmail({
    to: userEmail,
    subject,
    htmlContent,
    textContent,
  });
}

/**
 * Send notification email for underperforming ad
 */
export async function sendUnderperformingAdEmail(
  userEmail: string,
  userName: string,
  variantName: string,
  score: number,
  campaignId: number
) {
  const subject = `⚠️ Ad Variant Underperforming - Action Recommended`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .score-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Performance Alert</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Ad variant <strong>"${variantName}"</strong> is underperforming and may need attention.</p>
      
      <div class="score-box">
        <strong>Performance Score: ${score.toFixed(1)}/100</strong>
        <p style="margin: 5px 0 0 0; font-size: 14px;">Based on CTR, conversion rate, and cost efficiency</p>
      </div>
      
      <p><strong>Recommended Actions:</strong></p>
      <ul>
        <li>Pause this variant to stop spending on underperforming creative</li>
        <li>Generate new variations with different psychological angles</li>
        <li>Review winning variants to identify what's working</li>
      </ul>
      
      <a href="${ENV.frontendUrl}/campaigns/${campaignId}" class="button">View Campaign →</a>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        <strong>Note:</strong> Our system can automatically pause underperforming variants if you enable auto-optimization in campaign settings.
      </p>
    </div>
    <div class="footer">
      <p>UpsurgeIQ - AI-Powered PR & Marketing</p>
      <p><a href="${ENV.frontendUrl}/notification-preferences">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Hi ${userName},

Ad variant "${variantName}" is underperforming and may need attention.

Performance Score: ${score.toFixed(1)}/100
(Based on CTR, conversion rate, and cost efficiency)

Recommended Actions:
- Pause this variant to stop spending on underperforming creative
- Generate new variations with different psychological angles
- Review winning variants to identify what's working

View campaign: ${ENV.frontendUrl}/campaigns/${campaignId}

Note: Our system can automatically pause underperforming variants if you enable auto-optimization in campaign settings.

---
UpsurgeIQ - AI-Powered PR & Marketing
Manage notification preferences: ${ENV.frontendUrl}/notification-preferences
  `;

  return await sendEmail({
    to: userEmail,
    subject,
    htmlContent,
    textContent,
  });
}

/**
 * Send notification email for variant deployed
 */
export async function sendVariantDeployedEmail(
  userEmail: string,
  userName: string,
  variantName: string,
  campaignName: string,
  campaignId: number
) {
  const subject = `✅ Ad Variant Deployed: ${variantName}`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Variant Deployed</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Ad variant <strong>"${variantName}"</strong> has been successfully deployed for campaign <strong>"${campaignName}"</strong>.</p>
      
      <p>Our system is now:</p>
      <ul>
        <li>Tracking impressions, clicks, and conversions</li>
        <li>Calculating performance scores in real-time</li>
        <li>Comparing against other variants</li>
        <li>Identifying winning creative automatically</li>
      </ul>
      
      <a href="${ENV.frontendUrl}/campaigns/${campaignId}" class="button">View Performance →</a>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        <strong>Tip:</strong> Allow at least 24 hours and 500 impressions before making optimization decisions.
      </p>
    </div>
    <div class="footer">
      <p>UpsurgeIQ - AI-Powered PR & Marketing</p>
      <p><a href="${ENV.frontendUrl}/notification-preferences">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Hi ${userName},

Ad variant "${variantName}" has been successfully deployed for campaign "${campaignName}".

Our system is now:
- Tracking impressions, clicks, and conversions
- Calculating performance scores in real-time
- Comparing against other variants
- Identifying winning creative automatically

View performance: ${ENV.frontendUrl}/campaigns/${campaignId}

Tip: Allow at least 24 hours and 500 impressions before making optimization decisions.

---
UpsurgeIQ - AI-Powered PR & Marketing
Manage notification preferences: ${ENV.frontendUrl}/notification-preferences
  `;

  return await sendEmail({
    to: userEmail,
    subject,
    htmlContent,
    textContent,
  });
}
