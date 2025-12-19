import { getDb } from "./db";
import { distributions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Track email open event
 * Called when tracking pixel is loaded
 */
export async function trackEmailOpen(trackingId: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result = await db.select().from(distributions).where(eq(distributions.trackingId, trackingId)).limit(1);
    const distribution = result.length > 0 ? result[0] : null;

    if (!distribution) {
      return { success: false, error: "Distribution not found" };
    }

    // Only update if this is the first open
    if (!distribution.openedAt) {
      await db
        .update(distributions)
        .set({
          openedAt: new Date(),
          openCount: 1,
          updatedAt: new Date(),
        })
        .where(eq(distributions.trackingId, trackingId));
    } else {
      // Increment open count for subsequent opens
      await db
        .update(distributions)
        .set({
          openCount: distribution.openCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(distributions.trackingId, trackingId));
    }

    return { success: true };
  } catch (error) {
    console.error("[trackEmailOpen] Error:", error);
    return { success: false, error: "Failed to track email open" };
  }
}

/**
 * Track link click event
 * Called when a tracked link is clicked
 */
export async function trackLinkClick(trackingId: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result = await db.select().from(distributions).where(eq(distributions.trackingId, trackingId)).limit(1);
    const distribution = result.length > 0 ? result[0] : null;

    if (!distribution) {
      return { success: false, error: "Distribution not found" };
    }

    // Only update if this is the first click
    if (!distribution.clickedAt) {
      await db
        .update(distributions)
        .set({
          clickedAt: new Date(),
          clickCount: 1,
          updatedAt: new Date(),
        })
        .where(eq(distributions.trackingId, trackingId));
    } else {
      // Increment click count for subsequent clicks
      await db
        .update(distributions)
        .set({
          clickCount: distribution.clickCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(distributions.trackingId, trackingId));
    }

    return { success: true };
  } catch (error) {
    console.error("[trackLinkClick] Error:", error);
    return { success: false, error: "Failed to track link click" };
  }
}

/**
 * Generate tracking pixel URL
 */
export function getTrackingPixelUrl(trackingId: string, baseUrl: string): string {
  return `${baseUrl}/api/track/open/${trackingId}`;
}

/**
 * Generate tracked link URL
 */
export function getTrackedLinkUrl(trackingId: string, originalUrl: string, baseUrl: string): string {
  const encodedUrl = encodeURIComponent(originalUrl);
  return `${baseUrl}/api/track/click/${trackingId}?url=${encodedUrl}`;
}

/**
 * Get engagement statistics for a press release
 */
export async function getPressReleaseEngagement(pressReleaseId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const allDistributions = await db.select().from(distributions).where(eq(distributions.pressReleaseId, pressReleaseId));

    const totalSent = allDistributions.filter((d: any) => d.status === "sent").length;
    const totalOpened = allDistributions.filter((d: any) => d.openedAt !== null).length;
    const totalClicked = allDistributions.filter((d: any) => d.clickedAt !== null).length;
    const totalOpenCount = allDistributions.reduce((sum: number, d: any) => sum + d.openCount, 0);
    const totalClickCount = allDistributions.reduce((sum: number, d: any) => sum + d.clickCount, 0);

    return {
      totalSent,
      totalOpened,
      totalClicked,
      openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
      totalOpenCount,
      totalClickCount,
      distributions: allDistributions,
    };
  } catch (error) {
    console.error("[getPressReleaseEngagement] Error:", error);
    throw error;
  }
}
