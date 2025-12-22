import { Request, Response } from "express";
import { stripe } from "./stripe";
import { handleCreditPurchase } from "./mediaListCredits";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Stripe webhook handler for checkout.session.completed events
 * This is called by Stripe when a payment is successful
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  if (!stripe) {
    console.error("[Stripe Webhook] Stripe not configured");
    return res.status(500).json({ error: "Stripe not configured" });
  }

  if (!webhookSecret) {
    console.error("[Stripe Webhook] Webhook secret not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    console.error("[Stripe Webhook] No signature header");
    return res.status(400).json({ error: "No signature" });
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return res.status(400).json({ error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}` });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;

      try {
        // Extract metadata
        const userId = parseInt(session.metadata?.userId || session.client_reference_id);
        const productId = session.metadata?.productId;
        const sessionId = session.id;

        if (!userId || !productId) {
          console.error("[Stripe Webhook] Missing userId or productId in session metadata");
          return res.status(400).json({ error: "Missing metadata" });
        }

        // Add credits to user account
        await handleCreditPurchase(userId, productId, sessionId);

        console.log(`[Stripe Webhook] Credits added for user ${userId}, product ${productId}`);
      } catch (error) {
        console.error("[Stripe Webhook] Error processing checkout.session.completed:", error);
        return res.status(500).json({ error: "Failed to process payment" });
      }

      break;
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
}

/**
 * Register Stripe webhook route
 * This should be called in server/_core/index.ts
 */
export function registerStripeWebhook(app: any) {
  // Stripe requires raw body for signature verification
  app.post(
    "/api/stripe/webhook",
    (req: Request, res: Response, next: any) => {
      // Skip body parsing for this route
      if (req.originalUrl === "/api/stripe/webhook") {
        next();
      } else {
        next();
      }
    },
    handleStripeWebhook
  );

  console.log("[Stripe] Webhook registered at /api/stripe/webhook");
}
