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
