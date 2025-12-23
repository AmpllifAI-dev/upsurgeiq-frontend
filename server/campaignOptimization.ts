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

/**
 * Autonomous optimization configuration
 */
const OPTIMIZATION_CONFIG = {
  // Minimum data required before making optimization decisions
  MIN_IMPRESSIONS: 500,
  MIN_CLICKS: 20,
  
  // Performance thresholds
  POOR_PERFORMANCE_THRESHOLD: 30, // Score below 30 triggers pause
  AUTO_DEPLOY_THRESHOLD: 70, // Score above 70 triggers auto-deploy
  
  // Time-based rules
  MIN_RUNTIME_HOURS: 24, // Wait at least 24 hours before pausing
  
  // Rate limiting
  RATE_LIMIT_HOURS: 24, // Max 1 generation per 24 hours
  WEEKLY_GENERATION_LIMIT: 3, // Max 3 generations per week
};

/**
 * Analyze campaign variants and make autonomous optimization decisions
 * This runs automatically for approved deployed variants
 */
export async function optimizeCampaignVariants(campaignId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Get all approved variants for this campaign
  const variants = await db
    .select()
    .from(campaignVariants)
    .where(
      and(
        eq(campaignVariants.campaignId, campaignId),
        eq(campaignVariants.approvalStatus, "approved")
      )
    );

  if (variants.length === 0) {
    return { optimized: 0, actions: [] };
  }

  const actions: Array<{
    variantId: number;
    variantName: string;
    action: "pause" | "deploy" | "none";
    reason: string;
    score: number;
  }> = [];

  for (const variant of variants) {
    // Calculate performance score
    const metrics = calculatePerformanceScore({
      impressions: variant.impressions || 0,
      clicks: variant.clicks || 0,
      conversions: variant.conversions || 0,
      cost: variant.cost || 0,
    });

    // Check if variant has enough data
    const hasEnoughData =
      (variant.impressions || 0) >= OPTIMIZATION_CONFIG.MIN_IMPRESSIONS &&
      (variant.clicks || 0) >= OPTIMIZATION_CONFIG.MIN_CLICKS;

    if (!hasEnoughData) {
      actions.push({
        variantId: variant.id,
        variantName: variant.name,
        action: "none",
        reason: "Insufficient data for optimization",
        score: metrics.score,
      });
      continue;
    }

    // Check runtime (don't pause too quickly)
    const runtimeHours = variant.deployedAt
      ? (Date.now() - new Date(variant.deployedAt).getTime()) / (1000 * 60 * 60)
      : 0;

    // Auto-pause poor performers
    if (
      variant.deploymentStatus === "deployed" &&
      metrics.score < OPTIMIZATION_CONFIG.POOR_PERFORMANCE_THRESHOLD &&
      runtimeHours >= OPTIMIZATION_CONFIG.MIN_RUNTIME_HOURS
    ) {
      // Import pauseVariant dynamically to avoid circular dependency
      const { pauseVariant } = await import("./campaignApproval");
      await pauseVariant(
        variant.id,
        userId,
        `Auto-paused due to poor performance (score: ${metrics.score.toFixed(1)}/100)`
      );

      actions.push({
        variantId: variant.id,
        variantName: variant.name,
        action: "pause",
        reason: `Performance score ${metrics.score.toFixed(1)}/100 below threshold`,
        score: metrics.score,
      });

      logger.info("Auto-paused underperforming variant", {
        metadata: { campaignId, variantId: variant.id, score: metrics.score },
      });

      continue;
    }

    // Auto-deploy high performers
    if (
      variant.deploymentStatus === "not_deployed" &&
      metrics.score >= OPTIMIZATION_CONFIG.AUTO_DEPLOY_THRESHOLD
    ) {
      const { deployVariant } = await import("./campaignApproval");
      await deployVariant(variant.id, userId);

      actions.push({
        variantId: variant.id,
        variantName: variant.name,
        action: "deploy",
        reason: `Auto-deployed due to high performance (score: ${metrics.score.toFixed(1)}/100)`,
        score: metrics.score,
      });

      logger.info("Auto-deployed high-performing variant", {
        metadata: { campaignId, variantId: variant.id, score: metrics.score },
      });

      continue;
    }

    actions.push({
      variantId: variant.id,
      variantName: variant.name,
      action: "none",
      reason: "Performance within acceptable range",
      score: metrics.score,
    });
  }

  const optimizedCount = actions.filter((a) => a.action !== "none").length;

  return {
    optimized: optimizedCount,
    actions,
  };
}

