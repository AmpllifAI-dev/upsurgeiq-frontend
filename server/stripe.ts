import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY not found in environment variables");
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-12-15.clover",
    })
  : null;

/**
 * Media List Credit Bundle Products
 * These need to be created in Stripe Dashboard first
 */
export const CREDIT_PRODUCTS = {
  STARTER: {
    productId: "media_list_credits_10",
    name: "10 Media List Credits",
    credits: 10,
    priceGBP: 3600, // £36.00 in pence
    description: "10 credits for media list distribution",
  },
  PROFESSIONAL: {
    productId: "media_list_credits_20",
    name: "20 Media List Credits",
    credits: 20,
    priceGBP: 6800, // £68.00 in pence
    description: "20 credits for media list distribution (Save £12)",
  },
  ENTERPRISE: {
    productId: "media_list_credits_30",
    name: "30 Media List Credits",
    credits: 30,
    priceGBP: 9600, // £96.00 in pence
    description: "30 credits for media list distribution (Save £24)",
  },
} as const;

export type CreditProductId = keyof typeof CREDIT_PRODUCTS;

/**
 * Create Stripe Checkout Session for credit purchase
 */
export async function createCreditCheckoutSession(
  productId: CreditProductId,
  userId: number,
  userEmail: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const product = CREDIT_PRODUCTS[productId];
  if (!product) {
    throw new Error(`Invalid product ID: ${productId}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceGBP,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId.toString(),
    customer_email: userEmail,
    metadata: {
      userId: userId.toString(),
      productId: product.productId,
      credits: product.credits.toString(),
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return session.url;
}

/**
 * Get product details by ID
 */
export function getCreditProduct(productId: string) {
  const product = Object.values(CREDIT_PRODUCTS).find((p) => p.productId === productId);
  return product || null;
}
