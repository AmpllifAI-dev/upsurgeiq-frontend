import { getDb } from "./db";
import { emailWorkflows, workflowSteps } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Create or update the default welcome workflow template
 */
export async function initializeWelcomeWorkflow() {
  const db = await getDb();
  if (!db) {
    console.error("[Welcome Workflow] Database not available");
    return null;
  }

  // Check if welcome workflow already exists
  const [existing] = await db
    .select()
    .from(emailWorkflows)
    .where(eq(emailWorkflows.name, "Welcome Series"))
    .limit(1);

  if (existing) {
    console.log("[Welcome Workflow] Template already exists");
    return existing.id;
  }

  // Create welcome workflow
  const [workflow] = await db.insert(emailWorkflows).values({
    name: "Welcome Series",
    description: "Automated welcome email sequence for new subscribers",
    triggerType: "subscription",
    isActive: 0, // Inactive by default - user must activate
    status: "draft",
    createdAt: new Date(),
  });

  const workflowId = workflow.insertId;

  // Create workflow steps
  const steps = [
    {
      workflowId,
      stepOrder: 1,
      name: "Welcome Email",
      subject: "Welcome to UpsurgeIQ! 🎉",
      emailTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #0891b2; color: white; padding: 40px 20px; text-align: center; }
            .body { padding: 40px 30px; }
            .cta-button { display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 24px 0; font-weight: 600; }
            .footer { background-color: #f5f5f5; padding: 24px 30px; text-align: center; font-size: 13px; color: #666; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Welcome to UpsurgeIQ!</h1>
            </div>
            <div class="body">
              <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi there,</p>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Thank you for subscribing to our newsletter! We're excited to have you as part of our community.
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Over the next few days, we'll share valuable insights about PR, marketing, and AI-powered content creation 
                to help you amplify your brand's voice.
              </p>
              <div style="text-align: center;">
                <a href="https://upsurgeiq.com/blog" class="cta-button">Explore Our Blog</a>
              </div>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Looking forward to connecting with you!
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Best regards,<br>
                The UpsurgeIQ Team
              </p>
            </div>
            <div class="footer">
              <p>© 2025 UpsurgeIQ. All rights reserved.</p>
              <p><a href="{{unsubscribe_url}}" style="color: #0891b2;">Unsubscribe</a> | <a href="{{preferences_url}}" style="color: #0891b2;">Manage Preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      delayDays: 0,
      delayHours: 0,
      createdAt: new Date(),
    },
    {
      workflowId,
      stepOrder: 2,
      name: "Getting Started Guide",
      subject: "Your Quick Start Guide to PR Success",
      emailTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #0891b2; color: white; padding: 30px 20px; text-align: center; }
            .body { padding: 40px 30px; }
            .tip-box { background-color: #f0f9ff; border-left: 4px solid: #0891b2; padding: 16px; margin: 20px 0; }
            .cta-button { display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 24px 0; font-weight: 600; }
            .footer { background-color: #f5f5f5; padding: 24px 30px; text-align: center; font-size: 13px; color: #666; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Your PR Quick Start Guide</h1>
            </div>
            <div class="body">
              <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi again!</p>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Ready to amplify your brand's voice? Here are three quick tips to get started with effective PR:
              </p>
              <div class="tip-box">
                <h3 style="margin-top: 0; color: #0891b2;">1. Craft Compelling Stories</h3>
                <p style="margin-bottom: 0;">Focus on what makes your news valuable to journalists and their audiences.</p>
              </div>
              <div class="tip-box">
                <h3 style="margin-top: 0; color: #0891b2;">2. Build Media Relationships</h3>
                <p style="margin-bottom: 0;">Connect with journalists who cover your industry before you need them.</p>
              </div>
              <div class="tip-box">
                <h3 style="margin-top: 0; color: #0891b2;">3. Measure Your Impact</h3>
                <p style="margin-bottom: 0;">Track opens, clicks, and coverage to refine your strategy.</p>
              </div>
              <div style="text-align: center;">
                <a href="https://upsurgeiq.com/resources" class="cta-button">Download Free Resources</a>
              </div>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Stay tuned for more insights!
              </p>
            </div>
            <div class="footer">
              <p>© 2025 UpsurgeIQ. All rights reserved.</p>
              <p><a href="{{unsubscribe_url}}" style="color: #0891b2;">Unsubscribe</a> | <a href="{{preferences_url}}" style="color: #0891b2;">Manage Preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      delayDays: 2,
      delayHours: 0,
      createdAt: new Date(),
    },
    {
      workflowId,
      stepOrder: 3,
      name: "Case Study Showcase",
      subject: "See How Companies Like Yours Get Results",
      emailTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #0891b2; color: white; padding: 30px 20px; text-align: center; }
            .body { padding: 40px 30px; }
            .stat { text-align: center; padding: 20px; background-color: #f0f9ff; border-radius: 8px; margin: 16px 0; }
            .stat-number { font-size: 36px; font-weight: bold; color: #0891b2; margin: 0; }
            .stat-label { font-size: 14px; color: #666; margin: 8px 0 0 0; }
            .cta-button { display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 24px 0; font-weight: 600; }
            .footer { background-color: #f5f5f5; padding: 24px 30px; text-align: center; font-size: 13px; color: #666; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Real Results from Real Companies</h1>
            </div>
            <div class="body">
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Curious about what's possible with AI-powered PR? Here's what our customers achieve:
              </p>
              <div class="stat">
                <p class="stat-number">3x</p>
                <p class="stat-label">More Media Coverage</p>
              </div>
              <div class="stat">
                <p class="stat-number">60%</p>
                <p class="stat-label">Time Saved on Content Creation</p>
              </div>
              <div class="stat">
                <p class="stat-number">10x</p>
                <p class="stat-label">ROI on PR Campaigns</p>
              </div>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Ready to see similar results for your brand?
              </p>
              <div style="text-align: center;">
                <a href="https://upsurgeiq.com/case-studies" class="cta-button">Read Case Studies</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 UpsurgeIQ. All rights reserved.</p>
              <p><a href="{{unsubscribe_url}}" style="color: #0891b2;">Unsubscribe</a> | <a href="{{preferences_url}}" style="color: #0891b2;">Manage Preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      delayDays: 5,
      delayHours: 0,
      createdAt: new Date(),
    },
    {
      workflowId,
      stepOrder: 4,
      name: "Special Offer",
      subject: "Exclusive Offer: Start Your PR Journey Today",
      emailTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #0891b2; color: white; padding: 30px 20px; text-align: center; }
            .body { padding: 40px 30px; }
            .offer-box { background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 32px; border-radius: 12px; text-align: center; margin: 24px 0; }
            .cta-button { display: inline-block; background-color: #10b981; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; margin: 24px 0; font-weight: 600; font-size: 18px; }
            .footer { background-color: #f5f5f5; padding: 24px 30px; text-align: center; font-size: 13px; color: #666; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Ready to Get Started?</h1>
            </div>
            <div class="body">
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                We've loved having you as part of our community this week!
              </p>
              <div class="offer-box">
                <h2 style="margin-top: 0; font-size: 28px;">Special Welcome Offer</h2>
                <p style="font-size: 18px; margin: 16px 0;">Get 20% off your first month</p>
                <p style="font-size: 14px; opacity: 0.9;">Use code: WELCOME20</p>
              </div>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Start creating professional press releases, building media lists, and tracking your PR success—all in one platform.
              </p>
              <div style="text-align: center;">
                <a href="https://upsurgeiq.com/pricing" class="cta-button">Get Started Now</a>
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #666; text-align: center;">
                Offer expires in 48 hours
              </p>
            </div>
            <div class="footer">
              <p>© 2025 UpsurgeIQ. All rights reserved.</p>
              <p><a href="{{unsubscribe_url}}" style="color: #0891b2;">Unsubscribe</a> | <a href="{{preferences_url}}" style="color: #0891b2;">Manage Preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      delayDays: 7,
      delayHours: 0,
      createdAt: new Date(),
    },
  ];

  await db.insert(workflowSteps).values(steps);

  console.log(`[Welcome Workflow] Template created with ID: ${workflowId}`);
  return workflowId;
}
