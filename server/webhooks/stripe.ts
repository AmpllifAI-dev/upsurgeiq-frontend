import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../stripe";
import { ENV } from "../_core/env";
import { getDb } from "../db";
import { subscriptions, users, payments } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { createLogger } from "../_core/logger";
import {
  sendPaymentConfirmationEmail,
  sendMediaListPurchaseEmail,
  sendTrialEndingEmail,
  sendPaymentActionRequiredEmail,
} from "../_core/email";

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

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentCanceled(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleTrialWillEnd(subscription);
        break;
      }

      case "invoice.payment_action_required": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentActionRequired(invoice);
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

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logger.info("Payment intent succeeded", {
    action: "handlePaymentIntent",
    metadata: { paymentIntentId: paymentIntent.id, amount: paymentIntent.amount },
  });

  const userId = paymentIntent.metadata?.user_id;
  const paymentType = paymentIntent.metadata?.payment_type || "other";

  if (!userId) {
    logger.error("No user_id in payment intent metadata", undefined, {
      action: "handlePaymentIntent",
      metadata: { paymentIntentId: paymentIntent.id },
    });
    return;
  }

  const db = await getDb();
  if (!db) {
    logger.error("Database not available", undefined, {
      action: "handlePaymentIntent",
      userId: parseInt(userId),
    });
    return;
  }

  // Create or update payment record
  const existingPayment = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  const chargeId = paymentIntent.latest_charge as string;

  if (existingPayment.length > 0) {
    await db
      .update(payments)
      .set({
        status: "succeeded",
        stripeChargeId: chargeId,
        updatedAt: new Date(),
      })
      .where(eq(payments.stripePaymentIntentId, paymentIntent.id));
  } else {
    await db.insert(payments).values({
      userId: parseInt(userId),
      stripePaymentIntentId: paymentIntent.id,
      stripeChargeId: chargeId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: "succeeded",
      paymentType: paymentType as "media_list_purchase" | "other",
      metadata: JSON.stringify(paymentIntent.metadata),
    });
  }

  logger.info("Payment recorded successfully", {
    action: "handlePaymentIntent",
    userId: parseInt(userId),
    metadata: { paymentIntentId: paymentIntent.id, type: paymentType },
  });

  // Send email notification for media list purchase
  if (paymentType === "media_list_purchase") {
    const user = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
    if (user.length > 0 && user[0].email) {
      const mediaListName = paymentIntent.metadata?.media_list_name || "Media List";
      await sendMediaListPurchaseEmail({
        to: user[0].email,
        name: user[0].name || "Customer",
        mediaListName,
        amount: paymentIntent.amount,
      });
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  logger.error("Payment intent failed", undefined, {
    action: "handlePaymentIntent",
    metadata: { 
      paymentIntentId: paymentIntent.id,
      lastPaymentError: paymentIntent.last_payment_error?.message 
    },
  });

  const userId = paymentIntent.metadata?.user_id;
  if (!userId) return;

  const db = await getDb();
  if (!db) return;

  const existingPayment = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  if (existingPayment.length > 0) {
    await db
      .update(payments)
      .set({
        status: "failed",
        updatedAt: new Date(),
      })
      .where(eq(payments.stripePaymentIntentId, paymentIntent.id));
  } else {
    await db.insert(payments).values({
      userId: parseInt(userId),
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: "failed",
      paymentType: (paymentIntent.metadata?.payment_type as "media_list_purchase" | "other") || "other",
      metadata: JSON.stringify(paymentIntent.metadata),
    });
  }

  logger.info("Failed payment recorded", {
    action: "handlePaymentIntent",
    userId: parseInt(userId),
  });
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  logger.info("Payment intent canceled", {
    action: "handlePaymentIntent",
    metadata: { paymentIntentId: paymentIntent.id },
  });

  const db = await getDb();
  if (!db) return;

  await db
    .update(payments)
    .set({
      status: "canceled",
      updatedAt: new Date(),
    })
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id));
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  logger.info("Charge refunded", {
    action: "handleRefund",
    metadata: { chargeId: charge.id, amountRefunded: charge.amount_refunded },
  });

  const db = await getDb();
  if (!db) return;

  await db
    .update(payments)
    .set({
      status: "refunded",
      refundedAmount: charge.amount_refunded,
      refundedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(payments.stripeChargeId, charge.id));

  logger.info("Refund recorded successfully", {
    action: "handleRefund",
    metadata: { chargeId: charge.id },
  });
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  logger.info("Trial will end soon", {
    action: "handleTrialWillEnd",
    metadata: { 
      subscriptionId: subscription.id,
      trialEnd: subscription.trial_end 
    },
  });

  const db = await getDb();
  if (!db) return;

  // Find user by subscription
  const existingSubscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (existingSubscription.length === 0) {
    logger.warn("Subscription not found for trial end notification", {
      action: "handleTrialWillEnd",
      metadata: { subscriptionId: subscription.id },
    });
    return;
  }

  const userId = existingSubscription[0].userId;
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length > 0 && user[0].email) {
    const plan = existingSubscription[0].plan;
    const trialEndDate = subscription.trial_end ? new Date(subscription.trial_end * 1000) : new Date();
    
    await sendTrialEndingEmail({
      to: user[0].email,
      name: user[0].name || "Customer",
      plan: plan.charAt(0).toUpperCase() + plan.slice(1),
      trialEndDate: trialEndDate.toLocaleDateString(),
    });
    
    logger.info("Trial ending reminder sent", {
      action: "handleTrialWillEnd",
      userId,
      metadata: { email: user[0].email },
    });
  }
}

async function handlePaymentActionRequired(invoice: Stripe.Invoice) {
  logger.info("Payment action required (3D Secure)", {
    action: "handlePaymentActionRequired",
    metadata: { 
      invoiceId: invoice.id
    },
  });

  const db = await getDb();
  if (!db) return;

  // Find subscription by invoice
  const subscriptionId = (invoice as any).subscription as string | null;
  if (!subscriptionId) return;

  const existingSubscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (existingSubscription.length === 0) return;

  const userId = existingSubscription[0].userId;
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length > 0 && user[0].email) {
    const plan = existingSubscription[0].plan;
    const amount = invoice.amount_due / 100; // Convert from cents to dollars
    
    await sendPaymentActionRequiredEmail({
      to: user[0].email,
      name: user[0].name || "Customer",
      paymentUrl: invoice.hosted_invoice_url || `${ENV.frontendUrl}/billing`,
    });
    
    logger.info("Payment action required notification sent", {
      action: "handlePaymentActionRequired",
      userId,
      metadata: { email: user[0].email },
    });
  }
}
