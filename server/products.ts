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
    stripeProductId: "prod_Td2pC4hUddBbAH",
    stripePriceId: "price_1SfmjyAGfyqPBnQ9JPZoNoWl",
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
    stripeProductId: "prod_Td2sl51moqbe4C",
    stripePriceId: "price_1SfmmWAGfyqPBnQ9LeAJ711i",
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
    stripeProductId: "prod_Td2tuhKJPQ41d8",
    stripePriceId: "price_1SfmnuAGfyqPBnQ9U5P7KfF4",
  },
};

/**
 * Additional Products Configuration
 */
export const ADDITIONAL_PRODUCTS = {
  additionalMediaList: {
    name: "Additional Media List",
    stripeProductId: "prod_Td2wLpX1A6exs9",
    stripePriceId: "price_1Sfmq8AGfyqPBnQ9JJ8tsFHt",
    description: "Add extra media list to your subscription",
  },
  intelligentCampaignLab: {
    name: "Intelligent Campaign Lab",
    stripeProductId: "prod_Td2yyQ1pFJWNoo",
    stripePriceId: "price_1SfmsDAGfyqPBnQ9DTkBb5vw",
    description: "Advanced campaign optimization and A/B testing",
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
