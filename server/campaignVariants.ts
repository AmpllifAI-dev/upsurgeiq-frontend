/**
 * Campaign Variant Generation Service
 * 
 * Generates multiple ad variations using different psychological angles
 * for A/B testing in the Intelligent Campaign Lab.
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { campaignVariants } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Psychological angles proven to drive conversions
 */
export const PSYCHOLOGICAL_ANGLES = {
  SCARCITY: {
    name: "Scarcity",
    description: "Limited availability or time pressure",
    examples: ["Limited time offer", "Only 5 spots left", "Ends tonight"],
  },
  SOCIAL_PROOF: {
    name: "Social Proof",
    description: "Testimonials, reviews, or popularity indicators",
    examples: ["Join 10,000+ customers", "Rated 4.9/5 stars", "Trusted by industry leaders"],
  },
  AUTHORITY: {
    name: "Authority",
    description: "Expert endorsement or credentials",
    examples: ["Recommended by experts", "Award-winning", "Industry-certified"],
  },
  RECIPROCITY: {
    name: "Reciprocity",
    description: "Free value or gifts to create obligation",
    examples: ["Free guide included", "Get a free consultation", "No credit card required"],
  },
  CURIOSITY: {
    name: "Curiosity",
    description: "Intriguing questions or incomplete information",
    examples: ["Discover the secret to...", "What if you could...", "The surprising truth about..."],
  },
  FOMO: {
    name: "Fear of Missing Out (FOMO)",
    description: "Highlighting what others are gaining",
    examples: ["Don't get left behind", "Everyone's switching to...", "Be part of the movement"],
  },
} as const;

export type PsychologicalAngle = keyof typeof PSYCHOLOGICAL_ANGLES;

/**
 * Generate 4-6 ad variations using different psychological angles
 */
