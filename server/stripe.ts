import Stripe from "stripe";
import { ENV } from "./_core/env";
import { createLogger } from "./_core/logger";

const logger = createLogger("StripePayment");

if (!ENV.stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not configured");
}

export const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-12-15.clover",
});

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(params: {
  userId: number;
  userEmail: string;
  userName: string;
  priceId: string;
  tier: string;
  origin: string;
}): Promise<Stripe.Checkout.Session> {
  logger.info("Creating Stripe checkout session", {
    userId: params.userId,
    action: "createCheckout",
    metadata: { tier: params.tier, priceId: params.priceId },
  });

  try {
    const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    customer_email: params.userEmail,
    client_reference_id: params.userId.toString(),
    metadata: {
      user_id: params.userId.toString(),
      customer_email: params.userEmail,
      customer_name: params.userName,
      tier: params.tier,
    },
    allow_promotion_codes: true,
    success_url: `${params.origin}/dashboard?payment=success`,
    cancel_url: `${params.origin}/subscribe?payment=canceled`,
    });

    logger.info("Checkout session created successfully", {
      userId: params.userId,
      action: "createCheckout",
      metadata: { sessionId: session.id, tier: params.tier },
    });

    return session;
  } catch (error) {
    logger.error("Failed to create checkout session", error as Error, {
      userId: params.userId,
      action: "createCheckout",
      metadata: { tier: params.tier, priceId: params.priceId },
    });
    throw error;
  }
}

/**
 * Create a Customer Portal session for managing subscriptions
 */
export async function createPortalSession(params: {
  customerId: string;
  origin: string;
}): Promise<Stripe.BillingPortal.Session> {
  logger.info("Creating customer portal session", {
    action: "createPortal",
    metadata: { customerId: params.customerId },
  });

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: `${params.origin}/dashboard`,
    });

    logger.info("Portal session created successfully", {
      action: "createPortal",
      metadata: { sessionId: session.id },
    });

    return session;
  } catch (error) {
    logger.error("Failed to create portal session", error as Error, {
      action: "createPortal",
      metadata: { customerId: params.customerId },
    });
    throw error;
  }
}

/**
 * Create a Stripe Checkout Session for one-time media list purchase
 */
export async function createMediaListPurchaseSession(params: {
  userId: number;
  userEmail: string;
  userName: string;
  mediaListId: number;
  mediaListName: string;
  pressReleaseId?: number;
  amount: number; // Amount in pence (e.g., 400 for £4)
  origin: string;
}): Promise<Stripe.Checkout.Session> {
  logger.info("Creating media list purchase checkout session", {
    userId: params.userId,
    action: "createMediaListPurchase",
    metadata: { mediaListId: params.mediaListId, amount: params.amount },
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment", // One-time payment, not subscription
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Media List: ${params.mediaListName}`,
              description: "One-time access to distribute press release to this media list",
            },
            unit_amount: params.amount, // Amount in pence
          },
          quantity: 1,
        },
      ],
      customer_email: params.userEmail,
      client_reference_id: params.userId.toString(),
      metadata: {
        user_id: params.userId.toString(),
        payment_type: "media_list_purchase",
        media_list_id: params.mediaListId.toString(),
        media_list_name: params.mediaListName,
        press_release_id: params.pressReleaseId?.toString() || "",
        customer_email: params.userEmail,
        customer_name: params.userName,
      },
      success_url: `${params.origin}/media-lists?purchase=success&list_id=${params.mediaListId}`,
      cancel_url: `${params.origin}/media-lists?purchase=canceled`,
    });

    logger.info("Media list purchase session created successfully", {
      userId: params.userId,
      action: "createMediaListPurchase",
      metadata: { sessionId: session.id, mediaListId: params.mediaListId },
    });

    return session;
  } catch (error) {
    logger.error("Failed to create media list purchase session", error as Error, {
      userId: params.userId,
      action: "createMediaListPurchase",
      metadata: { mediaListId: params.mediaListId, amount: params.amount },
    });
    throw error;
  }
}
