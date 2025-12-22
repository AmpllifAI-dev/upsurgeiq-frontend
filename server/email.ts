import sgMail from "@sendgrid/mail";

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  console.warn("SENDGRID_API_KEY not found in environment variables");
} else {
  sgMail.setApiKey(apiKey);
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Send email using SendGrid
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const { to, subject, html, text, from } = params;

  try {
    const fromEmail = from || process.env.FROM_EMAIL || "noreply@upsurgeiq.com";

    await sgMail.send({
      to,
      from: fromEmail,
      subject,
      html,
      text: text || undefined,
    });

    console.log(`Email sent successfully to ${Array.isArray(to) ? to.join(", ") : to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    if (error instanceof Error && "response" in error) {
      const sgError = error as any;
      console.error("SendGrid error details:", sgError.response?.body);
    }
    return false;
  }
}

/**
 * Send bulk emails (batch sending)
 */
export async function sendBulkEmails(
  emails: Array<{ to: string; subject: string; html: string; text?: string }>
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const email of emails) {
    const success = await sendEmail(email);
    if (success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}
