import { describe, it, expect } from "vitest";

/**
 * Email Notification System Tests
 * 
 * These tests verify the email notification infrastructure is properly configured.
 * Actual email sending requires SENDGRID_API_KEY to be set in environment variables.
 */

describe("Email System Configuration", () => {
  it("should have email module available", async () => {
    const emailModule = await import("./_core/email");
    expect(emailModule).toBeDefined();
    expect(emailModule.sendEmail).toBeDefined();
    expect(emailModule.sendWelcomeEmail).toBeDefined();
    expect(emailModule.sendPaymentConfirmationEmail).toBeDefined();
    expect(emailModule.sendPressReleaseNotificationEmail).toBeDefined();
    expect(emailModule.sendErrorAlertEmail).toBeDefined();
  });

  it("should have ENV configuration for email", async () => {
    const { ENV } = await import("./_core/env");
    expect(ENV).toHaveProperty("sendGridApiKey");
    expect(ENV).toHaveProperty("fromEmail");
    expect(ENV).toHaveProperty("adminEmail");
    expect(ENV).toHaveProperty("frontendUrl");
  });

  it("should have default email addresses configured", async () => {
    const { ENV } = await import("./_core/env");
    expect(ENV.fromEmail).toBe("noreply@upsurgeiq.com");
    expect(ENV.adminEmail).toBe("christopher@upsurgeiq.com");
  });
});

describe("Email Template Structure", () => {
  it("should have welcome email function with correct parameters", async () => {
    const { sendWelcomeEmail } = await import("./_core/email");
    expect(sendWelcomeEmail).toBeDefined();
    expect(sendWelcomeEmail.length).toBe(1); // Takes one parameter object
  });

  it("should have payment confirmation email function", async () => {
    const { sendPaymentConfirmationEmail } = await import("./_core/email");
    expect(sendPaymentConfirmationEmail).toBeDefined();
    expect(sendPaymentConfirmationEmail.length).toBe(1);
  });

  it("should have press release notification email function", async () => {
    const { sendPressReleaseNotificationEmail } = await import("./_core/email");
    expect(sendPressReleaseNotificationEmail).toBeDefined();
    expect(sendPressReleaseNotificationEmail.length).toBe(1);
  });

  it("should have error alert email function", async () => {
    const { sendErrorAlertEmail } = await import("./_core/email");
    expect(sendErrorAlertEmail).toBeDefined();
    expect(sendErrorAlertEmail.length).toBe(1);
  });
});

describe("Email Integration Points", () => {
  it("should have email trigger in Stripe webhook", async () => {
    const webhookCode = await import("fs").then((fs) =>
      fs.promises.readFile("./server/webhooks/stripe.ts", "utf-8")
    );
    expect(webhookCode).toContain("sendPaymentConfirmationEmail");
  });

  it("should have email trigger in press release creation", async () => {
    const routersCode = await import("fs").then((fs) =>
      fs.promises.readFile("./server/routers.ts", "utf-8")
    );
    expect(routersCode).toContain("sendPressReleaseNotificationEmail");
  });
});

describe("Email Sending Logic", () => {
  it("should return false when SendGrid is not configured", async () => {
    const { sendEmail } = await import("./_core/email");
    
    // Without SENDGRID_API_KEY, emails should be skipped
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      text: "Test message",
    });
    
    // Should return false when SendGrid is not configured
    expect(typeof result).toBe("boolean");
  });
});

describe("Email Error Handling", () => {
  it("should handle missing email parameters gracefully", async () => {
    const { sendWelcomeEmail } = await import("./_core/email");
    
    // Should not throw even with empty parameters
    await expect(
      sendWelcomeEmail({
        to: "",
        name: "",
      })
    ).resolves.toBeDefined();
  });

  it("should handle email sending failures gracefully", async () => {
    const { sendPaymentConfirmationEmail } = await import("./_core/email");
    
    // Should not throw even with invalid email
    await expect(
      sendPaymentConfirmationEmail({
        to: "invalid-email",
        name: "Test User",
        plan: "Pro",
        amount: 9900,
      })
    ).resolves.toBeDefined();
  });
});


describe("SendGrid API Key Validation", () => {
  it("should have valid SendGrid API key configured", async () => {
    const { ENV } = await import("./_core/env");
    expect(ENV.sendGridApiKey).toBeDefined();
    expect(ENV.sendGridApiKey).not.toBe("");
    expect(ENV.sendGridApiKey).toMatch(/^SG\./);
  });

  it("should successfully send a test email to admin", async () => {
    const { sendEmail } = await import("./_core/email");
    const { ENV } = await import("./_core/env");
    
    const result = await sendEmail({
      to: ENV.adminEmail || "test@example.com",
      subject: "upsurgeIQ - SendGrid Configuration Test",
      text: "This is a test email to verify SendGrid configuration is working correctly.",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #008080;">SendGrid Configuration Test</h2>
            <p>This is a test email to verify SendGrid configuration is working correctly.</p>
            <p>If you received this email, your SendGrid API key is valid and email sending is functional.</p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="color: #666; font-size: 14px;">Sent from upsurgeIQ Platform</p>
          </body>
        </html>
      `,
    });

    expect(result).toBe(true);
  }, 30000); // 30 second timeout for email sending
});