/**
 * Detect underperforming variants that need attention
 * Returns variants that should trigger alerts to the client
 */
export async function detectUnderperformers(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Get deployed variants
  const variants = await db
    .select()
    .from(campaignVariants)
    .where(
      and(
        eq(campaignVariants.campaignId, campaignId),
        eq(campaignVariants.deploymentStatus, "deployed")
      )
    );

  const underperformers = [];

  for (const variant of variants) {
    const metrics = calculatePerformanceScore({
      impressions: variant.impressions || 0,
      clicks: variant.clicks || 0,
      conversions: variant.conversions || 0,
      cost: variant.cost || 0,
    });

    // Check if has enough data and is underperforming
    const hasEnoughData =
      (variant.impressions || 0) >= OPTIMIZATION_CONFIG.MIN_IMPRESSIONS &&
      (variant.clicks || 0) >= OPTIMIZATION_CONFIG.MIN_CLICKS;

    if (hasEnoughData && metrics.score < OPTIMIZATION_CONFIG.POOR_PERFORMANCE_THRESHOLD) {
      underperformers.push({
        ...variant,
        performanceScore: metrics.score,
        recommendation: "Consider pausing this variant and approving new variations",
      });
    }
  }

  return underperformers;
}

/**
 * Get optimization recommendations for a campaign
 */
export async function getOptimizationRecommendations(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const variants = await db
    .select()
    .from(campaignVariants)
    .where(eq(campaignVariants.campaignId, campaignId));

  const recommendations = [];

  // Count variants by status
  const pendingCount = variants.filter((v) => v.approvalStatus === "pending").length;
  const deployedCount = variants.filter((v) => v.deploymentStatus === "deployed").length;
  const pausedCount = variants.filter((v) => v.deploymentStatus === "paused").length;

  // Recommendation: Approve pending variants
  if (pendingCount > 0) {
    recommendations.push({
      type: "action_required",
      priority: "high",
      title: `${pendingCount} variant${pendingCount > 1 ? "s" : ""} awaiting approval`,
      description: "Review and approve new ad variations to expand your testing pool.",
      action: "review_pending",
    });
  }

  // Recommendation: Deploy approved variants
  const approvedNotDeployed = variants.filter(
    (v) => v.approvalStatus === "approved" && v.deploymentStatus === "not_deployed"
  ).length;

  if (approvedNotDeployed > 0) {
    recommendations.push({
      type: "opportunity",
      priority: "medium",
      title: `${approvedNotDeployed} approved variant${approvedNotDeployed > 1 ? "s" : ""} ready to deploy`,
      description: "Deploy these variants to start collecting performance data.",
      action: "deploy_approved",
    });
  }

  // Recommendation: Review paused variants
  if (pausedCount > 0) {
    recommendations.push({
      type: "info",
      priority: "low",
      title: `${pausedCount} variant${pausedCount > 1 ? "s" : ""} currently paused`,
      description: "Consider generating new variations to replace underperformers.",
      action: "generate_new",
    });
  }

  // Recommendation: Need more variants
  if (deployedCount < 3 && pendingCount === 0) {
    recommendations.push({
      type: "suggestion",
      priority: "medium",
      title: "Limited active variants",
      description: "Generate more ad variations to improve A/B testing effectiveness.",
      action: "generate_variants",
    });
  }

  return recommendations;
}

/**
 * Check if campaign can generate new variants (rate limiting)
 */
