/**
 * Scheduled job to automatically publish press releases when their scheduledFor time is reached
 * Runs every 5 minutes to check for releases ready to publish
 */

import { drizzle } from "drizzle-orm/mysql2";
import { pressReleases } from "../../drizzle/schema";
import { and, eq, lte, isNotNull, sql } from "drizzle-orm";
import type { PressRelease } from "../../drizzle/schema";
import * as schema from "../../drizzle/schema";

export async function publishScheduledReleases() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error(`[${new Date().toISOString()}] DATABASE_URL not configured`);
      return { published: 0, failed: 0, total: 0 };
    }

    const db = drizzle(process.env.DATABASE_URL, { schema, mode: "default" });
    const now = new Date();

    // Find all press releases that are:
    // 1. Status = "scheduled"
    // 2. scheduledFor <= now
    // 3. scheduledFor is not null
    const releasesToPublish = await db.query.pressReleases.findMany({
      where: and(
        eq(pressReleases.status, "scheduled"),
        lte(pressReleases.scheduledFor, now),
        isNotNull(pressReleases.scheduledFor)
      ),
    });

    if (releasesToPublish.length === 0) {
      console.log(`[${new Date().toISOString()}] No scheduled releases ready to publish`);
      return { published: 0 };
    }

    console.log(
      `[${new Date().toISOString()}] Found ${releasesToPublish.length} releases ready to publish`
    );

    // Update each release to published status
    const publishResults = await Promise.allSettled(
      releasesToPublish.map(async (release: PressRelease) => {
        try {
          await db
            .update(pressReleases)
            .set({
              status: "published",
              publishedAt: now,
            })
            .where(eq(pressReleases.id, release.id));

          console.log(
            `[${new Date().toISOString()}] Published press release ID ${release.id}: "${release.title}"`
          );

          return { id: release.id, title: release.title, success: true };
        } catch (error) {
          console.error(
            `[${new Date().toISOString()}] Failed to publish press release ID ${release.id}:`,
            error
          );
          return { id: release.id, title: release.title, success: false, error };
        }
      })
    );

    const successCount = publishResults.filter((r: PromiseSettledResult<any>) => r.status === "fulfilled").length;
    const failureCount = publishResults.filter((r: PromiseSettledResult<any>) => r.status === "rejected").length;

    console.log(
      `[${new Date().toISOString()}] Publishing complete: ${successCount} succeeded, ${failureCount} failed`
    );

    return {
      published: successCount,
      failed: failureCount,
      total: releasesToPublish.length,
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in publishScheduledReleases job:`, error);
    throw error;
  }
}

// Run the job every 5 minutes
export function startScheduledPublishingJob() {
  const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  console.log(
    `[${new Date().toISOString()}] Starting scheduled press release publishing job (every 5 minutes)`
  );

  // Run immediately on startup
  publishScheduledReleases().catch((error) => {
    console.error(`[${new Date().toISOString()}] Initial job run failed:`, error);
  });

  // Then run every 5 minutes
  setInterval(() => {
    publishScheduledReleases().catch((error) => {
      console.error(`[${new Date().toISOString()}] Scheduled job run failed:`, error);
    });
  }, INTERVAL_MS);
}
