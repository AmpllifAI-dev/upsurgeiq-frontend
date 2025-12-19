import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { pressReleaseDistributions, InsertPressReleaseDistribution } from "../drizzle/schema";

export async function createDistribution(data: InsertPressReleaseDistribution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [distribution] = await db.insert(pressReleaseDistributions).values(data).$returningId();
  return distribution;
}

export async function getDistributionsByPressRelease(pressReleaseId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(pressReleaseDistributions)
    .where(eq(pressReleaseDistributions.pressReleaseId, pressReleaseId))
    .orderBy(desc(pressReleaseDistributions.createdAt));
}

export async function updateDistributionStats(
  id: number,
  stats: { openCount?: number; clickCount?: number }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(pressReleaseDistributions)
    .set(stats)
    .where(eq(pressReleaseDistributions.id, id));
}

export async function markDistributionSent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(pressReleaseDistributions)
    .set({
      status: "sent",
      sentAt: new Date(),
    })
    .where(eq(pressReleaseDistributions.id, id));
}


export async function sendDistribution(distributionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get distribution details
  const [distribution] = await db
    .select()
    .from(pressReleaseDistributions)
    .where(eq(pressReleaseDistributions.id, distributionId));

  if (!distribution) {
    throw new Error("Distribution not found");
  }

  // TODO: Implement actual email sending logic
  // This will involve:
  // 1. Get press release content
  // 2. Get media list contacts
  // 3. Send emails to each contact
  // 4. Track sending status

  // For now, just mark as sent
  await markDistributionSent(distributionId);
  
  return distribution;
}
