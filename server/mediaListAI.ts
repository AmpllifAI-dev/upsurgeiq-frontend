import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { sendEmail } from "./email";
import { ENV } from "./_core/env";
import { eq, and, inArray } from "drizzle-orm";
import {
  mediaListCategories,
  mediaListGenerationRequests,
  journalistContacts,
  users,
} from "../drizzle/schema";

/**
 * AI-powered media list generation service
 * Researches and builds journalist contact lists based on category
 */

interface GenerateListParams {
  categoryId: number;
  categoryName: string;
  categoryType: "genre" | "geography" | "industry";
  userId: number;
}

interface JournalistContact {
  name: string;
  email: string;
  publication: string;
  beat?: string;
  region?: string;
  industry?: string;
  phone?: string;
  twitter?: string;
  linkedin?: string;
  notes?: string;
}

/**
 * Generate a media list using AI research
 * This runs in the background and sends email when complete
 */
export async function generateMediaList(params: GenerateListParams): Promise<void> {
  const { categoryId, categoryName, categoryType, userId } = params;

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Update request status to processing
    await db
      .update(mediaListGenerationRequests)
      .set({ status: "processing" })
      .where(
        and(
          eq(mediaListGenerationRequests.categoryId, categoryId),
          eq(mediaListGenerationRequests.userId, userId)
        )
      );

    // Build AI prompt based on category type
    const prompt = buildResearchPrompt(categoryName, categoryType);

    // Use AI to research journalists
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a media research expert specializing in UK journalism. Your task is to identify real, verified journalist contacts based on the given criteria. Focus on accuracy and current information.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "journalist_list",
          strict: true,
          schema: {
            type: "object",
            properties: {
              journalists: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Full name of the journalist" },
                    email: { type: "string", description: "Professional email address" },
                    publication: { type: "string", description: "Name of publication or media outlet" },
                    beat: { type: "string", description: "Coverage area or beat" },
                    region: { type: "string", description: "Geographic region" },
                    industry: { type: "string", description: "Industry focus" },
                    phone: { type: "string", description: "Contact phone number" },
                    twitter: { type: "string", description: "Twitter handle" },
                    linkedin: { type: "string", description: "LinkedIn profile URL" },
                    notes: { type: "string", description: "Additional notes" },
                  },
                  required: ["name", "email", "publication"],
                  additionalProperties: false,
                },
              },
            },
            required: ["journalists"],
            additionalProperties: false,
          },
        },
      },
    });

    // Parse AI response
    const content = response.choices[0].message.content;
    if (!content || typeof content !== "string") {
      throw new Error("No content in AI response");
    }

    const data = JSON.parse(content);
    const journalists: JournalistContact[] = data.journalists || [];

    // Insert journalists into database
    for (const journalist of journalists) {
      await db.insert(journalistContacts).values({
        mediaListId: categoryId,
        name: journalist.name,
        email: journalist.email,
        publication: journalist.publication,
        beat: journalist.beat || null,
        region: journalist.region || null,
        industry: journalist.industry || null,
        phone: journalist.phone || null,
        twitter: journalist.twitter || null,
        linkedin: journalist.linkedin || null,
        notes: journalist.notes || null,
      });
    }

    // Update category as populated
    await db
      .update(mediaListCategories)
      .set({ isPopulated: true, generatedAt: new Date() })
      .where(eq(mediaListCategories.id, categoryId));

    // Update request status to completed
    await db
      .update(mediaListGenerationRequests)
      .set({
        status: "completed",
        contactsGenerated: journalists.length,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(mediaListGenerationRequests.categoryId, categoryId),
          eq(mediaListGenerationRequests.userId, userId)
        )
      );

    // Get user email
    const [user] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user && user.email) {
      // Send completion email
      await sendEmail({
        to: user.email,
        subject: `Your ${categoryName} Media List is Ready!`,
        html: `
          <h2>Media List Generated Successfully</h2>
          <p>Hi ${user.name || "there"},</p>
          <p>Great news! Your <strong>${categoryName}</strong> media list has been generated and is ready to use.</p>
          <p><strong>Contacts Found:</strong> ${journalists.length} journalists</p>
          <p>You can now use this list when distributing your press releases.</p>
          <p><a href="${ENV.frontendUrl}/media-lists" style="display: inline-block; padding: 12px 24px; background-color: #008080; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Media Lists</a></p>
          <p>Best regards,<br>The UpsurgeIQ Team</p>
        `,
      });
    }
  } catch (error) {
    console.error(`Error generating media list for category ${categoryId}:`, error);

    // Update request status to failed
    await db
      .update(mediaListGenerationRequests)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      })
      .where(
        and(
          eq(mediaListGenerationRequests.categoryId, categoryId),
          eq(mediaListGenerationRequests.userId, userId)
        )
      );

    throw error;
  }
}

