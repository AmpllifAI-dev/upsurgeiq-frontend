import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { partners, Partner, InsertPartner } from "../drizzle/schema";

export async function createPartner(data: InsertPartner): Promise<Partner> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(partners).values(data);
  const insertedId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(partners)
    .where(eq(partners.id, insertedId))
    .limit(1);

  if (created.length === 0) throw new Error("Failed to create partner");
  return created[0]!;
}

export async function getAllPartners(): Promise<Partner[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(partners)
    .orderBy(desc(partners.createdAt));
}

export async function getPartnerById(id: number): Promise<Partner | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(partners)
    .where(eq(partners.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updatePartner(
  id: number,
  updates: Partial<InsertPartner>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(partners).set(updates).where(eq(partners.id, id));
}

export async function deletePartner(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(partners).where(eq(partners.id, id));
}
