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
 * Real Stripe Price IDs from created products
 */
export const CREDIT_PRODUCTS = {
  STARTER: {
    priceId: "price_1Sh4t0IEVr3V21Jee3XjNcYX",
    productId: "prod_TeNe3AnU4JehWF",
    name: "10 Media List Credits",
    credits: 10,
    priceGBP: 3600, // £36.00 in pence
    description: "10 credits for media list distribution (Save £4)",
  },
  PROFESSIONAL: {
    priceId: "price_1Sh4t1IEVr3V21JeDciG8p2v",
    productId: "prod_TeNe3TD1SlLXcC",
    name: "20 Media List Credits",
    credits: 20,
    priceGBP: 6800, // £68.00 in pence
    description: "20 credits for media list distribution (Save £12)",
  },
  ENTERPRISE: {
    priceId: "price_1Sh4t1IEVr3V21JecvcAMgkL",
    productId: "prod_TeNe69n2aDDUck",
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
        price: product.priceId,
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
