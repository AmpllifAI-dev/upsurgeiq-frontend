/**
 * Product Definitions for Stripe
 * 
 * This file defines all products that should exist in Stripe.
 * The sync script will create/update products based on these definitions.
 * 
 * To add a new product:
 * 1. Add it to this file
 * 2. Run `pnpm stripe:sync` or use Admin > Stripe Products > Sync
 * 3. The product will be created and IDs will be auto-populated
 */

export interface ProductDefinition {
  /** Unique identifier for this product (used for code references) */
  id: string;
  /** Display name in Stripe dashboard and checkout */
  name: string;
  /** Description shown to customers */
  description: string;
  /** Price in smallest currency unit (pence for GBP) */
  price: number;
  /** Currency code */
  currency: "gbp";
  /** Product type for categorization */
  type: "word_count" | "image_pack" | "subscription" | "one_time";
  /** Metadata for internal tracking */
  metadata: {
    /** How many units this product provides (words, images, etc.) */
    units?: number;
    /** Feature category */
    category?: string;
    /** Any additional data */
    [key: string]: any;
  };
  /** Stripe Product ID (auto-populated after sync) */
  stripeProductId?: string;
  /** Stripe Price ID (auto-populated after sync) */
  stripePriceId?: string;
  /** Whether this product is active */
  active?: boolean;
}

/**
 * All product definitions
 * These will be synced to Stripe when you run the sync command
 */
export const PRODUCT_DEFINITIONS: ProductDefinition[] = [
  // ========================================
  // Word Count Add-Ons
  // ========================================
  {
    id: "words_300",
    name: "300 Extra Words",
    description: "Add 300 words to your press release. Perfect for adding more detail to your story.",
    price: 400, // £4.00
    currency: "gbp",
    type: "word_count",
    metadata: {
      units: 300,
      category: "press_release_enhancement",
    },
    active: true,
  },
  {
    id: "words_600",
    name: "600 Extra Words",
    description: "Add 600 words to your press release. Ideal for comprehensive coverage.",
    price: 800, // £8.00
    currency: "gbp",
    type: "word_count",
    metadata: {
      units: 600,
      category: "press_release_enhancement",
    },
    active: true,
  },
  {
    id: "words_900",
    name: "900 Extra Words",
    description: "Add 900 words to your press release. Maximum flexibility for detailed announcements.",
    price: 1200, // £12.00
    currency: "gbp",
    type: "word_count",
    metadata: {
      units: 900,
      category: "press_release_enhancement",
    },
    active: true,
  },

  // ========================================
  // Image Pack Add-Ons
  // ========================================
  {
    id: "image_single",
    name: "Single Image Credit",
    description: "Generate 1 additional AI-powered professional image for your content.",
    price: 399, // £3.99
    currency: "gbp",
    type: "image_pack",
    metadata: {
      units: 1,
      category: "ai_image_generation",
    },
    active: true,
  },
  {
    id: "image_pack_5",
    name: "5 Image Credits",
    description: "Generate 5 additional AI-powered professional images. Save £5 compared to buying individually.",
    price: 1499, // £14.99
    currency: "gbp",
    type: "image_pack",
    metadata: {
      units: 5,
      category: "ai_image_generation",
      savings: 500, // £5.00 savings
    },
    active: true,
  },
  {
    id: "image_pack_10",
    name: "10 Image Credits",
    description: "Generate 10 additional AI-powered professional images. Save £15 compared to buying individually.",
    price: 2499, // £24.99
    currency: "gbp",
    type: "image_pack",
    metadata: {
      units: 10,
      category: "ai_image_generation",
      savings: 1500, // £15.00 savings
    },
    active: true,
  },
];

/**
 * Get product definition by ID
 */
export function getProductDefinition(id: string): ProductDefinition | undefined {
  return PRODUCT_DEFINITIONS.find((p) => p.id === id);
}

/**
 * Get all product definitions by type
 */
export function getProductDefinitionsByType(
  type: ProductDefinition["type"]
): ProductDefinition[] {
  return PRODUCT_DEFINITIONS.filter((p) => p.type === type);
}

/**
 * Get all active product definitions
 */
export function getActiveProductDefinitions(): ProductDefinition[] {
  return PRODUCT_DEFINITIONS.filter((p) => p.active !== false);
}
