import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { mediaListCredits, mediaListCreditTransactions } from "../drizzle/schema";

/**
 * Get user's credit balance
 */
export async function getCreditBalance(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [creditRecord] = await db
    .select({ credits: mediaListCredits.credits })
    .from(mediaListCredits)
    .where(eq(mediaListCredits.userId, userId))
    .limit(1);

  return creditRecord?.credits || 0;
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(userId: number, required: number): Promise<boolean> {
  const balance = await getCreditBalance(userId);
  return balance >= required;
}

/**
 * Add credits to user account (after purchase)
 */
export async function addCredits(
  userId: number,
  amount: number,
  stripeSessionId?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current balance
  const [existing] = await db
    .select()
    .from(mediaListCredits)
    .where(eq(mediaListCredits.userId, userId))
    .limit(1);

  if (existing) {
    // Update existing record
    await db
      .update(mediaListCredits)
      .set({
        credits: existing.credits + amount,
        updatedAt: new Date(),
      })
      .where(eq(mediaListCredits.userId, userId));
  } else {
    // Create new record
    await db.insert(mediaListCredits).values({
      userId,
      credits: amount,
    });
  }

  // Record transaction
  await db.insert(mediaListCreditTransactions).values({
    userId,
    amount,
    type: "purchase",
    description: `Purchased ${amount} credits`,
    stripeSessionId: stripeSessionId || null,
  });
}

/**
 * Deduct credits from user account (when using a list)
 */
export async function deductCredits(
  userId: number,
  amount: number,
  description?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user has enough credits
  const hasCredits = await hasEnoughCredits(userId, amount);
  if (!hasCredits) {
    return false;
  }

  // Get current balance
  const [existing] = await db
    .select()
    .from(mediaListCredits)
    .where(eq(mediaListCredits.userId, userId))
    .limit(1);

  if (!existing) {
    return false;
  }

  // Deduct credits
  await db
    .update(mediaListCredits)
    .set({
      credits: existing.credits - amount,
      updatedAt: new Date(),
    })
    .where(eq(mediaListCredits.userId, userId));

  // Record transaction
  await db.insert(mediaListCreditTransactions).values({
    userId,
    amount: -amount,
    type: "deduction",
    description: description || `Used ${amount} credits`,
  });

  return true;
}

/**
 * Handle credit purchase completion (called from Stripe webhook)
 */
export async function handleCreditPurchase(
  userId: number,
  productId: string,
  stripeSessionId: string
): Promise<void> {
  // Map product IDs to credit amounts
  const creditAmounts: Record<string, number> = {
    media_list_credits_10: 10,
    media_list_credits_20: 20,
    media_list_credits_30: 30,
  };

  const credits = creditAmounts[productId];
  if (!credits) {
    throw new Error(`Unknown product ID: ${productId}`);
  }

  await addCredits(userId, credits, stripeSessionId);
}
