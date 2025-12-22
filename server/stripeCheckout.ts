import Stripe from "stripe";
import { getStripeClient } from "./stripeProductSync";
import { WORD_COUNT_PRODUCTS, IMAGE_PACK_PRODUCTS } from "./products";

/**
 * Stripe Checkout Helper Functions
 * 
 * Creates checkout sessions for one-time purchases (word count, image packs)
 */

interface CheckoutSessionOptions {
  userId: number;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create checkout session for word count purchase
 */
export async function createWordCountCheckoutSession(
  wordCountKey: keyof typeof WORD_COUNT_PRODUCTS,
  options: CheckoutSessionOptions
): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripeClient();
  const product = WORD_COUNT_PRODUCTS[wordCountKey];
  
  if (!product.stripePriceId) {
    throw new Error(`Stripe Price ID not found for ${wordCountKey}`);
  }
  
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: product.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    customer_email: options.userEmail,
    client_reference_id: options.userId.toString(),
    metadata: {
      userId: options.userId.toString(),
      productType: "word_count",
      productKey: wordCountKey,
      words: product.words.toString(),
    },
  });
  
  if (!session.id || !session.url) {
    throw new Error("Failed to create checkout session");
  }
  
  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Create checkout session for image pack purchase
 */
export async function createImagePackCheckoutSession(
  imagePackKey: keyof typeof IMAGE_PACK_PRODUCTS,
  options: CheckoutSessionOptions
): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripeClient();
  const product = IMAGE_PACK_PRODUCTS[imagePackKey];
  
  if (!product.stripePriceId) {
    throw new Error(`Stripe Price ID not found for ${imagePackKey}`);
  }
  
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: product.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    customer_email: options.userEmail,
    client_reference_id: options.userId.toString(),
    metadata: {
      userId: options.userId.toString(),
      productType: "image_pack",
      productKey: imagePackKey,
      images: product.images.toString(),
    },
  });
  
  if (!session.id || !session.url) {
    throw new Error("Failed to create checkout session");
  }
  
  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Verify checkout session was completed successfully
 */
export async function verifyCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  if (session.payment_status !== "paid") {
    throw new Error("Payment not completed");
  }
  
  return session;
}

/**
 * Get checkout session details
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  return await stripe.checkout.sessions.retrieve(sessionId);
}
