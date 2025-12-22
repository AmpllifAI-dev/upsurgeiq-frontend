import { getDb } from "./db";
import {
  journalists,
  mediaOutlets,
  journalistBeats,
  journalistBeatRelations,
  journalistTags,
  journalistTagRelations,
  journalistOutreach,
  type Journalist,
  type InsertJournalist,
  type MediaOutlet,
  type InsertMediaOutlet,
  type JournalistBeat,
  type InsertJournalistBeat,
  type JournalistTag,
  type InsertJournalistTag,
  type JournalistOutreach,
  type InsertJournalistOutreach,
} from "../drizzle/schema";
import { eq, and, like, or, inArray, desc } from "drizzle-orm";

// ========================================
// JOURNALIST CRUD
// ========================================

export async function createJournalist(data: InsertJournalist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(journalists).values(data);
  return result.insertId;
}

export async function getJournalistById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [journalist] = await db
    .select()
    .from(journalists)
    .where(eq(journalists.id, id));
  return journalist;
}

export async function getJournalistsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(journalists)
    .where(eq(journalists.userId, userId))
    .orderBy(desc(journalists.createdAt));
}

export async function updateJournalist(id: number, data: Partial<InsertJournalist>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(journalists)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(journalists.id, id));
}

export async function deleteJournalist(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(journalists).where(eq(journalists.id, id));
}

// ========================================
// JOURNALIST SEARCH & FILTERING
// ========================================

export async function searchJournalists(userId: number, query: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(journalists)
    .where(
      and(
        eq(journalists.userId, userId),
        or(
          like(journalists.firstName, `%${query}%`),
          like(journalists.lastName, `%${query}%`),
          like(journalists.email, `%${query}%`),
          like(journalists.title, `%${query}%`)
        )
      )
    )
    .orderBy(desc(journalists.createdAt));
}

export async function getJournalistsByOutlet(userId: number, outletId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(journalists)
    .where(
      and(
        eq(journalists.userId, userId),
        eq(journalists.mediaOutletId, outletId)
      )
    )
    .orderBy(desc(journalists.createdAt));
}

export async function getJournalistsByBeat(userId: number, beatId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const relations = await db
    .select({ journalistId: journalistBeatRelations.journalistId })
    .from(journalistBeatRelations)
    .where(eq(journalistBeatRelations.beatId, beatId));

  if (relations.length === 0) return [];

  const journalistIds = relations.map((r: { journalistId: number }) => r.journalistId);

  return db
    .select()
    .from(journalists)
    .where(
      and(
        eq(journalists.userId, userId),
        inArray(journalists.id, journalistIds)
      )
    )
    .orderBy(desc(journalists.createdAt));
}

export async function getJournalistsByTag(userId: number, tagId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const relations = await db
    .select({ journalistId: journalistTagRelations.journalistId })
    .from(journalistTagRelations)
    .where(eq(journalistTagRelations.tagId, tagId));

  if (relations.length === 0) return [];

  const journalistIds = relations.map((r: { journalistId: number }) => r.journalistId);

  return db
    .select()
    .from(journalists)
    .where(
      and(
        eq(journalists.userId, userId),
        inArray(journalists.id, journalistIds)
      )
    )
    .orderBy(desc(journalists.createdAt));
}

// ========================================
// JOURNALIST BEATS
// ========================================

export async function createBeat(data: InsertJournalistBeat) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(journalistBeats).values(data);
  return result.insertId;
}

export async function getAllBeats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(journalistBeats).orderBy(journalistBeats.name);
}

export async function getBeatsByJournalist(journalistId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const relations = await db
    .select({ beatId: journalistBeatRelations.beatId })
    .from(journalistBeatRelations)
    .where(eq(journalistBeatRelations.journalistId, journalistId));

  if (relations.length === 0) return [];

  const beatIds = relations.map((r: { beatId: number }) => r.beatId);

  return db
    .select()
    .from(journalistBeats)
    .where(inArray(journalistBeats.id, beatIds));
}

export async function assignBeatToJournalist(journalistId: number, beatId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(journalistBeatRelations).values({
    journalistId,
    beatId,
  });
}

