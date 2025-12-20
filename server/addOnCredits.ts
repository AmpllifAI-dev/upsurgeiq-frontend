import { getDb } from "./db";
import { wordCountCredits, imageCredits, subscriptions } from "../drizzle/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { WORD_COUNT_LIMITS } from "./products";

/**
 * Check if user has available word count credits (purchased add-ons)
 */
export async function getAvailableWordCountCredits(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const credits = await db
    .select()
    .from(wordCountCredits)
    .where(
      and(
        eq(wordCountCredits.userId, userId),
        gt(wordCountCredits.wordsRemaining, 0),
        // Only include non-expired credits (or credits with no expiry)
        sql`(${wordCountCredits.expiryDate} IS NULL OR ${wordCountCredits.expiryDate} > NOW())`
      )
    );

  return credits.reduce((total, credit) => total + credit.wordsRemaining, 0);
}

/**
 * Check if user has available image credits (purchased add-ons)
 */
export async function getAvailableImageCredits(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const credits = await db
    .select()
    .from(imageCredits)
    .where(
      and(
        eq(imageCredits.userId, userId),
        gt(imageCredits.creditsRemaining, 0),
        // Only include non-expired credits (or credits with no expiry)
        sql`(${imageCredits.expiryDate} IS NULL OR ${imageCredits.expiryDate} > NOW())`
      )
    );

  return credits.reduce((total, credit) => total + credit.creditsRemaining, 0);
}

/**
 * Deduct word count credits from user's purchased add-ons
 * Returns true if successful, false if insufficient credits
 */
export async function deductWordCountCredits(userId: number, words: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  let remainingToDeduct = words;

  // Get all available credits, oldest first (FIFO)
  const credits = await db
    .select()
    .from(wordCountCredits)
    .where(
      and(
        eq(wordCountCredits.userId, userId),
        gt(wordCountCredits.wordsRemaining, 0),
        sql`(${wordCountCredits.expiryDate} IS NULL OR ${wordCountCredits.expiryDate} > NOW())`
      )
    )
    .orderBy(wordCountCredits.purchaseDate);

  if (credits.length === 0) return false;

  // Deduct from oldest credits first
  for (const credit of credits) {
    if (remainingToDeduct <= 0) break;

    const deductAmount = Math.min(credit.wordsRemaining, remainingToDeduct);

    await db
      .update(wordCountCredits)
      .set({
        wordsRemaining: credit.wordsRemaining - deductAmount,
      })
      .where(eq(wordCountCredits.id, credit.id));

    remainingToDeduct -= deductAmount;
  }

  return remainingToDeduct === 0;
}

/**
 * Deduct image credits from user's purchased add-ons
 * Returns true if successful, false if insufficient credits
 */
export async function deductImageCredits(userId: number, images: number = 1): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  let remainingToDeduct = images;

  // Get all available credits, oldest first (FIFO)
  const credits = await db
    .select()
    .from(imageCredits)
    .where(
      and(
        eq(imageCredits.userId, userId),
        gt(imageCredits.creditsRemaining, 0),
        sql`(${imageCredits.expiryDate} IS NULL OR ${imageCredits.expiryDate} > NOW())`
      )
    )
    .orderBy(imageCredits.purchaseDate);

  if (credits.length === 0) return false;

  // Deduct from oldest credits first
  for (const credit of credits) {
    if (remainingToDeduct <= 0) break;

    const deductAmount = Math.min(credit.creditsRemaining, remainingToDeduct);

    await db
      .update(imageCredits)
      .set({
        creditsRemaining: credit.creditsRemaining - deductAmount,
      })
      .where(eq(imageCredits.id, credit.id));

    remainingToDeduct -= deductAmount;
  }

  return remainingToDeduct === 0;
}

/**
 * Add word count credits to user's account (after purchase)
 */
export async function addWordCountCredits(options: {
  userId: number;
  words: number;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  productKey?: string;
}): Promise<void> {
  const { userId, words, stripePaymentIntentId } = options;
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Credits expire after 1 year

  await db.insert(wordCountCredits).values({
    userId,
    wordsRemaining: words,
    purchaseDate: new Date(),
    expiryDate,
    stripePaymentIntentId,
  });
}

/**
 * Add image credits to user's account (after purchase)
 */
export async function addImageCredits(options: {
  userId: number;
  images: number;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  productKey?: string;
}): Promise<void> {
  const { userId, images, stripePaymentIntentId } = options;
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Credits expire after 1 year

  await db.insert(imageCredits).values({
    userId,
    creditsRemaining: images,
    purchaseDate: new Date(),
    expiryDate,
    stripePaymentIntentId,
  });
}

/**
 * Get user's word count limit (tier limit + purchased credits)
 */
export async function getUserWordCountLimit(userId: number): Promise<{
  tierLimit: number;
  purchasedWords: number;
  totalAvailable: number;
}> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available",
    });
  }

  // Get user's subscription tier
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!subscription) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No active subscription found",
    });
  }

  const tierLimit = WORD_COUNT_LIMITS[subscription.plan];
  const purchasedWords = await getAvailableWordCountCredits(userId);

  return {
    tierLimit,
    purchasedWords,
    totalAvailable: tierLimit + purchasedWords,
  };
}

/**
 * Check if user can generate a press release with specified word count
 */
export async function canGeneratePressRelease(
  userId: number,
  requestedWords: number
): Promise<{
  allowed: boolean;
  tierLimit: number;
  purchasedWords: number;
  requiredPurchase?: number; // Additional words needed if not allowed
}> {
  const limits = await getUserWordCountLimit(userId);

  if (requestedWords <= limits.tierLimit) {
    // Within tier limit, no purchase needed
    return {
      allowed: true,
      tierLimit: limits.tierLimit,
      purchasedWords: limits.purchasedWords,
    };
  }

  const wordsOverLimit = requestedWords - limits.tierLimit;

  if (wordsOverLimit <= limits.purchasedWords) {
    // Can be covered by purchased credits
    return {
      allowed: true,
      tierLimit: limits.tierLimit,
      purchasedWords: limits.purchasedWords,
    };
  }

  // Need to purchase more words
  const requiredPurchase = wordsOverLimit - limits.purchasedWords;

  return {
    allowed: false,
    tierLimit: limits.tierLimit,
    purchasedWords: limits.purchasedWords,
    requiredPurchase,
  };
}
