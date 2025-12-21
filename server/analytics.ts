import { getDb } from "./db";
import { userEvents, leadScores, segmentMembers, userSegments } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Track a user event (page view, download, interaction, etc.)
 */
export async function trackEvent(params: {
  sessionId: string;
  userId?: number;
  eventType: "page_view" | "resource_download" | "blog_read" | "case_study_view" | "newsletter_signup" | "form_submit" | "cta_click" | "video_play" | "external_link_click";
  eventData?: Record<string, any>;
  pageUrl?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Insert event
  await db.insert(userEvents).values({
    sessionId: params.sessionId,
    userId: params.userId,
    eventType: params.eventType,
    eventData: params.eventData,
    pageUrl: params.pageUrl,
    referrer: params.referrer,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
  });

  // Update lead score based on event
  await updateLeadScore(params.sessionId, params.eventType, params.userId);

  // Check and update segment membership
  await updateSegmentMembership(params.sessionId, params.userId);

  return { success: true };
}

/**
 * Update lead score based on event type
 */
async function updateLeadScore(
  sessionId: string,
  eventType: string,
  userId?: number
) {
  const db = await getDb();
  if (!db) return;

  // Score mapping for different events
  const scoreMap: Record<string, number> = {
    page_view: 1,
    blog_read: 5,
    resource_download: 10,
    case_study_view: 8,
    newsletter_signup: 15,
    form_submit: 20,
    cta_click: 7,
    video_play: 6,
    external_link_click: 2,
  };

  const points = scoreMap[eventType] || 0;

  // Get existing lead score
  const existing = await db
    .select()
    .from(leadScores)
    .where(eq(leadScores.sessionId, sessionId))
    .limit(1);

  if (existing.length > 0) {
    // Update existing score
    const newScore = existing[0].score + points;
    const newTier = calculateTier(newScore);

    await db
      .update(leadScores)
      .set({
        score: newScore,
        tier: newTier,
        lastActivityAt: new Date(),
        userId: userId || existing[0].userId,
      })
      .where(eq(leadScores.sessionId, sessionId));
  } else {
    // Create new lead score
    await db.insert(leadScores).values({
      sessionId,
      userId,
      score: points,
      tier: calculateTier(points),
      lastActivityAt: new Date(),
    });
  }
}

/**
 * Calculate lead tier based on score
 */
function calculateTier(score: number): "cold" | "warm" | "hot" | "qualified" {
  if (score >= 50) return "qualified";
  if (score >= 30) return "hot";
  if (score >= 15) return "warm";
  return "cold";
}

/**
 * Update segment membership based on user behaviour
 */
async function updateSegmentMembership(sessionId: string, userId?: number) {
  const db = await getDb();
  if (!db) return;

  // Get all active segments
  const segments = await db
    .select()
    .from(userSegments)
    .where(eq(userSegments.isActive, 1));

  for (const segment of segments) {
    const rules = segment.rules as any;
    const shouldBeMember = await evaluateSegmentRules(sessionId, userId, rules);

    // Check if already a member
    const existing = await db
      .select()
      .from(segmentMembers)
      .where(
        and(
          eq(segmentMembers.segmentId, segment.id),
          eq(segmentMembers.sessionId, sessionId)
        )
      )
      .limit(1);

    if (shouldBeMember && existing.length === 0) {
      // Add to segment
      await db.insert(segmentMembers).values({
        segmentId: segment.id,
        sessionId,
        userId,
      });
    }
  }
}

/**
 * Evaluate segment rules to determine membership
 */
async function evaluateSegmentRules(
  sessionId: string,
  userId: number | undefined,
  rules: any
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Example rule structure:
  // {
  //   type: "event_count",
  //   eventType: "resource_download",
  //   operator: ">=",
  //   value: 2
  // }

  if (rules.type === "event_count") {
    const events = await db
      .select({ count: sql<number>`count(*)` })
      .from(userEvents)
      .where(
        and(
          eq(userEvents.sessionId, sessionId),
          eq(userEvents.eventType, rules.eventType)
        )
      );

    const count = events[0]?.count || 0;

    switch (rules.operator) {
      case ">=":
        return count >= rules.value;
      case ">":
        return count > rules.value;
      case "=":
        return count === rules.value;
      case "<":
        return count < rules.value;
      case "<=":
        return count <= rules.value;
      default:
        return false;
    }
  }

  if (rules.type === "lead_score") {
    const leadScore = await db
      .select()
      .from(leadScores)
      .where(eq(leadScores.sessionId, sessionId))
      .limit(1);

    if (leadScore.length === 0) return false;

    const score = leadScore[0].score;

    switch (rules.operator) {
      case ">=":
        return score >= rules.value;
      case ">":
        return score > rules.value;
      case "=":
        return score === rules.value;
      case "<":
        return score < rules.value;
      case "<=":
        return score <= rules.value;
      default:
        return false;
    }
  }

  return false;
}

/**
 * Get user journey (event history)
 */
export async function getUserJourney(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const events = await db
    .select()
    .from(userEvents)
    .where(eq(userEvents.sessionId, sessionId))
    .orderBy(desc(userEvents.createdAt));

  return events;
}

/**
 * Get lead score for a session
 */
export async function getLeadScore(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const score = await db
    .select()
    .from(leadScores)
    .where(eq(leadScores.sessionId, sessionId))
    .limit(1);

  return score[0] || null;
}

/**
 * Get all segments for a session
 */
export async function getUserSegments(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const segments = await db
    .select({
      id: userSegments.id,
      name: userSegments.name,
      description: userSegments.description,
      addedAt: segmentMembers.addedAt,
    })
    .from(segmentMembers)
    .innerJoin(userSegments, eq(segmentMembers.segmentId, userSegments.id))
    .where(eq(segmentMembers.sessionId, sessionId));

  return segments;
}

/**
 * Get analytics summary
 */
export async function getAnalyticsSummary() {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const totalEvents = await db
    .select({ count: sql<number>`count(*)` })
    .from(userEvents);

  const totalLeads = await db
    .select({ count: sql<number>`count(*)` })
    .from(leadScores);

  const hotLeads = await db
    .select({ count: sql<number>`count(*)` })
    .from(leadScores)
    .where(eq(leadScores.tier, "hot"));

  const qualifiedLeads = await db
    .select({ count: sql<number>`count(*)` })
    .from(leadScores)
    .where(eq(leadScores.tier, "qualified"));

  return {
    totalEvents: totalEvents[0]?.count || 0,
    totalLeads: totalLeads[0]?.count || 0,
    hotLeads: hotLeads[0]?.count || 0,
    qualifiedLeads: qualifiedLeads[0]?.count || 0,
  };
}

/**
 * Get top pages by views
 */
export async function getTopPages(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const pages = await db
    .select({
      pageUrl: userEvents.pageUrl,
      views: sql<number>`count(*)`,
    })
    .from(userEvents)
    .where(eq(userEvents.eventType, "page_view"))
    .groupBy(userEvents.pageUrl)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return pages;
}
