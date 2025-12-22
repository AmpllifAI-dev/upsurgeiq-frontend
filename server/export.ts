import { getDb } from "./db";
import { pressReleases, campaigns, distributions } from "../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

/**
 * Export press releases to CSV
 */
export async function exportPressReleasesToCSV(
  businessId: number,
  options?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(pressReleases).where(eq(pressReleases.businessId, businessId));

  // Apply filters if provided
  const conditions = [eq(pressReleases.businessId, businessId)];
  if (options?.startDate) {
    conditions.push(gte(pressReleases.createdAt, options.startDate));
  }
  if (options?.endDate) {
    conditions.push(lte(pressReleases.createdAt, options.endDate));
  }
  if (options?.status) {
    conditions.push(eq(pressReleases.status, options.status as any));
  }

  const results = await db
    .select()
    .from(pressReleases)
    .where(and(...conditions));

  // Generate CSV
  const headers = ["ID", "Title", "Status", "Created At", "Updated At", "Body Preview"];
  const rows = results.map((pr) => [
    pr.id.toString(),
    `"${pr.title.replace(/"/g, '""')}"`,
    pr.status,
    pr.createdAt.toISOString(),
    pr.updatedAt.toISOString(),
    `"${pr.body.substring(0, 100).replace(/"/g, '""')}..."`,
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  return csv;
}

/**
 * Export campaigns to CSV
 */
export async function exportCampaignsToCSV(
  businessId: number,
  options?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [eq(campaigns.businessId, businessId)];
  if (options?.startDate) {
    conditions.push(gte(campaigns.createdAt, options.startDate));
  }
  if (options?.endDate) {
    conditions.push(lte(campaigns.createdAt, options.endDate));
  }
  if (options?.status) {
    conditions.push(eq(campaigns.status, options.status as any));
  }

  const results = await db
    .select()
    .from(campaigns)
    .where(and(...conditions));

  // Generate CSV
  const headers = ["ID", "Name", "Goal", "Budget", "Status", "Platforms", "Created At"];
  const rows = results.map((c) => [
    c.id.toString(),
    `"${c.name.replace(/"/g, '""')}"`,
    c.goal ? `"${c.goal.replace(/"/g, '""')}"` : "",
    c.budget?.toString() || "",
    c.status,
    c.platforms || "",
    c.createdAt.toISOString(),
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  return csv;
}

/**
 * Export analytics data to CSV
 */
export async function exportAnalyticsToCSV(
  businessId: number,
  options?: {
    startDate?: Date;
    endDate?: Date;
  }
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all press releases for this business
  const conditions = [eq(pressReleases.businessId, businessId)];
  if (options?.startDate) {
    conditions.push(gte(pressReleases.createdAt, options.startDate));
  }
  if (options?.endDate) {
    conditions.push(lte(pressReleases.createdAt, options.endDate));
  }

  const prs = await db
    .select()
    .from(pressReleases)
    .where(and(...conditions));

  // Get distribution stats for each press release
  const analyticsData = await Promise.all(
    prs.map(async (pr) => {
      const dists = await db
        .select()
        .from(distributions)
        .where(eq(distributions.pressReleaseId, pr.id));

      const totalSent = dists.filter((d) => d.status === "sent").length;
      const totalOpened = dists.filter((d) => d.openedAt !== null).length;
      const totalClicked = dists.filter((d) => d.clickedAt !== null).length;
      const totalOpenCount = dists.reduce((sum, d) => sum + d.openCount, 0);
      const totalClickCount = dists.reduce((sum, d) => sum + d.clickCount, 0);

      return {
        id: pr.id,
        title: pr.title,
        status: pr.status,
        createdAt: pr.createdAt,
        totalSent,
        totalOpened,
        totalClicked,
        openRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : "0",
        clickRate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(2) : "0",
        totalOpenCount,
        totalClickCount,
      };
    })
  );

  // Generate CSV
  const headers = [
    "Press Release ID",
    "Title",
    "Status",
    "Created At",
    "Total Sent",
    "Total Opened",
    "Total Clicked",
    "Open Rate (%)",
    "Click Rate (%)",
    "Total Opens",
    "Total Clicks",
  ];

  const rows = analyticsData.map((data) => [
    data.id.toString(),
    `"${data.title.replace(/"/g, '""')}"`,
    data.status,
    data.createdAt.toISOString(),
    data.totalSent.toString(),
    data.totalOpened.toString(),
    data.totalClicked.toString(),
    data.openRate,
    data.clickRate,
    data.totalOpenCount.toString(),
    data.totalClickCount.toString(),
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  return csv;
}
