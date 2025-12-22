import { getDb } from "./db";
import { creditUsage } from "../drizzle/schema";

export type FeatureType = 
  | "press_release_generation"
  | "campaign_strategy_generation"
  | "ai_chat"
  | "image_generation"
  | "voice_transcription"
  | "content_analysis"
  | "other";

interface CreditLogParams {
  userId: number;
  featureType: FeatureType;
  creditsUsed: number;
  tokensUsed?: number;
  metadata?: Record<string, any>;
}

/**
 * Log credit usage for AI service calls
 * 
 * IMPORTANT: Manus uses task-based pricing, not per-token or per-API-call pricing.
 * Credits are consumed based on task complexity, duration, and resource usage.
 * 
 * The creditsUsed parameter should be set to 0 during development/testing.
 * Actual credit consumption must be measured empirically by:
 * 1. Running test scenarios for each feature
 * 2. Checking Manus Settings > Usage to see actual credits consumed
 * 3. Updating the creditsUsed value based on observed patterns
 * 
 * This function logs usage for internal tracking and admin monitoring.
 */
export async function logCreditUsage(params: CreditLogParams): Promise<void> {
  const { userId, featureType, creditsUsed, tokensUsed = 0, metadata = {} } = params;

  try {
    const db = await getDb();
    if (!db) {
      console.error("[CreditLogger] Database unavailable, skipping credit log");
      return;
    }

    await db.insert(creditUsage).values({
      userId,
      featureType,
      creditsUsed: creditsUsed.toString(), // Store as string for decimal precision
      tokensUsed,
      metadata: JSON.stringify(metadata),
      createdAt: new Date(),
    });

    console.log(`[CreditLogger] Logged ${creditsUsed} credits for user ${userId} (${featureType})`);
  } catch (error) {
    console.error("[CreditLogger] Failed to log credit usage:", error);
    // Don't throw - we don't want credit logging failures to break the main flow
  }
}

/**
 * Estimate credits from token count
 * 
 * NOTE: Manus does not provide per-token pricing. This function returns 0.
 * Actual credit costs must be measured empirically through testing.
 * 
 * See the Credit Testing Plan document for measurement methodology.
 */
export function estimateCreditsFromTokens(tokens: number): number {
  // Manus pricing is task-based, not token-based
  // Return 0 and measure actual costs through testing
  return 0;
}

/**
 * Get total credits used by a user in a time period
 */
export async function getUserCreditUsage(
  userId: number,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const db = await getDb();
  if (!db) {
    return 0;
  }

  // TODO: Implement query with date filtering
  // For now, return 0 as placeholder
  return 0;
}