export async function generateCampaignVariants(params: {
  campaignId: number;
  campaignName: string;
  campaignGoal: string;
  targetAudience?: string;
  budget?: string;
  platforms?: string;
  businessName?: string;
  brandVoice?: string;
  productService?: string;
}): Promise<Array<{
  name: string;
  psychologicalAngle: string;
  adCopy: string;
  imagePrompt: string;
}>> {
  const {
    campaignName,
    campaignGoal,
    targetAudience,
    budget,
    platforms,
    businessName,
    brandVoice,
    productService,
  } = params;

  // Build context for AI
  const context = `
Campaign: ${campaignName}
Goal: ${campaignGoal}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}
${budget ? `Budget: £${budget}` : ""}
${platforms ? `Platforms: ${platforms}` : ""}
${businessName ? `Business: ${businessName}` : ""}
${brandVoice ? `Brand Voice: ${brandVoice}` : ""}
${productService ? `Product/Service: ${productService}` : ""}
`.trim();

  const systemPrompt = `You are an expert advertising copywriter specializing in psychological marketing.
Generate 5 distinct ad variations for this campaign, each using a different psychological angle.

The 5 psychological angles to use:
1. Scarcity - Limited availability or time pressure
2. Social Proof - Testimonials, reviews, or popularity
3. Authority - Expert endorsement or credentials
4. Reciprocity - Free value or gifts
5. Curiosity - Intriguing questions or incomplete information

For each variation, create:
- A compelling headline (max 60 characters)
- Body copy (max 150 characters for social ads)
- A clear call-to-action
- An image generation prompt describing the visual

Match the brand voice and appeal to the target audience.`;

  const userPrompt = `Generate 5 ad variations for this campaign:

${context}

Return a JSON array with exactly 5 variations, each with:
{
  "name": "Variation name (e.g., 'Scarcity Angle')",
  "psychologicalAngle": "The angle used (Scarcity, Social Proof, Authority, Reciprocity, or Curiosity)",
  "headline": "Compelling headline (max 60 chars)",
  "bodyCopy": "Persuasive body copy (max 150 chars)",
  "callToAction": "Clear CTA (e.g., 'Shop Now', 'Learn More')",
  "imagePrompt": "Detailed prompt for AI image generation"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "campaign_variants",
          strict: true,
          schema: {
            type: "object",
            properties: {
              variants: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Variation name" },
                    psychologicalAngle: { type: "string", description: "The psychological angle used" },
                    headline: { type: "string", description: "Ad headline" },
                    bodyCopy: { type: "string", description: "Ad body copy" },
                    callToAction: { type: "string", description: "Call to action" },
                    imagePrompt: { type: "string", description: "Image generation prompt" },
                  },
                  required: ["name", "psychologicalAngle", "headline", "bodyCopy", "callToAction", "imagePrompt"],
                  additionalProperties: false,
                },
              },
            },
            required: ["variants"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    // Handle content type (string or array)
    const contentString = typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentString);
    const variants = parsed.variants || [];

    // Format variants for storage
    return variants.map((v: any) => ({
      name: v.name,
      psychologicalAngle: v.psychologicalAngle,
      adCopy: `${v.headline}\n\n${v.bodyCopy}\n\n${v.callToAction}`,
      imagePrompt: v.imagePrompt,
    }));
  } catch (error) {
    console.error("Error generating campaign variants:", error);
    throw new Error("Failed to generate ad variations. Please try again.");
  }
}

/**
 * Save generated variants to database
 */
export async function saveVariantsToDatabase(
  campaignId: number,
  variants: Array<{
    name: string;
    psychologicalAngle: string;
    adCopy: string;
    imagePrompt: string;
  }>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Insert all variants
  for (const variant of variants) {
    await db.insert(campaignVariants).values({
      campaignId,
      name: variant.name,
      psychologicalAngle: variant.psychologicalAngle,
      adCopy: variant.adCopy,
      imageUrl: null, // Images can be generated separately
      status: "testing",
      impressions: 0,
      clicks: 0,
      conversions: 0,
      cost: 0,
      ctr: "0.00",
      conversionRate: "0.00",
    });
  }
}

/**
 * Calculate performance score for a variant
 * Used for automatic winner identification
 */
export function calculatePerformanceScore(variant: {
  impressions: number | null;
  clicks: number | null;
  conversions: number | null;
  cost: number | null;
}): number {
  const impressions = variant.impressions || 0;
  const clicks = variant.clicks || 0;
  const conversions = variant.conversions || 0;
  const cost = variant.cost || 0;

  // Minimum sample size required
  if (impressions < 100 || clicks < 10) {
    return 0; // Not enough data yet
  }

  // Calculate metrics
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const costPerConversion = conversions > 0 ? cost / conversions : Infinity;

  // Weighted score (CTR 30%, Conversion Rate 40%, Cost Efficiency 30%)
  const ctrScore = Math.min(ctr / 5, 1) * 30; // Normalize to 0-30
  const conversionScore = Math.min(conversionRate / 10, 1) * 40; // Normalize to 0-40
  const costScore = costPerConversion < Infinity ? Math.max(0, (1 - costPerConversion / 100) * 30) : 0; // Normalize to 0-30

  return ctrScore + conversionScore + costScore;
}

/**
 * Identify winning variant based on performance
 */
export async function identifyWinningVariant(campaignId: number): Promise<number | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all variants for this campaign
  const variants = await db
    .select()
    .from(campaignVariants)
    .where(eq(campaignVariants.campaignId, campaignId));

  if (variants.length === 0) {
    return null;
  }

  // Calculate scores for each variant
  const variantsWithScores = variants.map((v) => ({
    ...v,
    score: calculatePerformanceScore(v),
  }));

  // Filter variants with enough data
  const validVariants = variantsWithScores.filter((v) => v.score > 0);

  if (validVariants.length === 0) {
    return null; // Not enough data yet
  }

  // Find the highest scoring variant
  const winner = validVariants.reduce((best, current) =>
    current.score > best.score ? current : best
  );

  // Check if winner is significantly better (at least 10% better than second best)
  const sortedVariants = validVariants.sort((a, b) => b.score - a.score);
  if (sortedVariants.length > 1) {
    const secondBest = sortedVariants[1];
    const improvement = ((winner.score - secondBest.score) / secondBest.score) * 100;
    
    if (improvement < 10) {
      return null; // Not statistically significant yet
    }
  }

  return winner.id;
}

/**
 * Update variant status based on performance
 */
export async function updateVariantStatuses(campaignId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const winnerId = await identifyWinningVariant(campaignId);

  if (!winnerId) {
    return; // Not enough data or no clear winner yet
  }

  // Get all variants
  const variants = await db
    .select()
    .from(campaignVariants)
    .where(eq(campaignVariants.campaignId, campaignId));

  // Update statuses
  for (const variant of variants) {
    let newStatus: "testing" | "winning" | "losing" | "archived";

    if (variant.id === winnerId) {
      newStatus = "winning";
    } else {
      const score = calculatePerformanceScore(variant);
      newStatus = score > 0 ? "losing" : "testing";
    }

    await db
      .update(campaignVariants)
      .set({ status: newStatus })
      .where(eq(campaignVariants.id, variant.id));
  }
}
