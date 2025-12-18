import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  mediaLists,
  MediaList,
  InsertMediaList,
  mediaListContacts,
  MediaListContact,
  InsertMediaListContact,
} from "../drizzle/schema";

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

export async function bulkCreateContacts(
  contacts: InsertMediaListContact[]
): Promise<MediaListContact[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (contacts.length === 0) return [];

  await db.insert(mediaListContacts).values(contacts);

  // Return the created contacts (simplified - in production you'd want to return the actual inserted records)
  return contacts as MediaListContact[];
}
