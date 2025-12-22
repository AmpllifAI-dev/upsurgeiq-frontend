import { getDb } from "./db";
import { pressReleases, campaigns, socialMediaPosts, pressReleaseDistributions } from "../drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[], headers: string[]): string {
  if (data.length === 0) {
    return headers.join(",") + "\n";
  }

  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(","));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return "";
      }
      
      // Handle dates
      if (value instanceof Date) {
        return value.toISOString();
      }
      
      // Handle strings with commas or quotes
      if (typeof value === "string") {
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }
      
      return String(value);
    });
    
    csvRows.push(values.join(","));
  }
  
  return csvRows.join("\n");
}

/**
 * Export press release analytics to CSV
 */
export async function exportPressReleaseAnalytics(
  userId: number,
  startDate?: Date,
  endDate?: Date
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Build where condition
  const whereCondition = startDate && endDate
    ? and(
        eq(pressReleases.userId, userId),
        gte(pressReleases.createdAt, startDate),
        lte(pressReleases.createdAt, endDate)
      )
    : eq(pressReleases.userId, userId);

  const results = await db
    .select({
      id: pressReleases.id,
      title: pressReleases.title,
      status: pressReleases.status,
      createdAt: pressReleases.createdAt,
      publishedAt: pressReleases.publishedAt,
      totalSent: sql<number>`(
        SELECT COALESCE(SUM(${pressReleaseDistributions.recipientCount}), 0)
        FROM ${pressReleaseDistributions}
        WHERE ${pressReleaseDistributions.pressReleaseId} = ${pressReleases.id}
      )`,
      totalOpened: sql<number>`(
        SELECT COUNT(*)
        FROM ${pressReleaseDistributions}
        WHERE ${pressReleaseDistributions.pressReleaseId} = ${pressReleases.id}
        AND ${pressReleaseDistributions.openCount} > 0
      )`,
      totalClicked: sql<number>`(
        SELECT COUNT(*)
        FROM ${pressReleaseDistributions}
        WHERE ${pressReleaseDistributions.pressReleaseId} = ${pressReleases.id}
        AND ${pressReleaseDistributions.clickCount} > 0
      )`,
      totalOpenCount: sql<number>`(
        SELECT COALESCE(SUM(${pressReleaseDistributions.openCount}), 0)
        FROM ${pressReleaseDistributions}
        WHERE ${pressReleaseDistributions.pressReleaseId} = ${pressReleases.id}
      )`,
      totalClickCount: sql<number>`(
        SELECT COALESCE(SUM(${pressReleaseDistributions.clickCount}), 0)
        FROM ${pressReleaseDistributions}
        WHERE ${pressReleaseDistributions.pressReleaseId} = ${pressReleases.id}
      )`,
    })
    .from(pressReleases)
    .where(whereCondition);

  // Calculate rates
  const data = results.map((row) => {
    const totalSent = Number(row.totalSent) || 0;
    const totalOpened = Number(row.totalOpened) || 0;
    const totalClicked = Number(row.totalClicked) || 0;
    
    return {
      id: row.id,
      title: row.title,
      status: row.status,
      createdAt: row.createdAt,
      publishedAt: row.publishedAt || "",
      totalSent,
      totalOpened,
      totalClicked,
      openRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : "0.00",
      clickRate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(2) : "0.00",
      totalOpenCount: row.totalOpenCount,
      totalClickCount: row.totalClickCount,
    };
  });

  const headers = [
    "id",
    "title",
    "status",
    "createdAt",
    "publishedAt",
    "totalSent",
    "totalOpened",
    "totalClicked",
    "openRate",
    "clickRate",
    "totalOpenCount",
    "totalClickCount",
  ];

  return arrayToCSV(data, headers);
}

/**
 * Export campaign analytics to CSV
 */
export async function exportCampaignAnalytics(
  userId: number,
  startDate?: Date,
  endDate?: Date
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Build where condition
  const whereCondition = startDate && endDate
    ? and(
        eq(campaigns.userId, userId),
        gte(campaigns.createdAt, startDate),
        lte(campaigns.createdAt, endDate)
      )
    : eq(campaigns.userId, userId);

  const results = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      status: campaigns.status,
      goal: campaigns.goal,
      budget: campaigns.budget,
      startDate: campaigns.startDate,
      endDate: campaigns.endDate,
      createdAt: campaigns.createdAt,
    })
    .from(campaigns)
    .where(whereCondition);

  const data = results.map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    goal: row.goal || "",
    budget: row.budget || "",
    startDate: row.startDate || "",
    endDate: row.endDate || "",
    createdAt: row.createdAt,
  }));

  const headers = [
    "id",
    "name",
    "status",
    "goal",
    "budget",
    "startDate",
    "endDate",
    "createdAt",
  ];

  return arrayToCSV(data, headers);
}

