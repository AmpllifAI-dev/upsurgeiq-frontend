/**
 * Stripe Product and Price Configuration
 * 
 * This file defines the pricing tiers for upsurgeIQ subscriptions.
 * Products and prices should be created in the Stripe Dashboard first,
 * then their IDs should be added here.
 */

export type PricingTier = "starter" | "pro" | "scale";

export interface ProductConfig {
  name: string;
  tier: PricingTier;
  price: number;
  currency: string;
  interval: "month";
  features: string[];
  stripePriceId?: string; // To be set after creating in Stripe Dashboard
  stripeProductId?: string; // Stripe Product ID
}

export const PRODUCTS: Record<PricingTier, ProductConfig> = {
  starter: {
    name: "Starter",
    tier: "starter",
    price: 49,
    currency: "gbp",
    interval: "month",
    features: [
      "AI-powered press release generation",
      "Social media distribution (4 platforms)",
      "Basic media list access",
      "Up to 10 press releases/month",
      "Email support",
    ],
    stripeProductId: "prod_TdNbUqVvxJJZw9",
    stripePriceId: "price_1Sg6qKIEVr3V21Jeo9ce4tSk",
  },
  pro: {
    name: "Pro",
    tier: "pro",
    price: 99,
    currency: "gbp",
    interval: "month",
    features: [
      "Everything in Starter",
      "Conversational AI assistant",
      "Voice call-in feature",
      "Advanced media lists",
      "Up to 50 press releases/month",
      "Campaign Lab access",
      "Priority support",
    ],
    stripeProductId: "prod_TdNbapI0V8QDIh",
    stripePriceId: "price_1Sg6qLIEVr3V21JevpkT16ff",
  },
  scale: {
    name: "Scale",
    tier: "scale",
    price: 349,
    currency: "gbp",
    interval: "month",
    features: [
      "Everything in Pro",
      "Unlimited press releases",
      "White-label options",
      "Custom media lists",
      "Advanced campaign analytics",
      "API access",
      "Dedicated account manager",
    ],
    stripeProductId: "prod_TdNbEsPcijWqXa",
    stripePriceId: "price_1Sg6qLIEVr3V21JefGTcSmZj",
  },
};

/**
 * Additional Products Configuration
 */
export const ADDITIONAL_PRODUCTS = {
  additionalMediaList: {
    name: "Additional Media List",
    price: 400, // £4.00 in pence
    currency: "gbp",
    interval: "month" as const,
    stripeProductId: "prod_TdNbgdwBIB6Dbn",
    stripePriceId: "price_1Sg6qMIEVr3V21Jeb8Yk1A0n",
    description: "Add extra media list to your subscription",
  },
  intelligentCampaignLab: {
    name: "Intelligent Campaign Lab",
    price: 9900, // £99.00 in pence (standalone purchase)
    currency: "gbp",
    interval: "month" as const,
    stripeProductId: "prod_TdNbuCSuRx3WLE",
    stripePriceId: "price_1Sg6qMIEVr3V21JeyfLicP6y",
    description: "Advanced campaign optimization and A/B testing (can be purchased standalone)",
  },
  aiChat: {
    name: "AI Chat",
    price: 3900, // £39.00 in pence
    currency: "gbp",
    interval: "month" as const,
    stripeProductId: "prod_TdssygSTn4yCgE",
    stripePriceId: "price_1Sgb6bIEVr3V21Je8XP27Y5W",
    description: "Conversational AI assistant for content generation (32 messages/month)",
    credits: 32,
  },
  aiCallIn: {
    name: "AI Call-in",
    price: 5900, // £59.00 in pence
    currency: "gbp",
    interval: "month" as const,
    stripeProductId: "prod_Tdsspb7TDwtOpS",
    stripePriceId: "price_1Sgb6cIEVr3V21JeSjoqSrib",
    description: "Voice call-in with Whisper transcription (32 messages/month)",
    credits: 32,
  },
};

/**
 * Get product configuration by tier
 */
export function getProductByTier(tier: PricingTier): ProductConfig {
  return PRODUCTS[tier];
}

/**
 * Get all products as an array
 */
export function getAllProducts(): ProductConfig[] {
  return Object.values(PRODUCTS);
}

/**
 * Word Count Add-On Products (£4 per 300 words)
 * For extending press releases beyond tier limits
 */
export const WORD_COUNT_PRODUCTS = {
  words_300: {
    name: "300 Extra Words",
    words: 300,
    price: 400, // £4.00 in pence
    currency: "gbp",
    stripeProductId: "prod_Tdga09X45s6WqW", // TODO: Create in Stripe Dashboard
    stripePriceId: "price_1SgPDIAGfyqPBnQ9QzTEqcRl", // TODO: Create in Stripe Dashboard
    description: "Add 300 words to your press release",
  },
  words_600: {
    name: "600 Extra Words",
    words: 600,
    price: 800, // £8.00 in pence
    currency: "gbp",
    stripeProductId: "prod_TdgazVtOrHtGmz", // TODO: Create in Stripe Dashboard
    stripePriceId: "price_1SgPDIAGfyqPBnQ99t4rwGdX", // TODO: Create in Stripe Dashboard
    description: "Add 600 words to your press release (save £0)",
  },
  words_900: {
    name: "900 Extra Words",
    words: 900,
    price: 1200, // £12.00 in pence
    currency: "gbp",
    stripeProductId: "prod_Tdgayy25rImfvT", // TODO: Create in Stripe Dashboard
    stripePriceId: "price_1SgPDJAGfyqPBnQ99ZjYaO9K", // TODO: Create in Stripe Dashboard
    description: "Add 900 words to your press release (save £0)",
  },
};

/**
 * Image Pack Add-On Products
 * For additional AI-generated images beyond tier limits
 */
export const IMAGE_PACK_PRODUCTS = {
  single: {
    name: "Single Image Credit",
    images: 1,
    price: 399, // £3.99 in pence
    currency: "gbp",
    stripeProductId: "prod_TdgaO5ahCQIfDy", // TODO: Create in Stripe Dashboard
    stripePriceId: "price_1SgPDJAGfyqPBnQ94zADTH2s", // TODO: Create in Stripe Dashboard
    description: "Generate 1 additional AI image",
  },
  pack_5: {
    name: "5 Image Credits",
    images: 5,
    price: 1499, // £14.99 in pence (save £5)
    currency: "gbp",
    stripeProductId: "prod_Tdga6MTbsk6kEk", // TODO: Create in Stripe Dashboard
    stripePriceId: "price_1SgPDKAGfyqPBnQ9vXpCfW5Q", // TODO: Create in Stripe Dashboard
    description: "Generate 5 additional AI images (save £5)",
  },
  pack_10: {
    name: "10 Image Credits",
    images: 10,
    price: 2499, // £24.99 in pence (save £15)
    currency: "gbp",
    stripeProductId: "prod_Tdga9SWsPmfa05", // TODO: Create in Stripe Dashboard
    stripePriceId: "price_1SgPDKAGfyqPBnQ9ThnceObY", // TODO: Create in Stripe Dashboard
    description: "Generate 10 additional AI images (save £15)",
  },
};

/**
 * Tier-specific word count limits for press releases
 */
export const WORD_COUNT_LIMITS: Record<PricingTier, number> = {
  starter: 400,  // Journalist best practice minimum
  pro: 500,      // Standard press release length
  scale: 800,    // Extended for enterprise needs
};
