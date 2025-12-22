import { getDb } from "./db";
import { sendEmail } from "./email";
import { ENV } from "./_core/env";
import { eq, and, lt } from "drizzle-orm";
import { distributionSaves, users } from "../drizzle/schema";

/**
 * Save distribution for later
 */
export async function saveDistributionForLater(
  userId: number,
  pressReleaseId: number,
  mediaListIds: number[],
  scheduledFor?: Date
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db
    .insert(distributionSaves)
    .values({
      userId,
      pressReleaseId,
      mediaListIds: JSON.stringify(mediaListIds),
      scheduledFor: scheduledFor || null,
      reminderSent: false,
      completed: false,
    })
    .$returningId();

  return result.id;
}

/**
 * Get saved distributions for user
 */
export async function getSavedDistributions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const saves = await db
    .select()
    .from(distributionSaves)
    .where(and(eq(distributionSaves.userId, userId), eq(distributionSaves.completed, false)));

  return saves.map((save) => ({
    ...save,
    mediaListIds: JSON.parse(save.mediaListIds),
  }));
}

/**
 * Mark save as completed
 */
export async function markSaveCompleted(saveId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(distributionSaves)
    .set({
      completed: true,
      completedAt: new Date(),
    })
    .where(eq(distributionSaves.id, saveId));
}

/**
 * Check and send reminders for saved distributions (24hr after creation)
 */
export async function checkAndSendReminders(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Find saves that need reminders
  const savesNeedingReminders = await db
    .select()
    .from(distributionSaves)
    .where(
      and(
        eq(distributionSaves.reminderSent, false),
        eq(distributionSaves.completed, false),
        lt(distributionSaves.createdAt, twentyFourHoursAgo)
      )
    );

  for (const save of savesNeedingReminders) {
    // Get user info
    const [user] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, save.userId))
      .limit(1);

    if (user && user.email) {
      // Send reminder email
      await sendEmail({
        to: user.email,
        subject: "Reminder: Complete Your Press Release Distribution",
        html: `
          <h2>Press Release Distribution Reminder</h2>
          <p>Hi ${user.name || "there"},</p>
          <p>You saved a press release distribution 24 hours ago but haven't completed it yet.</p>
          <p>Don't forget to send your press release to maximize its impact!</p>
          <p><a href="${ENV.frontendUrl}/press-releases/distribute/${save.pressReleaseId}" style="display: inline-block; padding: 12px 24px; background-color: #008080; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">Complete Distribution</a></p>
          <p>Best regards,<br>The UpsurgeIQ Team</p>
        `,
      });

      // Mark reminder as sent
      await db
        .update(distributionSaves)
        .set({ reminderSent: true })
        .where(eq(distributionSaves.id, save.id));
    }
  }
}

/**
 * Cleanup old completed saves (older than 30 days)
 */
export async function cleanupOldSaves(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  await db
    .delete(distributionSaves)
    .where(and(eq(distributionSaves.completed, true), lt(distributionSaves.completedAt, thirtyDaysAgo)));
}
