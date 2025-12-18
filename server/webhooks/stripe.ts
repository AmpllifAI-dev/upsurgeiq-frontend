import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../stripe";
import { ENV } from "../_core/env";
import { getDb } from "../db";
import { subscriptions, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { createLogger } from "../_core/logger";
import { sendPaymentConfirmationEmail } from "../_core/email";

const logger = createLogger("StripeWebhook");

if (!ENV.stripeWebhookSecret) {
  logger.warn("STRIPE_WEBHOOK_SECRET not configured");
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    logger.error("No signature header in webhook request", undefined, {
      action: "verifySignature",
    });
    return res.status(400).send("No signature");
  }

  if (!ENV.stripeWebhookSecret) {
    logger.error("Webhook secret not configured", undefined, {
      action: "verifySignature",
    });
    return res.status(500).send("Webhook secret not configured");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    logger.error("Signature verification failed", err, {
      action: "verifySignature",
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    logger.info("Test event detected, returning verification response", {
      action: "handleTestEvent",
      metadata: { eventType: event.type },
    });
    return res.json({
      verified: true,
    });
  }

  logger.info("Received webhook event", {
    action: "handleWebhook",
    metadata: { eventType: event.type, eventId: event.id },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        logger.info("Unhandled event type", {
          action: "handleWebhook",
          metadata: { eventType: event.type },
        });
    }

    logger.info("Webhook event processed successfully", {
      action: "handleWebhook",
      metadata: { eventType: event.type },
    });

    res.json({ received: true });
  } catch (error) {
    logger.error("Error processing webhook event", error as Error, {
      action: "handleWebhook",
      metadata: { eventType: event.type, eventId: event.id },
    });
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  logger.info("Checkout completed", {
    action: "handleCheckout",
    metadata: { sessionId: session.id },
  });

  const userId = session.metadata?.user_id;
  const tier = session.metadata?.tier;

  if (!userId) {
    logger.error("No user_id in checkout session metadata", undefined, {
      action: "handleCheckout",
      metadata: { sessionId: session.id },
    });
    return;
  }

  const db = await getDb();
  if (!db) {
    logger.error("Database not available", undefined, {
      action: "handleCheckout",
      userId: parseInt(userId),
    });
    return;
  }

  // Get subscription details
  const stripeSubscriptionId = session.subscription as string;
  const stripeCustomerId = session.customer as string;

  if (!stripeSubscriptionId) {
    logger.error("No subscription ID in checkout session", undefined, {
      action: "handleCheckout",
      userId: parseInt(userId),
      metadata: { sessionId: session.id },
    });
    return;
  }

  // Create or update subscription record
  const existingSubscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, parseInt(userId)))
    .limit(1);

  if (existingSubscription.length > 0) {
    // Update existing subscription
    await db
      .update(subscriptions)
      .set({
        plan: tier as "starter" | "pro" | "scale",
        status: "active",
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, parseInt(userId)));
  } else {
    // Create new subscription
    await db.insert(subscriptions).values({
      userId: parseInt(userId),
      plan: (tier as "starter" | "pro" | "scale") || "starter",
      status: "active",
      stripeCustomerId,
      stripeSubscriptionId,
    });
  }

  logger.info("Subscription created/updated successfully", {
    action: "handleCheckout",
    userId: parseInt(userId),
    metadata: { tier, subscriptionId: stripeSubscriptionId },
  });

  // Send payment confirmation email
  const userEmail = session.metadata?.customer_email;
  const userName = session.metadata?.customer_name;
  if (userEmail && userName && tier) {
    const tierMap: Record<string, { name: string; amount: number }> = {
      starter: { name: "Starter", amount: 4900 },
      pro: { name: "Pro", amount: 9900 },
      scale: { name: "Scale", amount: 34900 },
    };
    const planInfo = tierMap[tier.toLowerCase()] || { name: tier, amount: 0 };
    
    await sendPaymentConfirmationEmail({
      to: userEmail,
      name: userName,
      plan: planInfo.name,
      amount: planInfo.amount,
    }).catch((error) => {
      logger.error("Failed to send payment confirmation email", error as Error, {
        action: "handleCheckout",
        userId: parseInt(userId),
      });
    });
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log("[Stripe Webhook] Subscription updated:", subscription.id);

  const db = await getDb();
  if (!db) return;

  // Find subscription by Stripe ID
  const existingSubscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (existingSubscription.length === 0) {
    console.warn("[Stripe Webhook] Subscription not found:", subscription.id);
    return;
  }

  // Update subscription status
  let status: "active" | "canceled" | "past_due" | "trialing";
  if (subscription.status === "active") {
    status = "active";
  } else if (subscription.status === "past_due") {
    status = "past_due";
  } else if (subscription.status === "trialing") {
    status = "trialing";
  } else {
    status = "canceled";
  }

  await db
    .update(subscriptions)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Stripe Webhook] Subscription status updated to ${status}`);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log("[Stripe Webhook] Subscription canceled:", subscription.id);

  const db = await getDb();
  if (!db) return;

  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log("[Stripe Webhook] Subscription marked as canceled");
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log("[Stripe Webhook] Invoice paid:", invoice.id);
  // Additional logic for successful payments can be added here
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log("[Stripe Webhook] Invoice payment failed:", invoice.id);
  // Additional logic for failed payments (e.g., notify user) can be added here
}
