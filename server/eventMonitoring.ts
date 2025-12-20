/**
 * Event Monitoring Service
 * 
 * Monitors important dates and sends proactive notifications for:
 * - Sports events (races, competitions)
 * - Earnings dates (quarterly/annual reports)
 * - Company milestones (anniversaries, registrations)
 * - Custom events
 */

import { invokeLLM } from "./_core/llm";
import { logger } from "./_core/logger";
import { getDb } from "./db";
import { eq, and, gte, lte, isNull } from "drizzle-orm";

export interface EventCheckResult {
  upcomingEvents: Array<{
    id: number;
    title: string;
    eventDate: Date;
    daysUntil: number;
    shouldNotify: boolean;
  }>;
  recentEvents: Array<{
    id: number;
    title: string;
    eventDate: Date;
    needsPostEventNotification: boolean;
  }>;
}

/**
 * Check for upcoming events that need pre-event notifications
 */
export async function checkUpcomingEvents(userId: number): Promise<EventCheckResult["upcomingEvents"]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { importantDates } = await import("../drizzle/schema");

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Find active events in the next 7 days that haven't been notified yet
  const upcomingEvents = await db
    .select()
    .from(importantDates)
    .where(
      and(
        eq(importantDates.userId, userId),
        eq(importantDates.isActive, 1),
        gte(importantDates.eventDate, now),
        lte(importantDates.eventDate, sevenDaysFromNow),
        isNull(importantDates.lastNotifiedAt)
      )
    );

  return upcomingEvents.map(event => {
    const daysUntil = Math.ceil((event.eventDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    const shouldNotify = daysUntil <= (event.notifyDaysBefore || 3);

    return {
      id: event.id,
      title: event.title,
      eventDate: event.eventDate,
      daysUntil,
      shouldNotify,
    };
  });
}

/**
 * Check for recent events that need post-event notifications
 */
export async function checkRecentEvents(userId: number): Promise<EventCheckResult["recentEvents"]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { importantDates } = await import("../drizzle/schema");

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  // Find events that happened in the last 2 days and need post-event notification
  const recentEvents = await db
    .select()
    .from(importantDates)
    .where(
      and(
        eq(importantDates.userId, userId),
        eq(importantDates.isActive, 1),
        eq(importantDates.notifyAfterEvent, 1),
        gte(importantDates.eventDate, twoDaysAgo),
        lte(importantDates.eventDate, now),
        isNull(importantDates.postEventNotifiedAt)
      )
    );

  return recentEvents.map(event => ({
    id: event.id,
    title: event.title,
    eventDate: event.eventDate,
    needsPostEventNotification: true,
  }));
}

/**
 * Fetch sports event results (placeholder for external API integration)
 */
export async function fetchSportsEventResults(eventId: string, externalSource?: string): Promise<any> {
  // TODO: Integrate with sports APIs (e.g., Motorsport API, ESPN API)
  // For now, return placeholder data
  logger.info("Fetching sports event results", {
    component: "EventMonitoring",
    action: "fetchSportsEventResults",
    metadata: { eventId, externalSource },
  });

  // Placeholder: In production, this would call external APIs
  return {
    placement: "3rd",
    score: "P3",
    highlights: "Strong performance with podium finish",
    celebratory: true,
  };
}

/**
 * Fetch earnings date information (placeholder for external API integration)
 */
export async function fetchEarningsInfo(companySymbol: string): Promise<any> {
  // TODO: Integrate with financial APIs (e.g., Alpha Vantage, Financial Modeling Prep)
  logger.info("Fetching earnings info", {
    component: "EventMonitoring",
    action: "fetchEarningsInfo",
    metadata: { companySymbol },
  });

  // Placeholder: In production, this would call external APIs
  return {
    earningsDate: new Date(),
    estimatedEPS: "2.50",
    actualEPS: "2.75",
    beat: true,
  };
}

/**
 * Generate AI-powered pre-event notification
 */
export async function generatePreEventNotification(event: {
  title: string;
  description?: string;
  eventType: string;
  eventDate: Date;
  daysUntil: number;
  dossier?: any;
}): Promise<{ title: string; message: string; suggestedDraft?: string }> {
  const dossierContext = event.dossier
    ? `\n\nBusiness Context:\n- Company: ${event.dossier.companyName}\n- Industry: ${event.dossier.industry}\n- Brand Voice: ${event.dossier.brandVoice}`
    : "";

  const prompt = `Generate a proactive notification for an upcoming event.

Event Details:
- Title: ${event.title}
- Type: ${event.eventType}
- Date: ${event.eventDate.toLocaleDateString()}
- Days Until Event: ${event.daysUntil}
- Description: ${event.description || "N/A"}${dossierContext}

Generate:
1. A short notification title (max 60 characters)
2. A brief message explaining the event and asking if they want to create content
3. If it's a sports event or significant milestone, suggest a short press release draft (2-3 paragraphs)

Return as JSON with fields: title, message, suggestedDraft (optional)`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a PR assistant helping clients stay on top of important events. Be proactive and helpful.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pre_event_notification",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Short notification title" },
            message: { type: "string", description: "Brief message about the event" },
            suggestedDraft: { type: "string", description: "Optional press release draft" },
          },
          required: ["title", "message"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== "string") {
    throw new Error("Failed to generate notification");
  }

  return JSON.parse(content);
}

/**
 * Generate AI-powered post-event notification
 */
export async function generatePostEventNotification(event: {
  title: string;
  description?: string;
  eventType: string;
  eventDate: Date;
  eventOutcome?: any;
  dossier?: any;
}): Promise<{ title: string; message: string; suggestedDraft?: string }> {
  const dossierContext = event.dossier
    ? `\n\nBusiness Context:\n- Company: ${event.dossier.companyName}\n- Industry: ${event.dossier.industry}\n- Brand Voice: ${event.dossier.brandVoice}`
    : "";

  const outcomeContext = event.eventOutcome
    ? `\n\nEvent Outcome:\n${JSON.stringify(event.eventOutcome, null, 2)}`
    : "";

  const prompt = `Generate a proactive notification for a completed event.

Event Details:
- Title: ${event.title}
- Type: ${event.eventType}
- Date: ${event.eventDate.toLocaleDateString()}
- Description: ${event.description || "N/A"}${dossierContext}${outcomeContext}

Based on the event outcome:
1. Generate a short notification title (max 60 characters)
2. Write a brief message (celebratory if positive, supportive if negative)
3. Suggest a press release draft that captures the event results

Return as JSON with fields: title, message, suggestedDraft`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a PR assistant helping clients announce event results. Match the tone to the outcome (celebratory for wins, professional for losses).",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "post_event_notification",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Short notification title" },
            message: { type: "string", description: "Brief message about the results" },
            suggestedDraft: { type: "string", description: "Press release draft" },
          },
          required: ["title", "message", "suggestedDraft"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== "string") {
    throw new Error("Failed to generate notification");
  }

  return JSON.parse(content);
}