/**
 * Build AI research prompt based on category type
 */
function buildResearchPrompt(categoryName: string, categoryType: string): string {
  const basePrompt = `Research and identify 30-50 verified journalist contacts for the following category:\n\n`;

  switch (categoryType) {
    case "genre":
      return (
        basePrompt +
        `**Genre:** ${categoryName}\n\n` +
        `Find journalists who cover this beat or topic area. Include reporters, editors, and contributors from major UK publications, trade publications, and online media outlets. Focus on journalists who regularly write about ${categoryName.toLowerCase()} topics.\n\n` +
        `Provide accurate, current contact information including professional email addresses, publication names, and social media profiles where available.`
      );

    case "geography":
      return (
        basePrompt +
        `**Geographic Region:** ${categoryName}\n\n` +
        `Find journalists based in or covering this geographic area. Include local reporters, regional correspondents, and journalists from publications serving this region. Focus on ${categoryName} media outlets and journalists.\n\n` +
        `Provide accurate, current contact information including professional email addresses, publication names, and social media profiles where available.`
      );

    case "industry":
      return (
        basePrompt +
        `**Industry/Sector:** ${categoryName}\n\n` +
        `Find journalists who specialize in covering this industry or business sector. Include trade publication journalists, business reporters, and industry analysts. Focus on journalists with expertise in ${categoryName.toLowerCase()}.\n\n` +
        `Provide accurate, current contact information including professional email addresses, publication names, and social media profiles where available.`
      );

    default:
      return (
        basePrompt +
        `**Category:** ${categoryName}\n\n` +
        `Find relevant journalist contacts for this category. Provide accurate, current contact information.`
      );
  }
}

/**
 * Check if a category needs generation and queue it
 */
export async function checkAndQueueGeneration(
  categoryId: number,
  userId: number
): Promise<{ needsGeneration: boolean; requestId?: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if category is already populated
  const [category] = await db
    .select({ isPopulated: mediaListCategories.isPopulated })
    .from(mediaListCategories)
    .where(eq(mediaListCategories.id, categoryId))
    .limit(1);

  if (category && category.isPopulated) {
    return { needsGeneration: false };
  }

  // Check if there's already a pending/processing request
  const [existingRequest] = await db
    .select({ id: mediaListGenerationRequests.id, status: mediaListGenerationRequests.status })
    .from(mediaListGenerationRequests)
    .where(
      and(
        eq(mediaListGenerationRequests.categoryId, categoryId),
        eq(mediaListGenerationRequests.userId, userId),
        inArray(mediaListGenerationRequests.status, ["pending", "processing"])
      )
    )
    .orderBy(mediaListGenerationRequests.requestedAt)
    .limit(1);

  if (existingRequest) {
    return { needsGeneration: true, requestId: existingRequest.id };
  }

  // Get category details
  const [categoryDetails] = await db
    .select({ name: mediaListCategories.name, type: mediaListCategories.type })
    .from(mediaListCategories)
    .where(eq(mediaListCategories.id, categoryId))
    .limit(1);

  if (!categoryDetails) {
    throw new Error(`Category ${categoryId} not found`);
  }

  // Create new generation request
  const [insertResult] = await db
    .insert(mediaListGenerationRequests)
    .values({
      userId,
      categoryId,
      categoryName: categoryDetails.name,
      categoryType: categoryDetails.type,
      status: "pending",
    })
    .$returningId();

  const requestId = insertResult.id;

  // Start generation in background (don't await)
  generateMediaList({
    categoryId,
    categoryName: categoryDetails.name,
    categoryType: categoryDetails.type,
    userId,
  }).catch((error) => {
    console.error(`Background generation failed for category ${categoryId}:`, error);
  });

  return { needsGeneration: true, requestId };
}
