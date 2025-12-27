import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { getDb } from "./db";
import {
  mediaLists,
  MediaList,
  InsertMediaList,
  mediaListContacts,
  MediaListContact,
  InsertMediaListContact,
  users,
} from "../drizzle/schema";

/**
 * OPTIMIZED: Get media lists with contact counts in a single query
 * Eliminates N+1 query problem by using LEFT JOIN and aggregation
 */
export async function getMediaListsWithContactCounts(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      // Media list fields
      id: mediaLists.id,
      businessId: mediaLists.businessId,
      userId: mediaLists.userId,
      name: mediaLists.name,
      description: mediaLists.description,
      category: mediaLists.category,
      isPublic: mediaLists.isPublic,
      createdAt: mediaLists.createdAt,
      updatedAt: mediaLists.updatedAt,
      
      // Creator info
      creatorName: users.name,
      creatorEmail: users.email,
      
      // Contact count
      contactCount: sql<number>`COUNT(DISTINCT ${mediaListContacts.id})`,
    })
    .from(mediaLists)
    .leftJoin(users, eq(mediaLists.userId, users.id))
    .leftJoin(mediaListContacts, eq(mediaLists.id, mediaListContacts.mediaListId))
    .where(eq(mediaLists.businessId, businessId))
    .groupBy(mediaLists.id)
    .orderBy(desc(mediaLists.createdAt));

  return results;
}

/**
 * OPTIMIZED: Batch load contacts for multiple media lists
 * Eliminates N+1 query problem by using inArray
 */
export async function getContactsByMediaLists(
  mediaListIds: number[]
): Promise<Record<number, MediaListContact[]>> {
  if (mediaListIds.length === 0) return {};

  const db = await getDb();
  if (!db) return {};

  // Single query to fetch all contacts for multiple media lists
  const contacts = await db
    .select()
    .from(mediaListContacts)
    .where(inArray(mediaListContacts.mediaListId, mediaListIds))
    .orderBy(desc(mediaListContacts.createdAt));

  // Group contacts by media list ID
  const grouped: Record<number, MediaListContact[]> = {};
  for (const contact of contacts) {
    if (!grouped[contact.mediaListId]) {
      grouped[contact.mediaListId] = [];
    }
    grouped[contact.mediaListId].push(contact);
  }

  return grouped;
}

/**
 * OPTIMIZED: Get media list with all contacts
 */
export async function getMediaListWithContacts(id: number) {
  const db = await getDb();
  if (!db) return null;

  // Fetch media list and contacts in parallel
  const [listResult, contacts] = await Promise.all([
    db
      .select({
        id: mediaLists.id,
        businessId: mediaLists.businessId,
        userId: mediaLists.userId,
        name: mediaLists.name,
        description: mediaLists.description,
        category: mediaLists.category,
        isPublic: mediaLists.isPublic,
        createdAt: mediaLists.createdAt,
        updatedAt: mediaLists.updatedAt,
        creatorName: users.name,
        creatorEmail: users.email,
      })
      .from(mediaLists)
      .leftJoin(users, eq(mediaLists.userId, users.id))
      .where(eq(mediaLists.id, id))
      .limit(1),
    db
      .select()
      .from(mediaListContacts)
      .where(eq(mediaListContacts.mediaListId, id))
      .orderBy(desc(mediaListContacts.createdAt)),
  ]);

  if (listResult.length === 0) return null;

  return {
    ...listResult[0],
    contacts,
  };
}

// ============================================
// ORIGINAL FUNCTIONS (kept for backward compatibility)
// ============================================

export async function createMediaList(data: InsertMediaList): Promise<MediaList> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(mediaLists).values(data);
  const insertedId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(mediaLists)
    .where(eq(mediaLists.id, insertedId))
    .limit(1);

  if (created.length === 0) throw new Error("Failed to create media list");
  return created[0]!;
}

export async function getMediaListsByBusiness(businessId: number): Promise<MediaList[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(mediaLists)
    .where(eq(mediaLists.businessId, businessId))
    .orderBy(desc(mediaLists.createdAt));
}

export async function getMediaListById(id: number): Promise<MediaList | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(mediaLists)
    .where(eq(mediaLists.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateMediaList(
  id: number,
  updates: Partial<InsertMediaList>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(mediaLists).set(updates).where(eq(mediaLists.id, id));
}

export async function deleteMediaList(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(mediaLists).where(eq(mediaLists.id, id));
}

export async function createMediaListContact(
  data: InsertMediaListContact
): Promise<MediaListContact> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(mediaListContacts).values(data);
  const insertedId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(mediaListContacts)
    .where(eq(mediaListContacts.id, insertedId))
    .limit(1);

  if (created.length === 0) throw new Error("Failed to create media list contact");
  return created[0]!;
}

export async function getContactsByMediaList(mediaListId: number): Promise<MediaListContact[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(mediaListContacts)
    .where(eq(mediaListContacts.mediaListId, mediaListId))
    .orderBy(desc(mediaListContacts.createdAt));
}

export async function updateMediaListContact(
  id: number,
  updates: Partial<InsertMediaListContact>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(mediaListContacts).set(updates).where(eq(mediaListContacts.id, id));
}

export async function deleteMediaListContact(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(mediaListContacts).where(eq(mediaListContacts.id, id));
}

/**
 * Bulk create contacts
 */
export async function bulkCreateContacts(
  contacts: InsertMediaListContact[]
): Promise<number> {
  if (contacts.length === 0) return 0;

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(mediaListContacts).values(contacts);
  return result[0].affectedRows || 0;
}