export async function removeBeatFromJournalist(journalistId: number, beatId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(journalistBeatRelations)
    .where(
      and(
        eq(journalistBeatRelations.journalistId, journalistId),
        eq(journalistBeatRelations.beatId, beatId)
      )
    );
}

// ========================================
// JOURNALIST TAGS
// ========================================

export async function createTag(data: InsertJournalistTag) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(journalistTags).values(data);
  return result.insertId;
}

export async function getAllTags() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(journalistTags).orderBy(journalistTags.name);
}

export async function getTagsByJournalist(journalistId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const relations = await db
    .select({ tagId: journalistTagRelations.tagId })
    .from(journalistTagRelations)
    .where(eq(journalistTagRelations.journalistId, journalistId));

  if (relations.length === 0) return [];

  const tagIds = relations.map((r: { tagId: number }) => r.tagId);

  return db
    .select()
    .from(journalistTags)
    .where(inArray(journalistTags.id, tagIds));
}

export async function assignTagToJournalist(journalistId: number, tagId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(journalistTagRelations).values({
    journalistId,
    tagId,
  });
}

export async function removeTagFromJournalist(journalistId: number, tagId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(journalistTagRelations)
    .where(
      and(
        eq(journalistTagRelations.journalistId, journalistId),
        eq(journalistTagRelations.tagId, tagId)
      )
    );
}

// ========================================
// MEDIA OUTLETS
// ========================================

export async function createMediaOutlet(data: InsertMediaOutlet) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(mediaOutlets).values(data);
  return result.insertId;
}

export async function getAllMediaOutlets() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(mediaOutlets).orderBy(mediaOutlets.name);
}

export async function getMediaOutletById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [outlet] = await db
    .select()
    .from(mediaOutlets)
    .where(eq(mediaOutlets.id, id));
  return outlet;
}

export async function updateMediaOutlet(id: number, data: Partial<InsertMediaOutlet>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(mediaOutlets)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(mediaOutlets.id, id));
}

export async function deleteMediaOutlet(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(mediaOutlets).where(eq(mediaOutlets.id, id));
}

// ========================================
// OUTREACH TRACKING
// ========================================

export async function createOutreach(data: InsertJournalistOutreach) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(journalistOutreach).values(data);
  
  // Update journalist's lastContactedAt
  await db
    .update(journalists)
    .set({ lastContactedAt: data.sentAt })
    .where(eq(journalists.id, data.journalistId));

  return result.insertId;
}

export async function getOutreachByJournalist(journalistId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(journalistOutreach)
    .where(eq(journalistOutreach.journalistId, journalistId))
    .orderBy(desc(journalistOutreach.sentAt));
}

export async function updateOutreachStatus(
  id: number,
  status: "sent" | "opened" | "replied" | "bounced" | "no_response",
  timestamp?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: any = { status };

  if (status === "opened" && timestamp) {
    updates.openedAt = timestamp;
  } else if (status === "replied" && timestamp) {
    updates.repliedAt = timestamp;
  }

  await db
    .update(journalistOutreach)
    .set(updates)
    .where(eq(journalistOutreach.id, id));
}

export async function getOutreachStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allJournalists = await getJournalistsByUserId(userId);
  const journalistIds = allJournalists.map((j: Journalist) => j.id);

  if (journalistIds.length === 0) {
    return {
      totalSent: 0,
      totalOpened: 0,
      totalReplied: 0,
      openRate: 0,
      replyRate: 0,
    };
  }

  const outreaches = await db
    .select()
    .from(journalistOutreach)
    .where(inArray(journalistOutreach.journalistId, journalistIds));

  const totalSent = outreaches.length;
  const totalOpened = outreaches.filter((o: JournalistOutreach) => o.status === "opened" || o.status === "replied").length;
  const totalReplied = outreaches.filter((o: JournalistOutreach) => o.status === "replied").length;

  return {
    totalSent,
    totalOpened,
    totalReplied,
    openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    replyRate: totalSent > 0 ? (totalReplied / totalSent) * 100 : 0,
  };
}
