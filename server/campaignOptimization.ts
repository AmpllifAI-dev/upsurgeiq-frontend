import { getDb } from "./db";
import { campaigns, campaignVariants } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { createLogger } from "./_core/logger";

const logger = createLogger("CampaignOptimization");

interface VariantPerformance {
  id: number;
  name: string;
  psychologicalAngle: string | null;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  conversionRate: number;
  costPerConversion: number;
  score: number;
}

/**
 * Calculate performance score for a variant
 * Higher score = better performance
 * Weights: CTR (30%), Conversion Rate (40%), Cost Efficiency (30%)
 */
function calculatePerformanceScore(variant: {
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
}): { ctr: number; conversionRate: number; costPerConversion: number; score: number } {
  const ctr = variant.impressions > 0 ? (variant.clicks / variant.impressions) * 100 : 0;
  const conversionRate = variant.clicks > 0 ? (variant.conversions / variant.clicks) * 100 : 0;
  const costPerConversion = variant.conversions > 0 ? variant.cost / variant.conversions : Infinity;
  
  // Normalize metrics (0-100 scale)
  const ctrScore = Math.min(ctr * 10, 100); // Assume 10% CTR is excellent
  const conversionScore = Math.min(conversionRate * 5, 100); // Assume 20% conversion is excellent
  const costScore = costPerConversion === Infinity ? 0 : Math.max(100 - (costPerConversion / 10), 0); // Lower cost is better
  
  // Weighted score
  const score = (ctrScore * 0.3) + (conversionScore * 0.4) + (costScore * 0.3);
  
  return { ctr, conversionRate, costPerConversion, score };
}

/**
 * Identify winning variant for a campaign
 * Requires minimum sample size before declaring a winner
 */
export async function identifyWinningVariant(campaignId: number): Promise<{
  winnerId: number | null;
  variants: VariantPerformance[];
  hasMinimumData: boolean;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Get all testing variants for the campaign
  const variants = await db
    .select()
    .from(campaignVariants)
    .where(
      and(
        eq(campaignVariants.campaignId, campaignId),
        eq(campaignVariants.status, "testing")
      )
    );

  if (variants.length === 0) {
    return { winnerId: null, variants: [], hasMinimumData: false };
  }

  // Minimum sample size: 100 impressions and 10 clicks per variant
  const MIN_IMPRESSIONS = 100;
  const MIN_CLICKS = 10;

  const variantPerformance: VariantPerformance[] = variants.map((v) => {
    const metrics = calculatePerformanceScore({
      impressions: v.impressions || 0,
      clicks: v.clicks || 0,
      conversions: v.conversions || 0,
      cost: v.cost || 0,
    });

    return {
      id: v.id,
      name: v.name,
      psychologicalAngle: v.psychologicalAngle,
      impressions: v.impressions || 0,
      clicks: v.clicks || 0,
      conversions: v.conversions || 0,
      cost: v.cost || 0,
      ...metrics,
    };
  });

  // Check if we have minimum data
  const hasMinimumData = variantPerformance.every(
    (v) => v.impressions >= MIN_IMPRESSIONS && v.clicks >= MIN_CLICKS
  );

  if (!hasMinimumData) {
    logger.info("Insufficient data for winner identification", {
      metadata: {
        campaignId,
        variants: variantPerformance.map((v) => ({
          id: v.id,
          impressions: v.impressions,
          clicks: v.clicks,
        })),
      },
    });
    return { winnerId: null, variants: variantPerformance, hasMinimumData: false };
  }

  // Sort by score (highest first)
  variantPerformance.sort((a, b) => b.score - a.score);

  const winner = variantPerformance[0];
  const secondPlace = variantPerformance[1];

  // Require significant difference (at least 10% better score)
  const significantDifference = secondPlace ? (winner.score - secondPlace.score) / secondPlace.score >= 0.1 : true;

  if (!significantDifference) {
    logger.info("No clear winner yet - performance too close", {
      metadata: {
        campaignId,
        topVariants: variantPerformance.slice(0, 2).map((v) => ({
          id: v.id,
          score: v.score,
        })),
      },
    });
    return { winnerId: null, variants: variantPerformance, hasMinimumData: true };
  }

  logger.info("Winner identified", {
    metadata: {
      campaignId,
      winnerId: winner.id,
      score: winner.score,
      metrics: {
        ctr: winner.ctr,
        conversionRate: winner.conversionRate,
        costPerConversion: winner.costPerConversion,
      },
    },
  });

  return { winnerId: winner.id, variants: variantPerformance, hasMinimumData: true };
}

/**
 * Mark variant as winning and others as losing
 */
export async function markWinningVariant(campaignId: number, winnerId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Mark winner
  await db
    .update(campaignVariants)
    .set({ status: "winning", updatedAt: new Date() })
    .where(eq(campaignVariants.id, winnerId));

  // Mark others as losing
  await db
    .update(campaignVariants)
    .set({ status: "losing", updatedAt: new Date() })
    .where(
      and(
        eq(campaignVariants.campaignId, campaignId),
        sql`${campaignVariants.id} != ${winnerId}`,
        eq(campaignVariants.status, "testing")
      )
    );

  logger.info("Variant statuses updated", { metadata: { campaignId, winnerId } });
}

/**
 * Auto-optimize campaign - identify and mark winning variant
 */
export async function autoOptimizeCampaign(campaignId: number): Promise<{
  optimized: boolean;
  winnerId: number | null;
  message: string;
}> {
  const result = await identifyWinningVariant(campaignId);

  if (!result.hasMinimumData) {
    return {
      optimized: false,
      winnerId: null,
      message: "Insufficient data for optimization. Need at least 100 impressions and 10 clicks per variant.",
    };
  }

  if (!result.winnerId) {
    return {
      optimized: false,
      winnerId: null,
      message: "No clear winner yet. Performance differences are not statistically significant.",
    };
  }

  await markWinningVariant(campaignId, result.winnerId);

  return {
    optimized: true,
    winnerId: result.winnerId,
    message: `Variant ${result.winnerId} identified as winner and marked for deployment.`,
  };
}

/**
 * Get campaign performance summary
 */
export async function getCampaignPerformanceSummary(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const variants = await db
    .select()
    .from(campaignVariants)
    .where(eq(campaignVariants.campaignId, campaignId));

  const variantPerformance = variants.map((v) => {
    const metrics = calculatePerformanceScore({
      impressions: v.impressions || 0,
      clicks: v.clicks || 0,
      conversions: v.conversions || 0,
      cost: v.cost || 0,
    });

    return {
      id: v.id,
      name: v.name,
      psychologicalAngle: v.psychologicalAngle,
      status: v.status,
      impressions: v.impressions || 0,
      clicks: v.clicks || 0,
      conversions: v.conversions || 0,
      cost: v.cost || 0,
      ...metrics,
    };
  });

  const totalImpressions = variantPerformance.reduce((sum, v) => sum + v.impressions, 0);
  const totalClicks = variantPerformance.reduce((sum, v) => sum + v.clicks, 0);
  const totalConversions = variantPerformance.reduce((sum, v) => sum + v.conversions, 0);
  const totalCost = variantPerformance.reduce((sum, v) => sum + v.cost, 0);

  const overallMetrics = calculatePerformanceScore({
    impressions: totalImpressions,
    clicks: totalClicks,
    conversions: totalConversions,
    cost: totalCost,
  });

  return {
    variants: variantPerformance,
    overall: {
      totalImpressions,
      totalClicks,
      totalConversions,
      totalCost,
      ...overallMetrics,
    },
  };
}