export async function canGenerateVariants(campaignId: number): Promise<{
  allowed: boolean;
  reason?: string;
  nextAllowedAt?: Date;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!campaign) {
    return { allowed: false, reason: "Campaign not found" };
  }

  // Rate limit: Max 1 generation per 24 hours
  if (campaign.lastVariantGeneratedAt) {
    const hoursSinceLastGeneration =
      (Date.now() - new Date(campaign.lastVariantGeneratedAt).getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastGeneration < OPTIMIZATION_CONFIG.RATE_LIMIT_HOURS) {
      const nextAllowedAt = new Date(
        new Date(campaign.lastVariantGeneratedAt).getTime() +
          OPTIMIZATION_CONFIG.RATE_LIMIT_HOURS * 60 * 60 * 1000
      );

      return {
        allowed: false,
        reason: `Rate limit: Can generate variants once per ${OPTIMIZATION_CONFIG.RATE_LIMIT_HOURS} hours`,
        nextAllowedAt,
      };
    }
  }

  // Weekly limit: Max 3 generations per week
  const generationCount = campaign.variantGenerationCount || 0;

  // Reset counter if it's been more than 7 days since last generation
  if (campaign.lastVariantGeneratedAt) {
    const daysSinceLastGeneration =
      (Date.now() - new Date(campaign.lastVariantGeneratedAt).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastGeneration >= 7) {
      // Counter will be reset when generation happens
      return { allowed: true };
    }
  }

  if (generationCount >= OPTIMIZATION_CONFIG.WEEKLY_GENERATION_LIMIT) {
    return {
      allowed: false,
      reason: `Weekly limit reached: Maximum ${OPTIMIZATION_CONFIG.WEEKLY_GENERATION_LIMIT} variant generations per week`,
    };
  }

  return { allowed: true };
}


/**
 * Check for underperforming variants and notify user
 */
export async function checkUnderperformingVariants(campaignId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const variants = await db
    .select()
    .from(campaignVariants)
    .where(eq(campaignVariants.campaignId, campaignId));
  const underperformers: typeof variants = [];

  for (const variant of variants) {
    // Only check deployed variants with sufficient data
    if (
      variant.deploymentStatus !== "deployed" ||
      !variant.impressions ||
      !variant.clicks ||
      variant.impressions < OPTIMIZATION_CONFIG.MIN_IMPRESSIONS ||
      variant.clicks < OPTIMIZATION_CONFIG.MIN_CLICKS
    ) {
      continue;
    }

    // Check if variant has been running for minimum time
    if (variant.deployedAt) {
      const hoursSinceDeployment =
        (Date.now() - new Date(variant.deployedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceDeployment < OPTIMIZATION_CONFIG.MIN_RUNTIME_HOURS) {
        continue;
      }
    }

    // Calculate performance score
    const scoreData = calculatePerformanceScore({
      impressions: variant.impressions || 0,
      clicks: variant.clicks || 0,
      conversions: variant.conversions || 0,
      cost: variant.cost || 0,
    });

    // Check if underperforming
    if (scoreData.score < OPTIMIZATION_CONFIG.POOR_PERFORMANCE_THRESHOLD) {
      underperformers.push(variant);
    }
  }

  // Create notifications for underperformers
  if (underperformers.length > 0) {
    const { createNotification } = await import("./notificationService");
    
    for (const variant of underperformers) {
      const scoreData = calculatePerformanceScore({
        impressions: variant.impressions || 0,
        clicks: variant.clicks || 0,
        conversions: variant.conversions || 0,
        cost: variant.cost || 0,
      });
      await createNotification({
        userId,
        type: "underperforming_ad",
        title: "Ad Variant Underperforming",
        message: `Ad variant "${variant.name}" is underperforming (score: ${scoreData.score.toFixed(1)}/100). Consider pausing it or generating new variations.`,
        entityType: "campaign_variant",
        entityId: variant.id,
      });
    }
  }

  return { underperformers, count: underperformers.length };
}
