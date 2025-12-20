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
 * This function should be called after every AI service invocation
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
 * Calculate estimated credits from token count
 * Placeholder formula - update with actual Manus pricing once available
 */
export function estimateCreditsFromTokens(tokens: number): number {
  // TODO: Update this formula based on actual Manus pricing
  // Current assumption: 1 credit per 1000 tokens (placeholder)
  return tokens / 1000;
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
