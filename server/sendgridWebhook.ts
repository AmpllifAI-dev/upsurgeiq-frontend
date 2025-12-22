/**
 * SendGrid Webhook Handler for Email Event Tracking
 * 
 * Processes SendGrid Event Webhook to track email opens, clicks, bounces, etc.
 * Documentation: https://docs.sendgrid.com/for-developers/tracking-events/event
 */

import { Request, Response } from "express";
import { getDb } from "./db";
import { campaignEvents, emailCampaigns, newsletterSubscribers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * SendGrid Event Types
 */
type SendGridEventType =
  | "processed"
  | "dropped"
  | "delivered"
  | "bounce"
  | "deferred"
  | "open"
  | "click"
  | "spamreport"
  | "unsubscribe"
  | "group_unsubscribe"
  | "group_resubscribe";

interface SendGridEvent {
  email: string;
  timestamp: number;
  event: SendGridEventType;
  campaign_id?: string;
  url?: string;
  ip?: string;
  useragent?: string;
  reason?: string;
  status?: string;
  response?: string;
  sg_event_id: string;
  sg_message_id: string;
}

/**
 * Map SendGrid event types to our internal event types
 * Returns null if event type is not tracked
 */
function mapEventType(sgEvent: SendGridEventType): "sent" | "delivered" | "opened" | "clicked" | "bounced" | "unsubscribed" | null {
  const mapping: Record<SendGridEventType, "sent" | "delivered" | "opened" | "clicked" | "bounced" | "unsubscribed" | null> = {
    processed: "sent",
    dropped: "bounced",
    delivered: "delivered",
    bounce: "bounced",
    deferred: null, // Don't track deferred
    open: "opened",
    click: "clicked",
    spamreport: "bounced", // Treat spam reports as bounces
    unsubscribe: "unsubscribed",
    group_unsubscribe: "unsubscribed",
    group_resubscribe: null, // Don't track resubscribes in campaign events
  };

  return mapping[sgEvent] ?? null;
}

/**
 * Process a single SendGrid event
 */
async function processSendGridEvent(event: SendGridEvent) {
  const db = await getDb();
  if (!db) {
    console.error("[SendGrid Webhook] Database not available");
    return;
  }

  try {
    // Extract campaign ID from custom args or email metadata
    const campaignId = event.campaign_id ? parseInt(event.campaign_id) : null;

    if (!campaignId) {
      console.warn("[SendGrid Webhook] No campaign ID found in event", event.sg_event_id);
      return;
    }

    // Find subscriber by email
    const [subscriber] = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, event.email))
      .limit(1);

    const subscriberId = subscriber?.id || null;

    // Map event type
    const eventType = mapEventType(event.event);

    // Skip events we don't track
    if (!eventType) {
      console.log(`[SendGrid Webhook] Skipping event type: ${event.event}`);
      return;
    }

    // Insert event into campaign_events table
    await db.insert(campaignEvents).values({
      campaignId,
      subscriberId,
      eventType,
      ipAddress: event.ip || null,
      userAgent: event.useragent || null,
      eventData: {
        url: event.url,
        sg_event_id: event.sg_event_id,
        sg_message_id: event.sg_message_id,
        reason: event.reason,
        status: event.status,
        response: event.response,
      },
      createdAt: new Date(event.timestamp * 1000),
    });

    // Update campaign aggregate counts
    await updateCampaignCounts(campaignId, eventType);

    console.log(`[SendGrid Webhook] Processed ${eventType} event for campaign ${campaignId}`);
  } catch (error) {
    console.error("[SendGrid Webhook] Error processing event:", error);
  }
}

/**
 * Update campaign aggregate counts based on event type
 */
async function updateCampaignCounts(campaignId: number, eventType: string) {
  const db = await getDb();
  if (!db) return;

  try {
    const [campaign] = await db
      .select()
      .from(emailCampaigns)
      .where(eq(emailCampaigns.id, campaignId))
      .limit(1);

    if (!campaign) return;

    const updates: Partial<typeof emailCampaigns.$inferInsert> = {};

    switch (eventType) {
      case "opened":
        updates.openCount = (campaign.openCount || 0) + 1;
        break;
      case "clicked":
        updates.clickCount = (campaign.clickCount || 0) + 1;
        break;
      case "bounced":
        updates.bounceCount = (campaign.bounceCount || 0) + 1;
        break;
      case "unsubscribed":
        updates.unsubscribeCount = (campaign.unsubscribeCount || 0) + 1;
        break;
    }

    if (Object.keys(updates).length > 0) {
      await db
        .update(emailCampaigns)
        .set(updates)
        .where(eq(emailCampaigns.id, campaignId));
    }
  } catch (error) {
    console.error("[SendGrid Webhook] Error updating campaign counts:", error);
  }
}

/**
 * Express route handler for SendGrid webhook
 */
export async function handleSendGridWebhook(req: Request, res: Response) {
  try {
    const events: SendGridEvent[] = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({ error: "Invalid payload format" });
    }

    console.log(`[SendGrid Webhook] Received ${events.length} events`);

    // Process events asynchronously (don't block webhook response)
    Promise.all(events.map(processSendGridEvent)).catch((error) => {
      console.error("[SendGrid Webhook] Error processing batch:", error);
    });

    // Respond immediately to SendGrid
    res.status(200).json({ received: events.length });
  } catch (error) {
    console.error("[SendGrid Webhook] Handler error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Helper function to generate SendGrid custom args for tracking
 */
export function generateSendGridCustomArgs(campaignId: number) {
  return {
    campaign_id: campaignId.toString(),
  };
}
