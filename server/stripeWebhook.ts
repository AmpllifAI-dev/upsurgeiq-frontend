import Stripe from "stripe";
import { getStripeClient } from "./stripeProductSync";
import { addWordCountCredits, addImageCredits } from "./addOnCredits";

/**
 * Stripe Webhook Handler
 * 
 * Handles webhook events from Stripe for purchase fulfillment
 */

/**
 * Handle checkout.session.completed event
 * This is called when a customer successfully completes a purchase
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = parseInt(session.client_reference_id || "0");
  const productType = session.metadata?.productType;
  
  if (!userId || !productType) {
    console.error("Missing userId or productType in session metadata", session.id);
    return;
  }
  
  console.log(`Processing purchase for user ${userId}, type: ${productType}`);
  
  if (productType === "word_count") {
    await handleWordCountPurchase(session, userId);
  } else if (productType === "image_pack") {
    await handleImagePackPurchase(session, userId);
  } else {
    console.error(`Unknown product type: ${productType}`);
  }
}

/**
 * Handle word count purchase fulfillment
 */
async function handleWordCountPurchase(
  session: Stripe.Checkout.Session,
  userId: number
): Promise<void> {
  const words = parseInt(session.metadata?.words || "0");
  const productKey = session.metadata?.productKey || "unknown";
  
  if (!words) {
    console.error("Missing words in session metadata", session.id);
    return;
  }
  
  try {
    await addWordCountCredits({
      userId,
      words,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string || null,
      productKey,
    });
    
    console.log(`✅ Added ${words} word credits to user ${userId}`);
  } catch (error) {
    console.error(`Failed to add word credits for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Handle image pack purchase fulfillment
 */
async function handleImagePackPurchase(
  session: Stripe.Checkout.Session,
  userId: number
): Promise<void> {
  const images = parseInt(session.metadata?.images || "0");
  const productKey = session.metadata?.productKey || "unknown";
  
  if (!images) {
    console.error("Missing images in session metadata", session.id);
    return;
  }
  
  try {
    await addImageCredits({
      userId,
      images,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string || null,
      productKey,
    });
    
    console.log(`✅ Added ${images} image credits to user ${userId}`);
  } catch (error) {
    console.error(`Failed to add image credits for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  const stripe = getStripeClient();
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    throw new Error("Invalid webhook signature");
  }
}

/**
 * Main webhook handler
 * Call this from your webhook endpoint
 */
export async function handleStripeWebhook(
  payload: string | Buffer,
  signature: string
): Promise<{ received: boolean; error?: string }> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return { received: false, error: "Webhook secret not configured" };
  }
  
  try {
    // Verify the webhook signature
    const event = verifyWebhookSignature(payload, signature, webhookSecret);
    
    console.log(`Received webhook event: ${event.type}`);
    
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case "checkout.session.async_payment_succeeded":
        // Handle async payment success (e.g., bank transfers)
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case "checkout.session.async_payment_failed":
        // Log failed async payments
        console.error("Async payment failed:", event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return { received: true };
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return { received: false, error: error.message };
  }
}