/**
 * Export social media analytics to CSV
 */
export async function exportSocialMediaAnalytics(
  userId: number,
  startDate?: Date,
  endDate?: Date
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // First get user's business IDs
  const { businesses } = await import("../drizzle/schema");
  const userBusinesses = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.userId, userId));

  const businessIds = userBusinesses.map(b => b.id);

  if (businessIds.length === 0) {
    return arrayToCSV([], [
      "id",
      "platform",
      "content",
      "status",
      "scheduledFor",
      "publishedAt",
      "createdAt",
    ]);
  }

  // Build where condition
  const whereCondition = startDate && endDate
    ? and(
        sql`${socialMediaPosts.businessId} IN (${sql.join(businessIds.map(id => sql`${id}`), sql`, `)})`,
        gte(socialMediaPosts.createdAt, startDate),
        lte(socialMediaPosts.createdAt, endDate)
      )
    : sql`${socialMediaPosts.businessId} IN (${sql.join(businessIds.map(id => sql`${id}`), sql`, `)})`;

  const results = await db
    .select({
      id: socialMediaPosts.id,
      platform: socialMediaPosts.platform,
      content: socialMediaPosts.content,
      status: socialMediaPosts.status,
      scheduledFor: socialMediaPosts.scheduledFor,
      publishedAt: socialMediaPosts.publishedAt,
      createdAt: socialMediaPosts.createdAt,
    })
    .from(socialMediaPosts)
    .where(whereCondition);

  const data = results.map((row) => ({
    id: row.id,
    platform: row.platform,
    content: row.content,
    status: row.status,
    scheduledFor: row.scheduledFor || "",
    publishedAt: row.publishedAt || "",
    createdAt: row.createdAt,
  }));

  const headers = [
    "id",
    "platform",
    "content",
    "status",
    "scheduledFor",
    "publishedAt",
    "createdAt",
  ];

  return arrayToCSV(data, headers);
}

/**
 * Export combined analytics summary to CSV
 */
export async function exportAnalyticsSummary(
  userId: number,
  startDate?: Date,
  endDate?: Date
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get counts for each content type
  const pressReleaseCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(pressReleases)
    .where(
      startDate && endDate
        ? and(
            eq(pressReleases.userId, userId),
            gte(pressReleases.createdAt, startDate),
            lte(pressReleases.createdAt, endDate)
          )
        : eq(pressReleases.userId, userId)
    );

  const campaignCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(campaigns)
    .where(
      startDate && endDate
        ? and(
            eq(campaigns.userId, userId),
            gte(campaigns.createdAt, startDate),
            lte(campaigns.createdAt, endDate)
          )
        : eq(campaigns.userId, userId)
    );

  // Get user's business IDs for social media count
  const { businesses: businessesTable } = await import("../drizzle/schema");
  const userBusinesses = await db
    .select({ id: businessesTable.id })
    .from(businessesTable)
    .where(eq(businessesTable.userId, userId));

  const businessIds = userBusinesses.map(b => b.id);

  let socialMediaCount = [{ count: 0 }];
  if (businessIds.length > 0) {
    socialMediaCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(socialMediaPosts)
      .where(
        startDate && endDate
          ? and(
              sql`${socialMediaPosts.businessId} IN (${sql.join(businessIds.map(id => sql`${id}`), sql`, `)})`,
              gte(socialMediaPosts.createdAt, startDate),
              lte(socialMediaPosts.createdAt, endDate)
            )
          : sql`${socialMediaPosts.businessId} IN (${sql.join(businessIds.map(id => sql`${id}`), sql`, `)})`
      );
  }

  const data = [
    {
      metric: "Press Releases",
      count: Number(pressReleaseCount[0]?.count) || 0,
      period: startDate && endDate 
        ? `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`
        : "All Time",
    },
    {
      metric: "Campaigns",
      count: Number(campaignCount[0]?.count) || 0,
      period: startDate && endDate 
        ? `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`
        : "All Time",
    },
    {
      metric: "Social Media Posts",
      count: Number(socialMediaCount[0]?.count) || 0,
      period: startDate && endDate 
        ? `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`
        : "All Time",
    },
  ];

  const headers = ["metric", "count", "period"];

  return arrayToCSV(data, headers);
}
