import { getDb } from "./db";
import { creditUsage, creditAlertThresholds, creditAlertHistory } from "../drizzle/schema";
import { sql, gte, and } from "drizzle-orm";
import { sendEmail } from "./_core/email";

/**
 * Check credit usage against configured thresholds and send alerts
 * This should be called periodically (e.g., every hour via cron job)
 */
export async function checkCreditAlerts(): Promise<void> {
  console.log("[CostAlertChecker] Starting credit alert check...");

  const db = await getDb();
  if (!db) {
    console.error("[CostAlertChecker] Database unavailable");
    return;
  }

  try {
    // Get all active thresholds
    const thresholds = await db
      .select()
      .from(creditAlertThresholds)
      .where(sql`${creditAlertThresholds.isActive} = 1`);

    if (thresholds.length === 0) {
      console.log("[CostAlertChecker] No active thresholds configured");
      return;
    }

    for (const threshold of thresholds) {
      await checkThreshold(threshold);
    }

    console.log("[CostAlertChecker] Alert check completed");
  } catch (error) {
    console.error("[CostAlertChecker] Error checking alerts:", error);
  }
}

async function checkThreshold(threshold: any): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Calculate date range based on threshold type
  let startDate: Date | null = null;
  const now = new Date();

  switch (threshold.thresholdType) {
    case "daily":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "weekly":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case "monthly":
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "total":
      // No date filter for total
      break;
  }

  // Calculate total credits used in the period
  const query = db
    .select({
      total: sql<number>`COALESCE(SUM(CAST(${creditUsage.creditsUsed} AS DECIMAL(10,4))), 0)`,
    })
    .from(creditUsage);

  if (startDate) {
    query.where(gte(creditUsage.createdAt, startDate));
  }

  const [result] = await query;
  const creditsUsed = Number(result.total);
  const thresholdValue = Number(threshold.thresholdValue);

  console.log(`[CostAlertChecker] ${threshold.name}: ${creditsUsed}/${thresholdValue} credits`);

  // Check if threshold is breached
  if (creditsUsed >= thresholdValue) {
    // Check if we already sent an alert recently (avoid spam)
    const recentAlert = await db
      .select()
      .from(creditAlertHistory)
      .where(
        and(
          sql`${creditAlertHistory.thresholdId} = ${threshold.id}`,
          gte(creditAlertHistory.triggeredAt, startDate || new Date(0))
        )
      )
      .limit(1);

    if (recentAlert.length > 0) {
      console.log(`[CostAlertChecker] Alert already sent for ${threshold.name} in this period`);
      return;
    }

    // Send alert email
    await sendAlertEmail(threshold, creditsUsed, thresholdValue);

    // Record alert in history
    await db.insert(creditAlertHistory).values({
      thresholdId: threshold.id,
      triggeredAt: now,
      creditsUsed: creditsUsed.toString(),
      thresholdValue: thresholdValue.toString(),
      emailSent: 1,
      metadata: JSON.stringify({
        thresholdType: threshold.thresholdType,
        thresholdName: threshold.name,
      }),
    });

    console.log(`[CostAlertChecker] Alert sent for ${threshold.name}`);
  }
}

async function sendAlertEmail(threshold: any, creditsUsed: number, thresholdValue: number): Promise<void> {
  const emails = threshold.notifyEmails.split(",").map((e: string) => e.trim());
  const percentage = ((creditsUsed / thresholdValue) * 100).toFixed(1);

  const subject = `🚨 Manus Credit Alert: ${threshold.name} Threshold Reached`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Credit Usage Alert</h2>
      <p>Your Manus credit usage has reached the configured threshold.</p>
      
      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; color: #991b1b;">Alert Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Threshold Name:</strong></td>
            <td style="padding: 8px 0;">${threshold.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Type:</strong></td>
            <td style="padding: 8px 0;">${threshold.thresholdType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Credits Used:</strong></td>
            <td style="padding: 8px 0;">${creditsUsed.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Threshold:</strong></td>
            <td style="padding: 8px 0;">${thresholdValue.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Usage:</strong></td>
            <td style="padding: 8px 0; color: #dc2626; font-weight: bold;">${percentage}%</td>
          </tr>
        </table>
      </div>

      <p><strong>Recommended Actions:</strong></p>
      <ul>
        <li>Review your credit consumption in the admin dashboard</li>
        <li>Check which features are consuming the most credits</li>
        <li>Consider adjusting usage limits or tier restrictions</li>
        <li>Contact Manus support if costs are higher than expected</li>
      </ul>

      <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        This is an automated alert from your UpsurgeIQ platform. To manage alert settings, visit the admin dashboard.
      </p>
    </div>
  `;

  for (const email of emails) {
    try {
      await sendEmail({
        to: email,
        subject,
        html: htmlContent,
      });
      console.log(`[CostAlertChecker] Alert email sent to ${email}`);
    } catch (error) {
      console.error(`[CostAlertChecker] Failed to send alert to ${email}:`, error);
    }
  }
}

/**
 * Initialize default alert thresholds if none exist
 */
export async function initializeDefaultAlerts(adminEmail: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(creditAlertThresholds).limit(1);
  if (existing.length > 0) {
    console.log("[CostAlertChecker] Alert thresholds already configured");
    return;
  }

  // Create default thresholds
  await db.insert(creditAlertThresholds).values([
    {
      name: "Daily Credit Limit",
      thresholdType: "daily",
      thresholdValue: "100.00", // 100 credits per day
      isActive: 1,
      notifyEmails: adminEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Monthly Credit Budget",
      thresholdType: "monthly",
      thresholdValue: "2000.00", // 2000 credits per month
      isActive: 1,
      notifyEmails: adminEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log("[CostAlertChecker] Default alert thresholds created");
}
