import { getDb } from "./db";
import { socialMediaPosts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function updateSocialMediaPost(
  id: number,
  updates: Partial<{
    content: string;
    status: "draft" | "scheduled" | "published" | "failed";
    scheduledFor: Date;
    publishedAt: Date;
    imageUrl: string;
  }>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(socialMediaPosts).set(updates).where(eq(socialMediaPosts.id, id));
}
