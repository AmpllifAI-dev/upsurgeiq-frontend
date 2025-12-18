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
    // stripePriceId will be set after Stripe product creation
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
    // stripePriceId will be set after Stripe product creation
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
    // stripePriceId will be set after Stripe product creation
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
