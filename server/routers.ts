import { TRPCError } from "@trpc/server";
import { sql, eq, and, isNotNull, gte } from "drizzle-orm";
import { getDb } from "./db";
import { generatePressReleaseImage, regenerateImage, getImageStylePresets } from "./pressReleaseImages";
import { pressReleases, campaigns, journalists, users, creditUsage, creditAlertThresholds, creditAlertHistory, wordCountCredits, imageCredits } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "@shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { 
  getEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getDefaultEmailTemplate,
  getUserBusiness, 
  createBusiness, 
  updateBusiness,
  getNotificationPreferences,
  upsertNotificationPreferences,
  getUserSubscription,
  getTeamMembersByBusinessId,
  getTeamMemberByUserAndBusiness,
  createTeamMember,
  updateTeamMemberRole,
  deleteTeamMember,
  getTeamInvitationsByBusinessId,
  getTeamInvitationByToken,
  createTeamInvitation,
  updateTeamInvitationStatus,
  getSavedFiltersByUserId,
  createSavedFilter,
  deleteSavedFilter,
  createApprovalRequest,
  getApprovalRequestsByPressRelease,
  getPendingApprovalRequests,
  updateApprovalRequest,
  createApprovalComment,
  getApprovalComments,
  createContentVersion,
  getContentVersions,
  getContentVersion,
  createBusinessDossier,
  getBusinessDossier,
  updateBusinessDossier,
  saveAIConversation,
  getAIConversations,
  getAIConversationsByDossier,
} from "./db";
import {
  createJournalist,
  getJournalistById,
  getJournalistsByUserId,
  updateJournalist,
  deleteJournalist,
  searchJournalists,
  getJournalistsByOutlet,
  getJournalistsByBeat,
  getJournalistsByTag,
  assignBeatToJournalist,
  removeBeatFromJournalist,
  assignTagToJournalist,
  removeTagFromJournalist,
  getBeatsByJournalist,
  getTagsByJournalist,
  createOutreach,
  getOutreachByJournalist,
  updateOutreachStatus,
  getOutreachStats,
  createMediaOutlet,
  getAllMediaOutlets,
  getMediaOutletById,
  updateMediaOutlet,
  deleteMediaOutlet,
  createBeat,
  getAllBeats,
  createTag,
  getAllTags,
} from "./journalists";
import { generateInvitationToken, getInvitationExpiry, hasPermission } from "./teamUtils";
import {
  createPressRelease,
  getPressReleasesByBusiness,
  getPressReleaseById,
  updatePressRelease,
  deletePressRelease,
  createSocialMediaPost,
  getSocialMediaPostsByBusiness,
  bulkDeletePressReleases,
  bulkUpdatePressReleaseStatus,
} from "./pressReleases";
import {
  createMediaList,
  getMediaListsByBusiness,
  getMediaListById,
  updateMediaList,
  deleteMediaList,
  createMediaListContact,
  getContactsByMediaList,
  bulkCreateContacts,
} from "./mediaLists";
import {
  createCampaign,
  getCampaignsByBusiness,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  createCampaignVariant,
  getVariantsByCampaign,
  bulkDeleteCampaigns,
  bulkUpdateCampaignStatus,
  createMilestone,
  getMilestonesByCampaign,
  updateMilestone,
  deleteMilestone,
  createDeliverable,
  getDeliverablesByCampaign,
  getDeliverablesByMilestone,
  updateDeliverable,
  deleteDeliverable,
  createAnalyticsEntry,
  getAnalyticsByCampaign,
  getAnalyticsByDateRange,
  updateAnalyticsEntry,
  createCampaignTemplate,
  getCampaignTemplateById,
  getAllCampaignTemplates,
  updateCampaignTemplate,
  deleteCampaignTemplate,
  incrementTemplateUsage,
  addCampaignTeamMember,
  getCampaignTeamMembers,
  removeCampaignTeamMember,
  updateCampaignTeamMemberRole,
  checkCampaignPermission,
  logCampaignActivity,
  getCampaignActivityLog,
} from "./campaigns";
import {
  createPartner,
  getAllPartners,
  getPartnerById,
  updatePartner,
  deletePartner,
} from "./partners";
import { createCheckoutSession, createPortalSession, createMediaListPurchaseSession } from "./stripe";
import { getProductByTier } from "./products";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { generateSocialPostsFromPressRelease, generateSocialMediaImages } from "./socialPostGeneration";
import { logCreditUsage, estimateCreditsFromTokens } from "./creditLogger";
import { checkCreditAlerts, initializeDefaultAlerts } from "./costAlertChecker";
import { getErrorLogs, getErrorStats } from "./errorLogs";
import { logActivity, getActivityLogs, getRecentActivity } from "./activityLog";
import { checkLimit, incrementUsage, getCurrentUsage, TIER_LIMITS } from "./usageTracking";
import { exportPressReleasesToCSV, exportCampaignsToCSV, exportAnalyticsToCSV } from "./export";
import { createLogger } from "./_core/logger";
import { getPressReleaseEngagement } from "./tracking";
import {
  createDistribution,
  getDistributionsByPressRelease,
  updateDistributionStats,
  markDistributionSent,
} from "./distributions";
import { sendPressReleaseNotificationEmail } from "./_core/email";
import { z } from "zod";
import { getActiveWebhooksByEvent } from "./webhookConfigs";
import { buildUserOnboardedPayload, sendWebhookWithRetry } from "./webhooks";
import { logWebhookDelivery } from "./webhookConfigs";

const prLogger = createLogger("PressReleaseGeneration");
const aiLogger = createLogger("AIAssistant");

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  subscription: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const subscription = await getUserSubscription(ctx.user.id);
      return subscription || null;
    }),

    createAddonCheckout: protectedProcedure
      .input(
        z.object({
          addonType: z.enum(["aiChat", "aiCallIn", "intelligentCampaignLab"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { ADDITIONAL_PRODUCTS } = await import("./products");
        const addon = ADDITIONAL_PRODUCTS[input.addonType];

        if (!addon) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid add-on type",
          });
        }

        const origin = ctx.req.headers.origin || "http://localhost:3000";

        // Create Stripe checkout session for add-on
        const stripe = (await import("stripe")).default;
        const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: "2025-12-15.clover",
        });

        const session = await stripeClient.checkout.sessions.create({
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          line_items: [
            {
              price: addon.stripePriceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${origin}/dashboard?addon_success=true`,
          cancel_url: `${origin}/profile?addon_canceled=true`,
          metadata: {
            userId: ctx.user.id.toString(),
            addonType: input.addonType,
          },
        });

        if (!session.url) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create checkout session",
          });
        }

        return { url: session.url };
      }),
  }),

  aiCredits: router({
    getUsage: protectedProcedure.query(async ({ ctx }) => {
      const { getCurrentCreditsUsage, getUserAddonSubscriptions } = await import("./addonSubscriptions");
      
      // Check active add-on subscriptions
      const addons = await getUserAddonSubscriptions(ctx.user.id);
      const aiChatEnabled = addons.some(a => a.addonType === "aiChat");
      const aiCallInEnabled = addons.some(a => a.addonType === "aiCallIn");
      
      if (!aiChatEnabled && !aiCallInEnabled) {
        return {
          aiChatEnabled: false,
          aiCallInEnabled: false,
          aiChatTotal: 0,
          aiChatUsed: 0,
          aiChatRemaining: 0,
          aiCallInTotal: 0,
          aiCallInUsed: 0,
          aiCallInRemaining: 0,
        };
      }
      
      // Get actual usage from database
      const usage = await getCurrentCreditsUsage(ctx.user.id);
      
      return {
        aiChatEnabled,
        aiCallInEnabled,
        aiChatTotal: usage.aiChat?.creditsTotal || 0,
        aiChatUsed: usage.aiChat?.creditsUsed || 0,
        aiChatRemaining: usage.aiChat?.creditsRemaining || 0,
        aiCallInTotal: usage.aiCallIn?.creditsTotal || 0,
        aiCallInUsed: usage.aiCallIn?.creditsUsed || 0,
        aiCallInRemaining: usage.aiCallIn?.creditsRemaining || 0,
      };
    }),
  }),

  business: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const business = await getUserBusiness(ctx.user.id);
      return business || null;
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          website: z.string().url().optional(),
          sicCode: z.string().optional(),
          sicSection: z.string().optional(),
          sicDivision: z.string().optional(),
          sicGroup: z.string().optional(),
          brandVoiceTone: z.enum(["formal", "friendly", "inspirational", "witty", "educational"]).optional(),
          brandVoiceStyle: z.enum(["concise", "detailed", "story_driven", "data_driven"]).optional(),
          targetAudience: z.string().optional(),
          dossier: z.string().optional(),
          aiImageStyle: z.string().optional(),
          aiImageMood: z.string().optional(),
          aiImageColorPalette: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check if user already has a business
        const existing = await getUserBusiness(ctx.user.id);
        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User already has a business profile",
          });
        }

        const business = await createBusiness({
          userId: ctx.user.id,
          ...input,
        });

        // Trigger webhook for onboarding completion
        const webhooks = await getActiveWebhooksByEvent("user.onboarded");
        for (const webhook of webhooks) {
          const subscription = await getUserSubscription(ctx.user.id);
          const payload = buildUserOnboardedPayload({
            user: {
              id: ctx.user.id,
              email: ctx.user.email || "",
              name: ctx.user.name,
            },
            business: {
              id: business.id,
              companyName: business.name,
              website: business.website,
              industry: business.sicSection,
              sicCode: business.sicCode,
              sicDescription: business.sicGroup,
              employeeCount: null,
              targetAudience: business.targetAudience,
              uniqueSellingPoints: null,
              brandVoice: business.brandVoiceTone,
              toneStyle: business.brandVoiceStyle,
              keyMessages: null,
              competitorInfo: null,
              imageStyle: business.aiImageStyle,
              colorPreferences: business.aiImageColorPalette,
              logoUrl: null,
              createdAt: business.createdAt,
            },
            subscription: subscription
              ? {
                  tier: subscription.plan,
                  status: subscription.status,
                  startDate: subscription.currentPeriodStart,
                }
              : null,
          });

          const result = await sendWebhookWithRetry(webhook.webhookUrl, payload, webhook.retryAttempts);

          // Log delivery attempt
          await logWebhookDelivery({
            webhookConfigId: webhook.id,
            eventType: "user.onboarded",
            payload: JSON.stringify(payload),
            success: result.success ? 1 : 0,
            statusCode: result.statusCode || null,
            errorMessage: result.error || null,
            attempts: webhook.retryAttempts,
            deliveredAt: new Date(result.deliveredAt),
          });
        }

        return business;
      }),

    update: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).optional(),
          website: z.string().url().optional(),
          sicCode: z.string().optional(),
          sicSection: z.string().optional(),
          sicDivision: z.string().optional(),
          sicGroup: z.string().optional(),
          brandVoiceTone: z.enum(["formal", "friendly", "inspirational", "witty", "educational"]).optional(),
          brandVoiceStyle: z.enum(["concise", "detailed", "story_driven", "data_driven"]).optional(),
          targetAudience: z.string().optional(),
          dossier: z.string().optional(),
          aiImageStyle: z.string().optional(),
          aiImageMood: z.string().optional(),
          aiImageColorPalette: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        await updateBusiness(business.id, input);

        return { success: true };
      }),

    updateWhiteLabel: protectedProcedure
      .input(
        z.object({
          businessId: z.number(),
          whiteLabelEnabled: z.number(),
          whiteLabelLogoUrl: z.string().optional(),
          whiteLabelPrimaryColor: z.string().optional(),
          whiteLabelSecondaryColor: z.string().optional(),
          whiteLabelCompanyName: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { businessId, ...updates } = input;
        
        // Verify user owns this business
        const business = await getUserBusiness(ctx.user.id);
        if (!business || business.id !== businessId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to update this business",
          });
        }

        await updateBusiness(businessId, updates);

        // Log activity
        const { logActivity } = await import("./activityLog");
        await logActivity({
          userId: ctx.user.id,
          action: "update",
          entityType: "business_white_label",
          entityId: businessId,
          description: `White label settings ${updates.whiteLabelEnabled ? 'enabled' : 'disabled'}`,
          metadata: updates,
        });

        return { success: true };
      }),
  }),

  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      const business = await getUserBusiness(ctx.user.id);
      if (!business) {
        return {
          pressReleases: 0,
          campaigns: 0,
          activeCampaigns: 0,
          journalists: 0,
          mediaOutlets: 0,
        };
      }

      const db = await getDb();
      if (!db) {
        return {
          pressReleases: 0,
          campaigns: 0,
          activeCampaigns: 0,
          journalists: 0,
          mediaOutlets: 0,
        };
      }

      // Count press releases
      const [prCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(pressReleases)
        .where(eq(pressReleases.businessId, business.id));

      // Count campaigns
      const [campaignCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(campaigns)
        .where(eq(campaigns.businessId, business.id));

      // Count active campaigns
      const [activeCampaignCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(campaigns)
        .where(
          and(
            eq(campaigns.businessId, business.id),
            eq(campaigns.status, "active")
          )
        );

      // Count journalists
      const [journalistCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(journalists)
        .where(eq(journalists.userId, ctx.user.id));

      // Count unique media outlets
      const [outletCount] = await db
        .select({ count: sql<number>`count(distinct ${journalists.mediaOutletId})` })
        .from(journalists)
        .where(
          and(
            eq(journalists.userId, ctx.user.id),
            isNotNull(journalists.mediaOutletId)
          )
        );

      return {
        pressReleases: Number(prCount?.count || 0),
        campaigns: Number(campaignCount?.count || 0),
        activeCampaigns: Number(activeCampaignCount?.count || 0),
        journalists: Number(journalistCount?.count || 0),
        mediaOutlets: Number(outletCount?.count || 0),
      };
    }),
  }),

  pressRelease: router({
    list: protectedProcedure.query(async ({ ctx}) => {
      const business = await getUserBusiness(ctx.user.id);
      if (!business) {
        return [];
      }
      return await getPressReleasesByBusiness(business.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getPressReleaseById(input.id);
      }),

    generate: protectedProcedure
      .input(
        z.object({
          topic: z.string(),
          keyPoints: z.string().optional(),
          targetAudience: z.string().optional(),
          tone: z.string().optional(),
          maxWords: z.number().optional(), // Optional: for purchased word count extensions
        })
      )
      .mutation(async ({ ctx, input }) => {
        prLogger.info("Starting press release generation", {
          userId: ctx.user.id,
          action: "generate",
          metadata: { topic: input.topic },
        });

        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          prLogger.error("Business profile not found", undefined, {
            userId: ctx.user.id,
            action: "generate",
          });
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        // Get user's subscription tier to determine word count limit
        const subscription = await getUserSubscription(ctx.user.id);
        if (!subscription) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No active subscription found",
          });
        }

        // Import word count limits and check purchased credits
        const { WORD_COUNT_LIMITS } = await import("./products");
        const { getAvailableWordCountCredits, canGeneratePressRelease } = await import("./addOnCredits");
        
        const baseWordLimit = WORD_COUNT_LIMITS[subscription.plan];
        const requestedWords = input.maxWords || baseWordLimit;
        
        // Check if user can generate press release with requested word count
        const creditCheck = await canGeneratePressRelease(ctx.user.id, requestedWords);
        
        if (!creditCheck.allowed) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `You need ${creditCheck.requiredPurchase} more words to generate this press release. Your tier allows ${baseWordLimit} words, and you have ${creditCheck.purchasedWords} purchased words remaining.`,
          });
        }
        
        const wordLimit = requestedWords;

        // Language mapping for AI prompts
        const languageNames: Record<string, string> = {
          'en-GB': 'British English',
          'en-US': 'American English',
          'es': 'Spanish',
          'fr': 'French',
          'de': 'German',
          'it': 'Italian',
          'pt': 'Portuguese',
          'nl': 'Dutch',
          'pl': 'Polish',
          'ru': 'Russian',
          'zh': 'Chinese',
          'ja': 'Japanese',
          'ko': 'Korean',
          'ar': 'Arabic',
          'hi': 'Hindi',
          'tr': 'Turkish',
        };
        
        const preferredLanguage = business.preferredLanguage || 'en-GB';
        const languageName = languageNames[preferredLanguage] || 'British English';

        const systemPrompt = `You are a professional press release writer. Generate a compelling, newsworthy press release based on the following information:

Company: ${business.name}
Brand Voice Tone: ${input.tone || business.brandVoiceTone || "formal"}
Brand Voice Style: ${business.brandVoiceStyle || "detailed"}
Target Audience: ${input.targetAudience || business.targetAudience || "general public"}
Language: ${languageName} (write the entire press release in ${languageName})

Company Dossier:
${business.dossier || "No additional context provided"}

IMPORTANT: The press release MUST be ${wordLimit} words or fewer. This is a strict requirement.

Write a professional press release that follows standard PR format with:
- Compelling headline
- Dateline
- Strong opening paragraph
- Supporting details
- Quote from company spokesperson
- Boilerplate about the company
- Contact information placeholder

Use markdown formatting for structure. Keep it concise and impactful within the ${wordLimit}-word limit.`;

        const userPrompt = `Topic: ${input.topic}

${input.keyPoints ? `Key Points to Cover:\n${input.keyPoints}` : ""}

Generate a complete, publication-ready press release.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          });

          const content = response.choices[0]?.message?.content || "";
          const tokensUsed = response.usage?.total_tokens || 0;
          // Estimated: 150-300 credits per press release (based on Manus benchmarks)
          const creditsUsed = 200;

          // Log credit usage
          await logCreditUsage({
            userId: ctx.user.id,
            featureType: "press_release_generation",
            creditsUsed,
            tokensUsed,
            metadata: {
              topic: input.topic,
              model: response.model,
              wordCount: content.length,
            },
          });

          prLogger.info("Press release generated successfully", {
            userId: ctx.user.id,
            action: "generate",
            metadata: { 
              topic: input.topic,
              wordCount: content.length,
              tokensUsed,
              creditsUsed,
            },
          });

          return { content };
        } catch (error) {
          prLogger.error("Press release generation failed", error as Error, {
            userId: ctx.user.id,
            action: "generate",
            metadata: { topic: input.topic },
          });
          throw error;
        }
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          subtitle: z.string().optional(),
          content: z.string(),
          imageUrl: z.string().optional(),
          status: z.enum(["draft", "scheduled", "published"]),
          distributionType: z.enum(["ai_assisted", "manual"]).default("ai_assisted"),
          scheduledFor: z.string().optional(), // ISO date string
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        // Check usage limits (skip for manual distribution)
        if (input.distributionType === "ai_assisted") {
          const { allowed } = await checkLimit(ctx.user.id, "pressReleases");
          if (!allowed) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Press release limit reached for your subscription tier. Please upgrade to create more.",
            });
          }
        }

        // If scheduledFor is provided, set status to scheduled
        const status = input.scheduledFor ? "scheduled" : input.status;

        const pressRelease = await createPressRelease({
          userId: ctx.user.id,
          businessId: business.id,
          title: input.title,
          subtitle: input.subtitle,
          body: input.content,
          imageUrl: input.imageUrl,
          scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : undefined,
          status: status,
          distributionType: input.distributionType,
        });

        // Increment usage counter (only for AI-assisted)
        if (input.distributionType === "ai_assisted") {
          await incrementUsage(ctx.user.id, "pressReleases");
        }

        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "create",
          entityType: "press_release",
          entityId: pressRelease.id,
          description: `Created press release: ${input.title}`,
          metadata: { title: input.title, status: input.status },
        });

        // Send notification email if published
        if (input.status === "published" && ctx.user.email && ctx.user.name) {
          const excerpt = input.content.substring(0, 200) + (input.content.length > 200 ? "..." : "");
          await sendPressReleaseNotificationEmail({
            to: ctx.user.email,
            name: ctx.user.name,
            title: input.title,
            excerpt,
          }).catch((error) => {
            prLogger.error("Failed to send press release notification email", error as Error, {
              userId: ctx.user.id,
              action: "create",
            });
          });
        }

        return pressRelease;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          content: z.string().optional(),
          status: z.enum(["draft", "scheduled", "published"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, content, ...rest } = input;
        const updates = content ? { ...rest, body: content } : rest;
        await updatePressRelease(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePressRelease(input.id);
        return { success: true };
      }),

    bulkDelete: protectedProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        const affectedRows = await bulkDeletePressReleases(input.ids);
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "delete",
          entityType: "press_release",
          description: `Bulk deleted ${affectedRows} press releases`,
          metadata: { count: affectedRows, ids: input.ids },
        });

        return { success: true, count: affectedRows };
      }),

    bulkUpdateStatus: protectedProcedure
      .input(
        z.object({
          ids: z.array(z.number()),
          status: z.enum(["draft", "scheduled", "published", "archived"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const affectedRows = await bulkUpdatePressReleaseStatus(input.ids, input.status);
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "update",
          entityType: "press_release",
          description: `Bulk updated ${affectedRows} press releases to ${input.status}`,
          metadata: { count: affectedRows, status: input.status, ids: input.ids },
        });

        return { success: true, count: affectedRows };
      }),

    generateImage: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string(),
          style: z.enum(["photorealistic", "illustration", "corporate", "abstract", "modern"]).optional(),
          mood: z.enum(["professional", "energetic", "calm", "innovative", "trustworthy"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await generatePressReleaseImage({
          pressReleaseTitle: input.title,
          pressReleaseContent: input.content,
          style: input.style,
          mood: input.mood,
        });
        return result;
      }),

    regenerateImage: protectedProcedure
      .input(z.object({ prompt: z.string() }))
      .mutation(async ({ input }) => {
        const result = await regenerateImage(input.prompt);
        return result;
      }),

    getImageStylePresets: publicProcedure.query(() => {
      return getImageStylePresets();
    }),

    generateSocialPosts: protectedProcedure
      .input(
        z.object({
          pressReleaseId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get the press release
        const pressRelease = await getPressReleaseById(input.pressReleaseId);
        if (!pressRelease) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Press release not found",
          });
        }

        // Get business for brand voice
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        // Generate platform-specific posts
        const posts = await generateSocialPostsFromPressRelease({
          pressReleaseTitle: pressRelease.title,
          pressReleaseContent: pressRelease.body,
          pressReleaseImageUrl: pressRelease.imageUrl || undefined,
          brandVoice: business.brandVoiceTone || "professional",
          targetAudience: business.targetAudience || "general audience",
          companyName: business.name,
        });

        // Save posts to database
        const savedPosts = await Promise.all(
          posts.map((post) =>
            createSocialMediaPost({
              businessId: business.id,
              platform: post.platform,
              content: post.content,
              imageUrl: post.imageUrl,
              status: "draft",
              pressReleaseId: input.pressReleaseId,
            })
          )
        );

        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "social_posts_generated",
          entityType: "press_release",
          entityId: input.pressReleaseId,
          description: `Generated ${posts.length} social media posts from press release`,
          metadata: { platforms: posts.map((p) => p.platform) },
        });

        return savedPosts;
      }),
  }),

  socialMedia: router({
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          content: z.string().optional(),
          status: z.enum(["draft", "scheduled", "published", "failed"]).optional(),
          scheduledFor: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, scheduledFor, ...rest } = input;
        const updates: any = { ...rest };
        if (scheduledFor) {
          updates.scheduledFor = new Date(scheduledFor);
        }
        
        // Update the post (need to implement updateSocialMediaPost in db.ts)
        const { updateSocialMediaPost } = await import("./socialMediaPosts");
        await updateSocialMediaPost(id, updates);

        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "update",
          entityType: "social_media_post",
          entityId: id,
          description: "Updated social media post",
          metadata: updates,
        });

        return { success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const business = await getUserBusiness(ctx.user.id);
      if (!business) {
        return [];
      }
      return await getSocialMediaPostsByBusiness(business.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          content: z.string(),
          platforms: z.array(z.string()),
          scheduledFor: z.string().optional(),
          customTones: z.record(z.string(), z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        // Social posts are unlimited for all tiers (no limit check needed)

        // Create a post for each selected platform
        const posts = await Promise.all(
          input.platforms.map((platform) =>
            createSocialMediaPost({
              businessId: business.id,
              platform: platform as any,
              content: input.content,
              status: input.scheduledFor ? "scheduled" : "draft",
              scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : undefined,
            })
          )
        );

        // Social posts are unlimited - no usage tracking needed

        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "create",
          entityType: "social_media_post",
          description: `Created social media posts for ${input.platforms.join(", ")}`,
          metadata: { platforms: input.platforms, postCount: posts.length },
        });

        return { success: true, posts };
      }),
  }),

  mediaList: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const business = await getUserBusiness(ctx.user.id);
      if (!business) {
        return [];
      }
      return await getMediaListsByBusiness(business.id);
    }),

    getPurchasedListIds: protectedProcedure.query(async ({ ctx }) => {
      const db = await import("./db").then(m => m.getDb());
      if (!db) return [];
      
      const { payments } = await import("../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      
      const purchasedPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.userId, ctx.user.id),
            eq(payments.status, "succeeded"),
            eq(payments.paymentType, "media_list_purchase")
          )
        );
      
      // Extract media list IDs from metadata
      const listIds = purchasedPayments
        .map(p => {
          try {
            const metadata = JSON.parse(p.metadata || "{}");
            return metadata.media_list_id ? parseInt(metadata.media_list_id) : null;
          } catch {
            return null;
          }
        })
        .filter((id): id is number => id !== null);
      
      return listIds;
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getMediaListById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          type: z.enum(["default", "custom", "purchased"]).optional(),
          industry: z.string().optional(),
          region: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        const mediaList = await createMediaList({
          businessId: business.id,
          name: input.name,
          description: input.description,
          type: input.type || "custom",
          industry: input.industry,
          region: input.region,
        });

        return mediaList;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateMediaList(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteMediaList(input.id);
        return { success: true };
      }),

    getContacts: protectedProcedure
      .input(z.object({ mediaListId: z.number() }))
      .query(async ({ input }) => {
        return await getContactsByMediaList(input.mediaListId);
      }),

    addContact: protectedProcedure
      .input(
        z.object({
          mediaListId: z.number(),
          name: z.string(),
          email: z.string().email(),
          publication: z.string().optional(),
          role: z.string().optional(),
          phone: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const contact = await createMediaListContact(input);
        return contact;
      }),
  }),

  ai: router({
    generateImage: protectedProcedure
      .input(z.object({ prompt: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // Check usage limits
        const { allowed } = await checkLimit(ctx.user.id, "aiImages");
        if (!allowed) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "AI image generation limit reached for your subscription tier. Please upgrade to generate more images.",
          });
        }

        const result = await generateImage({ prompt: input.prompt });

        // Log credit usage (estimated: 200-400 credits per image based on Manus benchmarks)
        await logCreditUsage({
          userId: ctx.user.id,
          featureType: "image_generation",
          creditsUsed: 300, // Estimated based on ~15 min active runtime
          tokensUsed: 0,
          metadata: {
            prompt: input.prompt,
            imageUrl: result.url,
          },
        });

        // Increment usage counter
        await incrementUsage(ctx.user.id, "aiImages");

        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "generate",
          entityType: "ai_image",
          description: `Generated AI image: ${input.prompt.substring(0, 50)}...`,
          metadata: { prompt: input.prompt },
        });

        return result;
      }),

    chat: protectedProcedure
      .input(
        z.object({
          message: z.string(),
          context: z
            .object({
              businessName: z.string(),
              industry: z.string(),
              brandVoice: z.string(),
            })
            .optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        aiLogger.info("AI assistant chat request", {
          userId: ctx.user.id,
          action: "chat",
          metadata: { messageLength: input.message.length },
        });

        // Check usage limits
        const { allowed } = await checkLimit(ctx.user.id, "aiChatMessages");
        if (!allowed) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "AI chat message limit reached for your subscription tier. Please upgrade to continue chatting.",
          });
        }

        // Load business dossier for comprehensive context
        const dossier = await getBusinessDossier(ctx.user.id);
        const business = await getUserBusiness(ctx.user.id);
        
        // Build comprehensive context from dossier
        let contextInfo = "";
        if (dossier) {
          contextInfo = `

## Business Dossier

**Company:** ${dossier.companyName || "Unknown"}
**Website:** ${dossier.website || "N/A"}
**Industry:** ${dossier.industry || "General"}
**Business Description:** ${dossier.businessDescription || "N/A"}

**Services:**
${dossier.services && dossier.services.length > 0 ? dossier.services.map((s: string) => `- ${s}`).join('\n') : "- N/A"}

**Target Audience:** ${dossier.targetAudience || "N/A"}

**Unique Selling Points:**
${dossier.uniqueSellingPoints && dossier.uniqueSellingPoints.length > 0 ? dossier.uniqueSellingPoints.map((usp: string) => `- ${usp}`).join('\n') : "- N/A"}

**Competitors:**
${dossier.competitors && dossier.competitors.length > 0 ? dossier.competitors.map((c: string) => `- ${c}`).join('\n') : "- N/A"}

**Brand Voice:** ${dossier.brandVoice || "Professional"}
**Brand Tone:** ${dossier.brandTone || "N/A"}

**Key Messages:**
${dossier.keyMessages && dossier.keyMessages.length > 0 ? dossier.keyMessages.map((msg: string) => `- ${msg}`).join('\n') : "- N/A"}

**Team:**
${dossier.employees && dossier.employees.length > 0 ? dossier.employees.map((emp: any) => `- ${emp.name} (${emp.role})${emp.bio ? ': ' + emp.bio : ''}`).join('\n') : "- N/A"}

**Contact:** ${dossier.contactEmail || "N/A"} | ${dossier.contactPhone || "N/A"}
${dossier.sportsTeamAffiliation ? `**Sports Affiliation:** ${dossier.sportsTeamAffiliation}` : ""}
`;
        }

        const systemPrompt = `You are an expert PR and marketing consultant for ${dossier?.companyName || input.context?.businessName || "a business"}. 

You have access to comprehensive business intelligence about this client. Use this information to provide highly personalized, contextual advice that aligns with their brand, industry, and business goals.${contextInfo}

Your role is to:
- Provide strategic PR and marketing advice tailored to their specific business
- Help with content creation that matches their brand voice and key messages
- Offer insights on media outreach considering their industry and competitors
- Suggest campaign ideas that leverage their unique selling points
- Answer questions using knowledge of their team, services, and target audience

Be concise, actionable, and professional. Use markdown formatting for clarity. Always consider their business context when providing advice.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input.message },
            ],
          });

          const message = response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
          const tokensUsed = response.usage?.total_tokens || 0;
          // Estimated: 50-100 credits per message (based on Manus benchmarks)
          const creditsUsed = 75;

          // Log credit usage
          await logCreditUsage({
            userId: ctx.user.id,
            featureType: "ai_chat",
            creditsUsed,
            tokensUsed,
            metadata: {
              model: response.model,
              messageLength: input.message.length,
              responseLength: typeof message === 'string' ? message.length : 0,
            },
          });

          aiLogger.info("AI assistant response generated", {
            userId: ctx.user.id,
            action: "chat",
            metadata: { 
              responseLength: typeof message === 'string' ? message.length : 0,
              tokensUsed,
              creditsUsed,
            },
          });

          // Increment usage counter
          await incrementUsage(ctx.user.id, "aiChatMessages");

          // Log activity
          await logActivity({
            userId: ctx.user.id,
            action: "chat",
            entityType: "ai_assistant",
            description: `AI chat: ${input.message.substring(0, 50)}...`,
            metadata: { messageLength: input.message.length },
          });

          // Save conversation to dossier memory
          if (dossier) {
            // Save user message
            await saveAIConversation({
              userId: ctx.user.id,
              dossierId: dossier.id,
              conversationType: "chat",
              role: "user",
              content: input.message,
            });

            // Save assistant response
            await saveAIConversation({
              userId: ctx.user.id,
              dossierId: dossier.id,
              conversationType: "chat",
              role: "assistant",
              content: typeof message === 'string' ? message : JSON.stringify(message),
            });
          }

          return { message: typeof message === 'string' ? message : '' };
        } catch (error) {
          aiLogger.error("AI assistant chat failed", error as Error, {
            userId: ctx.user.id,
            action: "chat",
            metadata: { messageLength: input.message.length },
          });
          throw error;
        }
      }),

    generateCampaignStrategy: protectedProcedure
      .input(
        z.object({
          campaignName: z.string(),
          goal: z.string(),
          targetAudience: z.string(),
          platforms: z.string(),
          budget: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        aiLogger.info("AI campaign strategy generation request", {
          userId: ctx.user.id,
          action: "generateCampaignStrategy",
          metadata: { campaignName: input.campaignName },
        });

        // Check usage limits
        const { allowed } = await checkLimit(ctx.user.id, "aiChatMessages");
        if (!allowed) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "AI usage limit reached for your subscription tier. Please upgrade to continue.",
          });
        }

        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        const systemPrompt = `You are an expert PR and marketing strategist. Generate a comprehensive campaign strategy based on the provided information. 

Provide your response in the following JSON format:
{
  "strategy": "Detailed campaign strategy (3-4 paragraphs)",
  "keyMessages": "3-5 key messages, each on a new line",
  "successMetrics": "5-7 specific, measurable success metrics, each on a new line"
}`;

        const userPrompt = `Campaign Name: ${input.campaignName}
Goal: ${input.goal}
Target Audience: ${input.targetAudience}
Platforms: ${input.platforms}
Budget: £${input.budget}

Business Context:
- Name: ${business.name}
- SIC Section: ${business.sicSection || "Not specified"}
- Brand Voice: ${business.brandVoiceTone || "Professional"}

Generate a comprehensive campaign strategy that includes:
1. Overall strategy and approach
2. Key messages tailored to the target audience
3. Specific, measurable success metrics`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "campaign_strategy",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    strategy: { type: "string", description: "Detailed campaign strategy" },
                    keyMessages: { type: "string", description: "Key messages for the campaign" },
                    successMetrics: { type: "string", description: "Success metrics for the campaign" },
                  },
                  required: ["strategy", "keyMessages", "successMetrics"],
                  additionalProperties: false,
                },
              },
            },
          });

          const message = response.choices[0]?.message;
          const content = message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("No response from AI");
          }

          const result = JSON.parse(content);
          const tokensUsed = response.usage?.total_tokens || 0;
          // Estimated: 300-500 credits per campaign (based on Manus benchmarks)
          const creditsUsed = 400;

          // Log credit usage
          await logCreditUsage({
            userId: ctx.user.id,
            featureType: "campaign_strategy_generation",
            creditsUsed,
            tokensUsed,
            metadata: {
              model: response.model,
              campaignName: input.campaignName,
              budget: input.budget,
            },
          });

          // Increment usage counter
          await incrementUsage(ctx.user.id, "aiChatMessages");

          // Log activity
          await logActivity({
            userId: ctx.user.id,
            action: "generate",
            entityType: "campaign_strategy",
            description: `Generated campaign strategy: ${input.campaignName}`,
            metadata: { campaignName: input.campaignName },
          });

          return result;
        } catch (error) {
          aiLogger.error("AI campaign strategy generation failed", error as Error, {
            userId: ctx.user.id,
            action: "generateCampaignStrategy",
            metadata: { campaignName: input.campaignName },
          });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate campaign strategy. Please try again.",
          });
        }
      }),
  }),

  campaign: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const business = await getUserBusiness(ctx.user.id);
      if (!business) {
        return [];
      }
      return await getCampaignsByBusiness(business.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getCampaignById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          goal: z.string().optional(),
          budget: z.string().optional(), // Decimal string from database
          status: z.enum(["draft", "planning", "active", "paused", "completed", "archived"]).optional(),
          platforms: z.string().optional(),
          targetAudience: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          aiGeneratedStrategy: z.string().optional(),
          keyMessages: z.string().optional(),
          successMetrics: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        // Check usage limits
        const { allowed } = await checkLimit(ctx.user.id, "campaigns");
        if (!allowed) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Campaign limit reached for your subscription tier. Please upgrade to create more.",
          });
        }

        const campaign = await createCampaign({
          businessId: business.id,
          userId: ctx.user.id,
          name: input.name,
          goal: input.goal,
          budget: input.budget,
          status: input.status || "draft",
          platforms: input.platforms,
          targetAudience: input.targetAudience,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          aiGeneratedStrategy: input.aiGeneratedStrategy,
          keyMessages: input.keyMessages,
          successMetrics: input.successMetrics,
        });

        // Increment usage counter
        await incrementUsage(ctx.user.id, "campaigns");

        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "create",
          entityType: "campaign",
          entityId: campaign.id,
          description: `Created campaign: ${input.name}`,
          metadata: { name: input.name, status: input.status || "draft" },
        });

        return campaign;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          goal: z.string().optional(),
          budget: z.string().optional(),
          status: z.enum(["draft", "planning", "active", "paused", "completed", "archived"]).optional(),
          platforms: z.string().optional(),
          targetAudience: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, startDate, endDate, ...updates } = input;
        const campaignUpdates: any = { ...updates };
        if (startDate) campaignUpdates.startDate = new Date(startDate);
        if (endDate) campaignUpdates.endDate = new Date(endDate);
        await updateCampaign(id, campaignUpdates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCampaign(input.id);
        return { success: true };
      }),

    getVariants: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ input }) => {
        return await getVariantsByCampaign(input.campaignId);
      }),

    createVariant: protectedProcedure
      .input(
        z.object({
          campaignId: z.number(),
          name: z.string(),
          content: z.string(),
          targetAudience: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const variant = await createCampaignVariant(input);
        return variant;
      }),

    bulkDelete: protectedProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        const affectedRows = await bulkDeleteCampaigns(input.ids);
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "delete",
          entityType: "campaign",
          description: `Bulk deleted ${affectedRows} campaigns`,
          metadata: { count: affectedRows, ids: input.ids },
        });

        return { success: true, count: affectedRows };
      }),

    bulkUpdateStatus: protectedProcedure
      .input(
        z.object({
          ids: z.array(z.number()),
          status: z.enum(["draft", "planning", "active", "paused", "completed", "archived"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const affectedRows = await bulkUpdateCampaignStatus(input.ids, input.status);
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "update",
          entityType: "campaign",
          description: `Bulk updated ${affectedRows} campaigns to ${input.status}`,
          metadata: { count: affectedRows, status: input.status, ids: input.ids },
        });

        return { success: true, count: affectedRows };
      }),

    // Milestones
    createMilestone: protectedProcedure
      .input(
        z.object({
          campaignId: z.number(),
          title: z.string(),
          description: z.string().optional(),
          dueDate: z.string().optional(),
          status: z.enum(["pending", "in_progress", "completed", "blocked"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const milestone = await createMilestone({
          ...input,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        });
        return milestone;
      }),

    getMilestones: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ input }) => {
        return await getMilestonesByCampaign(input.campaignId);
      }),

    updateMilestone: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          dueDate: z.string().optional(),
          status: z.enum(["pending", "in_progress", "completed", "blocked"]).optional(),
          completedAt: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, dueDate, completedAt, ...updates } = input;
        const milestoneUpdates: any = { ...updates };
        if (dueDate) milestoneUpdates.dueDate = new Date(dueDate);
        if (completedAt) milestoneUpdates.completedAt = new Date(completedAt);
        await updateMilestone(id, milestoneUpdates);
        return { success: true };
      }),

    deleteMilestone: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteMilestone(input.id);
        return { success: true };
      }),

    // Deliverables
    createDeliverable: protectedProcedure
      .input(
        z.object({
          campaignId: z.number(),
          milestoneId: z.number().optional(),
          title: z.string(),
          type: z.enum(["press_release", "social_post", "email", "blog_post", "video", "infographic", "other"]),
          status: z.enum(["draft", "in_review", "approved", "published"]).optional(),
          contentId: z.number().optional(),
          dueDate: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const deliverable = await createDeliverable({
          ...input,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        });
        return deliverable;
      }),

    getDeliverables: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ input }) => {
        return await getDeliverablesByCampaign(input.campaignId);
      }),

    getDeliverablesByMilestone: protectedProcedure
      .input(z.object({ milestoneId: z.number() }))
      .query(async ({ input }) => {
        return await getDeliverablesByMilestone(input.milestoneId);
      }),

    updateDeliverable: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          type: z.enum(["press_release", "social_post", "email", "blog_post", "video", "infographic", "other"]).optional(),
          status: z.enum(["draft", "in_review", "approved", "published"]).optional(),
          contentId: z.number().optional(),
          dueDate: z.string().optional(),
          publishedAt: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, dueDate, publishedAt, ...updates } = input;
        const deliverableUpdates: any = { ...updates };
        if (dueDate) deliverableUpdates.dueDate = new Date(dueDate);
        if (publishedAt) deliverableUpdates.publishedAt = new Date(publishedAt);
        await updateDeliverable(id, deliverableUpdates);
        return { success: true };
      }),

    deleteDeliverable: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteDeliverable(input.id);
        return { success: true };
      }),

    // Analytics
    createAnalytics: protectedProcedure
      .input(
        z.object({
          campaignId: z.number(),
          date: z.string(),
          impressions: z.number().optional(),
          clicks: z.number().optional(),
          engagements: z.number().optional(),
          conversions: z.number().optional(),
          spend: z.number().optional(),
          reach: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const analytics = await createAnalyticsEntry({
          ...input,
          date: new Date(input.date),
        });
        return analytics;
      }),

    getAnalytics: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ input }) => {
        return await getAnalyticsByCampaign(input.campaignId);
      }),

    getAnalyticsByDateRange: protectedProcedure
      .input(
        z.object({
          campaignId: z.number(),
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ input }) => {
        return await getAnalyticsByDateRange(
          input.campaignId,
          new Date(input.startDate),
          new Date(input.endDate)
        );
      }),

    updateAnalytics: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          impressions: z.number().optional(),
          clicks: z.number().optional(),
          engagements: z.number().optional(),
          conversions: z.number().optional(),
          spend: z.number().optional(),
          reach: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateAnalyticsEntry(id, updates);
        return { success: true };
      }),

    // Campaign Templates
    listTemplates: protectedProcedure.query(async ({ ctx }) => {
      return await getAllCampaignTemplates(ctx.user.id);
    }),

    getTemplate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getCampaignTemplateById(input.id);
      }),

    createTemplate: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          category: z.string().optional(),
          goal: z.string().optional(),
          targetAudience: z.string().optional(),
          platforms: z.string().optional(),
          suggestedBudget: z.string().optional(),
          suggestedDuration: z.number().optional(),
          strategy: z.string().optional(),
          keyMessages: z.string().optional(),
          successMetrics: z.string().optional(),
          milestones: z.string().optional(), // JSON string
          deliverables: z.string().optional(), // JSON string
          isPublic: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const template = await createCampaignTemplate({
          ...input,
          userId: ctx.user.id,
        });
        return template;
      }),

    updateTemplate: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          category: z.string().optional(),
          goal: z.string().optional(),
          targetAudience: z.string().optional(),
          platforms: z.string().optional(),
          suggestedBudget: z.string().optional(),
          suggestedDuration: z.number().optional(),
          strategy: z.string().optional(),
          keyMessages: z.string().optional(),
          successMetrics: z.string().optional(),
          milestones: z.string().optional(),
          deliverables: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateCampaignTemplate(id, updates);
        return { success: true };
      }),

    deleteTemplate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCampaignTemplate(input.id);
        return { success: true };
      }),

    useTemplate: protectedProcedure
      .input(z.object({ templateId: z.number() }))
      .mutation(async ({ input }) => {
        await incrementTemplateUsage(input.templateId);
        const template = await getCampaignTemplateById(input.templateId);
        return template;
      }),

    // Team collaboration
    addTeamMember: protectedProcedure
      .input(
        z.object({
          campaignId: z.number(),
          userId: z.number(),
          role: z.enum(["owner", "editor", "viewer"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Check if current user has permission to add team members
        const permission = await checkCampaignPermission(input.campaignId, ctx.user.id);
        if (permission !== "owner") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only campaign owners can add team members",
          });
        }

        const member = await addCampaignTeamMember({
          ...input,
          addedBy: ctx.user.id,
        });

        // Log activity
        await logCampaignActivity({
          campaignId: input.campaignId,
          userId: ctx.user.id,
          action: "added_team_member",
          entityType: "team_member",
          changes: { userId: input.userId, role: input.role },
        });

        return member;
      }),

    getTeamMembers: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Check if user has access to this campaign
        const permission = await checkCampaignPermission(input.campaignId, ctx.user.id);
        if (!permission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this campaign",
          });
        }

        return await getCampaignTeamMembers(input.campaignId);
      }),

    removeTeamMember: protectedProcedure
      .input(z.object({ id: z.number(), campaignId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const permission = await checkCampaignPermission(input.campaignId, ctx.user.id);
        if (permission !== "owner") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only campaign owners can remove team members",
          });
        }

        await removeCampaignTeamMember(input.id);

        await logCampaignActivity({
          campaignId: input.campaignId,
          userId: ctx.user.id,
          action: "removed_team_member",
          entityType: "team_member",
          entityId: input.id,
        });
      }),

    updateTeamMemberRole: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          campaignId: z.number(),
          role: z.enum(["owner", "editor", "viewer"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const permission = await checkCampaignPermission(input.campaignId, ctx.user.id);
        if (permission !== "owner") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only campaign owners can update team member roles",
          });
        }

        await updateCampaignTeamMemberRole(input.id, input.role);

        await logCampaignActivity({
          campaignId: input.campaignId,
          userId: ctx.user.id,
          action: "updated_team_member_role",
          entityType: "team_member",
          entityId: input.id,
          changes: { role: input.role },
        });
      }),

    getActivityLog: protectedProcedure
      .input(z.object({ campaignId: z.number(), limit: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        const permission = await checkCampaignPermission(input.campaignId, ctx.user.id);
        if (!permission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this campaign",
          });
        }

        return await getCampaignActivityLog(input.campaignId, input.limit);
      }),

    // Campaign Optimization
    optimizeCampaign: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { autoOptimizeCampaign } = await import("./campaignOptimization");
        const result = await autoOptimizeCampaign(input.campaignId);

        if (result.optimized) {
          await logCampaignActivity({
            campaignId: input.campaignId,
            userId: ctx.user.id,
            action: "optimized",
            entityType: "campaign",
            changes: { winnerId: result.winnerId },
          });
        }

        return result;
      }),

    getPerformanceSummary: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ input }) => {
        const { getCampaignPerformanceSummary } = await import("./campaignOptimization");
        return await getCampaignPerformanceSummary(input.campaignId);
      }),

    aiAssistant: protectedProcedure
      .input(
        z.object({
          campaignId: z.number().optional(),
          message: z.string(),
          conversationHistory: z.array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        }

        // Build context for AI
        let systemPrompt = `You are a campaign strategy AI assistant for ${business.name}. `;
        
        if (input.campaignId) {
          // Get campaign details for context
          const { getCampaignById } = await import("./campaigns");
          const campaign = await getCampaignById(input.campaignId);
          if (!campaign) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
          }
          
          systemPrompt += `You are helping optimize an existing campaign: "${campaign.name}". `;
          systemPrompt += `Goal: ${campaign.goal}. Budget: ${campaign.budget}. Status: ${campaign.status}. `;
          systemPrompt += `Provide specific, actionable advice for improving this campaign's performance. `;
          systemPrompt += `Analyze metrics, suggest A/B test variations, recommend budget adjustments, and identify optimization opportunities.`;
        } else {
          systemPrompt += `You are helping plan a new campaign. `;
          systemPrompt += `Ask clarifying questions about goals, target audience, budget, and platforms. `;
          systemPrompt += `Provide strategic recommendations, suggest campaign structures, and guide the user through best practices. `;
          systemPrompt += `Be specific and actionable in your advice.`;
        }

        // Add business context
        if (business.brandVoiceTone) {
          systemPrompt += ` Brand voice: ${business.brandVoiceTone}.`;
        }
        if (business.targetAudience) {
          systemPrompt += ` Target audience: ${business.targetAudience}.`;
        }

        // Call LLM
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...input.conversationHistory.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: "user", content: input.message },
          ],
        });

        const aiMessage = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        return {
          message: aiMessage,
        };
      }),
  }),

  partner: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      // Only admins can list partners
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }
      return await getAllPartners();
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        return await getPartnerById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          type: z.string().optional(),
          contactName: z.string().optional(),
          contactEmail: z.string().email(),
          commissionRate: z.number().optional(),
          status: z.enum(["active", "inactive", "pending"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }

        const partner = await createPartner({
          userId: ctx.user.id,
          organizationName: input.name,
          organizationType: input.type,
          commissionRate: input.commissionRate || 20,
          status: input.status || "active",
        });

        return partner;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          organizationName: z.string().optional(),
          status: z.enum(["active", "inactive", "pending"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        const { id, ...updates } = input;
        await updatePartner(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        await deletePartner(input.id);
        return { success: true };
      }),

    // Marketing Materials Library
    getMarketingMaterials: protectedProcedure.query(async () => {
      const { getAllMarketingMaterials } = await import("./partnerMaterials");
      return await getAllMarketingMaterials();
    }),

    getMaterialsByCategory: protectedProcedure
      .input(
        z.object({
          category: z.enum(["logo", "banner", "brochure", "presentation", "email_template", "social_media", "video", "other"]),
        })
      )
      .query(async ({ input }) => {
        const { getMarketingMaterialsByCategory } = await import("./partnerMaterials");
        return await getMarketingMaterialsByCategory(input.category);
      }),

    trackDownload: protectedProcedure
      .input(z.object({ materialId: z.number(), partnerId: z.number() }))
      .mutation(async ({ input }) => {
        const { trackMaterialDownload } = await import("./partnerMaterials");
        await trackMaterialDownload(input.materialId, input.partnerId);
        return { success: true };
      }),

    // Commission Reporting
    getCommissionReport: protectedProcedure
      .input(
        z.object({
          partnerId: z.number(),
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        const { generateCommissionReport } = await import("./partnerMaterials");
        return await generateCommissionReport(
          input.partnerId,
          new Date(input.startDate),
          new Date(input.endDate)
        );
      }),

    getAllCommissionPayouts: protectedProcedure
      .input(z.object({ status: z.enum(["pending", "processing", "paid", "failed"]).optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        const { getAllCommissionPayouts } = await import("./partnerMaterials");
        return await getAllCommissionPayouts(input.status);
      }),

    // Account Manager Assignment
    assignAccountManager: protectedProcedure
      .input(z.object({ partnerId: z.number(), managerId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }
        const { assignAccountManager } = await import("./partnerMaterials");
        return await assignAccountManager(input.partnerId, input.managerId);
      }),

    getAccountManager: protectedProcedure
      .input(z.object({ partnerId: z.number() }))
      .query(async ({ input }) => {
        const { getPartnerAccountManager } = await import("./partnerMaterials");
        return await getPartnerAccountManager(input.partnerId);
      }),
  }),

  stripe: router({
    createCheckout: protectedProcedure
      .input(
        z.object({
          tier: z.enum(["starter", "pro", "scale"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const product = getProductByTier(input.tier);
        
        if (!product.stripePriceId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Stripe price ID not configured for this tier. Please contact support.",
          });
        }

        const origin = ctx.req.headers.origin || "http://localhost:3000";

        const session = await createCheckoutSession({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          userName: ctx.user.name || "",
          priceId: product.stripePriceId,
          tier: input.tier,
          origin,
        });

        return { url: session.url };
      }),

    createPortal: protectedProcedure.mutation(async ({ ctx }) => {
      const subscription = await getUserSubscription(ctx.user.id);
      
      if (!subscription || !subscription.stripeCustomerId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active subscription found",
        });
      }

      const origin = ctx.req.headers.origin || "http://localhost:3000";

      const session = await createPortalSession({
        customerId: subscription.stripeCustomerId,
        origin,
      });

      return { url: session.url };
    }),

    purchaseMediaList: protectedProcedure
      .input(
        z.object({
          mediaListId: z.number(),
          mediaListName: z.string(),
          pressReleaseId: z.number().optional(),
          amount: z.number().default(400), // £4 in pence
        })
      )
      .mutation(async ({ ctx, input }) => {
        const origin = ctx.req.headers.origin || "http://localhost:3000";

        const session = await createMediaListPurchaseSession({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          userName: ctx.user.name || "",
          mediaListId: input.mediaListId,
          mediaListName: input.mediaListName,
          pressReleaseId: input.pressReleaseId,
          amount: input.amount,
          origin,
        });

        return { url: session.url };
      }),
  }),

  distribution: router({
    getByPressRelease: protectedProcedure
      .input(z.object({ pressReleaseId: z.number() }))
      .query(async ({ input }) => {
        return await getDistributionsByPressRelease(input.pressReleaseId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          pressReleaseId: z.number(),
          mediaListId: z.number(),
          recipientCount: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Distributions are unlimited for all tiers (no limit check needed)

        const distribution = await createDistribution({
          pressReleaseId: input.pressReleaseId,
          mediaListId: input.mediaListId,
          status: "pending",
          recipientCount: input.recipientCount || 0,
        });

        // Distributions are unlimited - no usage tracking needed
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "create",
          entityType: "distribution",
          entityId: distribution.id,
          description: `Created distribution for press release ID ${input.pressReleaseId}`,
          metadata: { pressReleaseId: input.pressReleaseId, mediaListId: input.mediaListId },
        });

        return distribution;
      }),

    markSent: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markDistributionSent(input.id);
        return { success: true };
      }),

    updateStats: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          openCount: z.number().optional(),
          clickCount: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...stats } = input;
        await updateDistributionStats(id, stats);
        return { success: true };
      }),
  }),

  tracking: router({
    engagement: protectedProcedure
      .input(z.object({ pressReleaseId: z.number() }))
      .query(async ({ input }) => {
        return await getPressReleaseEngagement(input.pressReleaseId);
      }),
  }),

  socialAccounts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await import("./db").then(m => m.getDb());
      if (!db) return [];
      
      const { socialAccounts } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      
      return await db.select().from(socialAccounts).where(eq(socialAccounts.userId, ctx.user.id));
    }),

    disconnect: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db").then(m => m.getDb());
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { socialAccounts } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        
        await db.delete(socialAccounts).where(
          and(
            eq(socialAccounts.id, input.id),
            eq(socialAccounts.userId, ctx.user.id)
          )
        );
        return { success: true };
      }),
  }),

  errorLogs: router({
    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().optional(),
          level: z.enum(["info", "warn", "error", "debug"]).optional(),
          userId: z.number().optional(),
          component: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        // Only admins can view error logs
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can view error logs",
          });
        }

        return await getErrorLogs(input);
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      // Only admins can view error stats
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view error stats",
        });
      }

      return await getErrorStats();
    }),
  }),

  notificationPreferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const preferences = await getNotificationPreferences(ctx.user.id);
      
      // Return with boolean values and defaults
      if (!preferences) {
        return {
          emailNotifications: true,
          pressReleaseNotifications: true,
          campaignNotifications: true,
          socialMediaNotifications: true,
          weeklyDigest: true,
          marketingEmails: false,
          usageLimitAlertsEnabled: true,
          usageLimitThreshold: 80,
          scheduledPublishAlertsEnabled: true,
          scheduledPublishAdvanceNotice: 60,
          campaignMilestoneAlertsEnabled: true,
          weeklySummaryEnabled: true,
          weeklySummaryDay: "monday" as const,
          monthlyAnalyticsEnabled: true,
          distributionAlertsEnabled: true,
        };
      }

      return {
        emailNotifications: !!preferences.emailNotifications,
        pressReleaseNotifications: !!preferences.pressReleaseNotifications,
        campaignNotifications: !!preferences.campaignNotifications,
        socialMediaNotifications: !!preferences.socialMediaNotifications,
        weeklyDigest: !!preferences.weeklyDigest,
        marketingEmails: !!preferences.marketingEmails,
        usageLimitAlertsEnabled: !!preferences.usageLimitAlertsEnabled,
        usageLimitThreshold: preferences.usageLimitThreshold || 80,
        scheduledPublishAlertsEnabled: !!preferences.scheduledPublishAlertsEnabled,
        scheduledPublishAdvanceNotice: preferences.scheduledPublishAdvanceNotice || 60,
        campaignMilestoneAlertsEnabled: !!preferences.campaignMilestoneAlertsEnabled,
        weeklySummaryEnabled: !!preferences.weeklySummaryEnabled,
        weeklySummaryDay: preferences.weeklySummaryDay || "monday",
        monthlyAnalyticsEnabled: !!preferences.monthlyAnalyticsEnabled,
        distributionAlertsEnabled: !!preferences.distributionAlertsEnabled,
      };
    }),

    update: protectedProcedure
      .input(
        z.object({
          emailNotifications: z.boolean().optional(),
          pressReleaseNotifications: z.boolean().optional(),
          campaignNotifications: z.boolean().optional(),
          socialMediaNotifications: z.boolean().optional(),
          weeklyDigest: z.boolean().optional(),
          marketingEmails: z.boolean().optional(),
          usageLimitAlertsEnabled: z.boolean().optional(),
          usageLimitThreshold: z.number().min(50).max(100).optional(),
          scheduledPublishAlertsEnabled: z.boolean().optional(),
          scheduledPublishAdvanceNotice: z.number().min(15).max(1440).optional(),
          campaignMilestoneAlertsEnabled: z.boolean().optional(),
          weeklySummaryEnabled: z.boolean().optional(),
          weeklySummaryDay: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).optional(),
          monthlyAnalyticsEnabled: z.boolean().optional(),
          distributionAlertsEnabled: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const updated = await upsertNotificationPreferences(ctx.user.id, input);

        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "update",
          entityType: "notification_preferences",
          entityId: updated?.id || 0,
          description: "Updated notification preferences",
          metadata: input,
        });

        return {
          success: true,
          preferences: updated,
        };
      }),
  }),

  activityLog: router({
    recent: protectedProcedure
      .input(z.object({ limit: z.number().optional().default(10) }))
      .query(async ({ ctx, input }) => {
        const logs = await getActivityLogs(ctx.user.id, input.limit);
        
        // Parse metadata JSON strings back to objects
        return logs.map((log: any) => ({
          ...log,
          metadata: log.metadata ? JSON.parse(log.metadata) : {},
        }));
      }),

    byDateRange: protectedProcedure
      .input(z.object({ days: z.number().optional().default(7) }))
      .query(async ({ ctx, input }) => {
        const logs = await getRecentActivity(ctx.user.id, input.days);
        
        // Parse metadata JSON strings back to objects
        return logs.map((log: any) => ({
          ...log,
          metadata: log.metadata ? JSON.parse(log.metadata) : {},
        }));
      }),
  }),

  export: router({
    pressReleases: protectedProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          status: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        const options = {
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          status: input.status,
        };

        const csv = await exportPressReleasesToCSV(business.id, options);
        return { csv, filename: `press-releases-${Date.now()}.csv` };
      }),

    campaigns: protectedProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          status: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        const options = {
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          status: input.status,
        };

        const csv = await exportCampaignsToCSV(business.id, options);
        return { csv, filename: `campaigns-${Date.now()}.csv` };
      }),

    analytics: protectedProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        const options = {
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        };

        const csv = await exportAnalyticsToCSV(business.id, options);
        return { csv, filename: `analytics-${Date.now()}.csv` };
      }),
  }),

  aiTemplate: router({
    fillTemplate: protectedProcedure
      .input(
        z.object({
          templateBody: z.string(),
          templateTitle: z.string(),
          templateSubtitle: z.string(),
          data: z.object({
            companyName: z.string().optional(),
            industry: z.string().optional(),
            productName: z.string().optional(),
            keyBenefit: z.string().optional(),
            uniqueFeature: z.string().optional(),
            ceoName: z.string().optional(),
            ceoTitle: z.string().optional(),
            website: z.string().optional(),
            additionalContext: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { fillPressReleaseTemplate } = await import("./aiTemplateFiller");
        
        const result = await fillPressReleaseTemplate(
          input.templateBody,
          input.templateTitle,
          input.templateSubtitle,
          input.data
        );

        await logActivity({
          userId: ctx.user.id,
          action: "ai_template_filled",
          entityType: "press_release",
          metadata: { templateTitle: input.templateTitle },
        });

        return result;
      }),

    suggestFields: protectedProcedure
      .input(
        z.object({
          templateType: z.string(),
          companyInfo: z.object({
            name: z.string().optional(),
            industry: z.string().optional(),
            description: z.string().optional(),
          }),
        })
      )
      .query(async ({ input }) => {
        const { suggestTemplateFields } = await import("./aiTemplateFiller");
        return await suggestTemplateFields(input.templateType, input.companyInfo);
      }),
  }),

  emailTemplate: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const business = await getUserBusiness(ctx.user.id);
      if (!business) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Business profile not found",
        });
      }
      return await getEmailTemplates(business.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getEmailTemplateById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          subject: z.string().optional(),
          headerHtml: z.string().optional(),
          footerHtml: z.string().optional(),
          primaryColor: z.string().optional(),
          secondaryColor: z.string().optional(),
          logoUrl: z.string().optional(),
          isDefault: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        const template = await createEmailTemplate({
          businessId: business.id,
          ...input,
        });

        await logActivity({
          userId: ctx.user.id,
          action: "email_template_created",
          entityType: "email_template",
          entityId: template!.id,
          metadata: { templateName: input.name },
        });

        return template;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          subject: z.string().optional(),
          headerHtml: z.string().optional(),
          footerHtml: z.string().optional(),
          primaryColor: z.string().optional(),
          secondaryColor: z.string().optional(),
          logoUrl: z.string().optional(),
          isDefault: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const template = await updateEmailTemplate(id, data);

        await logActivity({
          userId: ctx.user.id,
          action: "email_template_updated",
          entityType: "email_template",
          entityId: id,
          metadata: { templateName: data.name },
        });

        return template;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteEmailTemplate(input.id);

        await logActivity({
          userId: ctx.user.id,
          action: "email_template_deleted",
          entityType: "email_template",
          entityId: input.id,
        });

        return { success: true };
      }),

    getDefault: protectedProcedure.query(async ({ ctx }) => {
      const business = await getUserBusiness(ctx.user.id);
      if (!business) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Business profile not found",
        });
      }
      return await getDefaultEmailTemplate(business.id);
    }),
  }),

  team: router({
    members: protectedProcedure.query(async ({ ctx }) => {
      const business = await getUserBusiness(ctx.user.id);
      if (!business) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Business profile not found",
        });
      }
      return await getTeamMembersByBusinessId(business.id);
    }),

    invitations: protectedProcedure.query(async ({ ctx }) => {
      const business = await getUserBusiness(ctx.user.id);
      if (!business) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Business profile not found",
        });
      }
      return await getTeamInvitationsByBusinessId(business.id);
    }),

    invite: protectedProcedure
      .input(
        z.object({
          email: z.string().email(),
          role: z.enum(["admin", "editor", "viewer"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        const token = generateInvitationToken();
        const expiresAt = getInvitationExpiry();

        await createTeamInvitation({
          businessId: business.id,
          email: input.email,
          role: input.role,
          token,
          invitedBy: ctx.user.id,
          expiresAt,
        });

        await logActivity({
          userId: ctx.user.id,
          action: "team_member_invited",
          entityType: "team_invitation",
          metadata: { email: input.email, role: input.role },
        });

        return { success: true, token };
      }),

    acceptInvitation: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const invitation = await getTeamInvitationByToken(input.token);
        
        if (!invitation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invitation not found",
          });
        }

        if (invitation.status !== "pending") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invitation is no longer valid",
          });
        }

        if (new Date() > new Date(invitation.expiresAt)) {
          await updateTeamInvitationStatus(invitation.id, "expired");
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invitation has expired",
          });
        }

        await createTeamMember({
          businessId: invitation.businessId,
          userId: ctx.user.id,
          role: invitation.role,
          invitedBy: invitation.invitedBy,
        });

        await updateTeamInvitationStatus(invitation.id, "accepted");

        await logActivity({
          userId: ctx.user.id,
          action: "team_invitation_accepted",
          entityType: "team_member",
          metadata: { role: invitation.role },
        });

        return { success: true };
      }),

    updateRole: protectedProcedure
      .input(
        z.object({
          memberId: z.number(),
          role: z.enum(["admin", "editor", "viewer"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        const member = await getTeamMemberByUserAndBusiness(ctx.user.id, business.id);
        if (!member || !hasPermission(member.role, "admin")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can change roles",
          });
        }

        await updateTeamMemberRole(input.memberId, input.role);

        await logActivity({
          userId: ctx.user.id,
          action: "team_member_role_updated",
          entityType: "team_member",
          entityId: input.memberId,
          metadata: { newRole: input.role },
        });

        return { success: true };
      }),

    removeMember: protectedProcedure
      .input(z.object({ memberId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        const member = await getTeamMemberByUserAndBusiness(ctx.user.id, business.id);
        if (!member || !hasPermission(member.role, "admin")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can remove team members",
          });
        }

        await deleteTeamMember(input.memberId);

        await logActivity({
          userId: ctx.user.id,
          action: "team_member_removed",
          entityType: "team_member",
          entityId: input.memberId,
        });

        return { success: true };
      }),
  }),

  savedFilters: router({
    list: protectedProcedure
      .input(z.object({ entityType: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        return await getSavedFiltersByUserId(ctx.user.id, input.entityType);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          entityType: z.string(),
          filterData: z.any(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createSavedFilter({
          userId: ctx.user.id,
          name: input.name,
          entityType: input.entityType,
          filterData: input.filterData,
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteSavedFilter(input.id);
        return { success: true };
      }),
  }),

  approvalRequests: router({
    create: protectedProcedure
      .input(
        z.object({
          pressReleaseId: z.number(),
          requestMessage: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createApprovalRequest({
          pressReleaseId: input.pressReleaseId,
          requesterId: ctx.user.id,
          requestMessage: input.requestMessage,
        });

        await logActivity({
          userId: ctx.user.id,
          action: "approval_requested",
          entityType: "press_release",
          entityId: input.pressReleaseId,
        });

        return { success: true };
      }),

    listByPressRelease: protectedProcedure
      .input(z.object({ pressReleaseId: z.number() }))
      .query(async ({ input }) => {
        return await getApprovalRequestsByPressRelease(input.pressReleaseId);
      }),

    listPending: protectedProcedure.query(async ({ ctx }) => {
      return await getPendingApprovalRequests(ctx.user.id);
    }),

    approve: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          responseMessage: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateApprovalRequest(input.id, {
          status: "approved",
          approverId: ctx.user.id,
          responseMessage: input.responseMessage,
          respondedAt: new Date(),
        });

        await logActivity({
          userId: ctx.user.id,
          action: "approval_granted",
          entityType: "approval_request",
          entityId: input.id,
        });

        return { success: true };
      }),

    reject: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          responseMessage: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateApprovalRequest(input.id, {
          status: "rejected",
          approverId: ctx.user.id,
          responseMessage: input.responseMessage,
          respondedAt: new Date(),
        });

        await logActivity({
          userId: ctx.user.id,
          action: "approval_rejected",
          entityType: "approval_request",
          entityId: input.id,
        });

        return { success: true };
      }),

    addComment: protectedProcedure
      .input(
        z.object({
          approvalRequestId: z.number(),
          comment: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createApprovalComment({
          approvalRequestId: input.approvalRequestId,
          userId: ctx.user.id,
          comment: input.comment,
        });

        return { success: true };
      }),

    getComments: protectedProcedure
      .input(z.object({ approvalRequestId: z.number() }))
      .query(async ({ input }) => {
        return await getApprovalComments(input.approvalRequestId);
      }),
  }),

  contentVersions: router({
    list: protectedProcedure
      .input(z.object({ pressReleaseId: z.number() }))
      .query(async ({ input }) => {
        return await getContentVersions(input.pressReleaseId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getContentVersion(input.id);
      }),
  }),

  usageTracking: router({
    current: protectedProcedure.query(async ({ ctx }) => {
      const usage = await getCurrentUsage(ctx.user.id);
      const subscription = await getUserSubscription(ctx.user.id);

      if (!subscription || !usage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usage or subscription data not found",
        });
      }

      const tierLimits = TIER_LIMITS[subscription.plan];

      return {
        pressReleases: usage.pressReleasesCreated,
        socialMediaPosts: usage.socialPostsCreated,
        campaigns: usage.campaignsCreated,
        distributions: usage.distributionsSent,
        aiImages: usage.aiImagesGenerated,
        aiChatMessages: usage.aiChatMessages,
        limits: {
          pressReleases: tierLimits.pressReleases,
          socialMediaPosts: -1, // Unlimited for all tiers
          campaigns: tierLimits.campaigns,
          distributions: -1, // Unlimited for all tiers
          aiImages: tierLimits.aiImages,
          aiChatMessages: tierLimits.aiChatMessages,
        },
        period: usage.period,
      };
    }),
  }),

  // Webhook Configuration (Admin only)
  webhooks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      // Admin only
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can manage webhooks",
        });
      }

      const { getWebhookConfigs } = await import("./webhookConfigs");
      return await getWebhookConfigs();
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          eventType: z.enum(["user.registered", "user.onboarded", "social_media.post_created"]),
          webhookUrl: z.string().url(),
          isActive: z.boolean().default(true),
          retryAttempts: z.number().min(1).max(5).default(3),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Admin only
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can manage webhooks",
          });
        }

        const { createWebhookConfig } = await import("./webhookConfigs");
        return await createWebhookConfig({
          name: input.name,
          eventType: input.eventType,
          webhookUrl: input.webhookUrl,
          isActive: input.isActive ? 1 : 0,
          retryAttempts: input.retryAttempts,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          webhookUrl: z.string().url().optional(),
          isActive: z.boolean().optional(),
          retryAttempts: z.number().min(1).max(5).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Admin only
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can manage webhooks",
          });
        }

        const { updateWebhookConfig } = await import("./webhookConfigs");
        const { id, ...data } = input;
        return await updateWebhookConfig(id, {
          ...data,
          isActive: data.isActive !== undefined ? (data.isActive ? 1 : 0) : undefined,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Admin only
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can manage webhooks",
          });
        }

        const { deleteWebhookConfig } = await import("./webhookConfigs");
        return await deleteWebhookConfig(input.id);
      }),

    logs: protectedProcedure
      .input(
        z.object({
          webhookConfigId: z.number().optional(),
          limit: z.number().min(1).max(200).default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        // Admin only
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can view webhook logs",
          });
        }

        const { getWebhookDeliveryLogs, getRecentWebhookLogs } = await import("./webhookConfigs");
        if (input.webhookConfigId) {
          return await getWebhookDeliveryLogs(input.webhookConfigId, input.limit);
        }
        return await getRecentWebhookLogs(input.limit);
      }),

    // Test endpoint to manually trigger webhook
    test: protectedProcedure
      .input(
        z.object({
          eventType: z.enum(["user.registered", "user.onboarded", "social_media.post_created"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Admin only
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can test webhooks",
          });
        }

        const { triggerWebhook } = await import("./webhooks");
        
        // Create test payload based on event type
        let testPayload: any;
        
        if (input.eventType === "social_media.post_created") {
          // Social media post test payload
          testPayload = {
            post: {
              id: 1,
              content: "Test post from UpsurgeIQ! 🚀 This is a sample social media post to verify the webhook integration is working correctly.",
              platforms: ["facebook", "instagram", "linkedin"],
              scheduledFor: null,
              image: {
                url: "https://picsum.photos/1200/630",
                fileName: "test-post-image.jpg",
                dataUrl: "https://picsum.photos/1200/630", // In production, this would be a base64 data URL
              },
            },
            user: {
              id: ctx.user.id,
              email: ctx.user.email,
              name: ctx.user.name || "Test User",
            },
            business: {
              name: "Test Business Corp",
              brandVoice: "professional",
            },
          };
        } else {
          // User onboarding test payload
          testPayload = {
            user: {
              id: ctx.user.id,
              email: ctx.user.email,
              name: ctx.user.name || "Test User",
              phone: "+1234567890",
            },
            business: {
              name: "Test Business Corp",
              industry: "Technology",
              size: "11-50",
              website: "https://testbusiness.com",
              targetAudience: "B2B SaaS companies looking to scale their PR efforts",
              marketingGoals: "Increase brand awareness and generate qualified leads",
            },
            subscription: {
              plan: "Pro",
              status: "active",
            },
            timestamp: new Date().toISOString(),
            isTest: true,
          };
        }

        await triggerWebhook(input.eventType, testPayload);
        
        return {
          success: true,
          message: "Test webhook triggered successfully. Check Make.com for delivery.",
          payload: testPayload,
        };
      }),
  }),

  // ========================================
  // JOURNALIST MEDIA LIST MANAGEMENT
  // ========================================
  journalists: router({
    // Create journalist
    create: protectedProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        title: z.string().optional(),
        mediaOutletId: z.number().optional(),
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
        website: z.string().optional(),
        bio: z.string().optional(),
        notes: z.string().optional(),
        beatIds: z.array(z.number()).optional(),
        tagIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { beatIds, tagIds, ...journalistData } = input;
        
        const journalistId = await createJournalist({
          ...journalistData,
          userId: ctx.user.id,
        });

        // Assign beats
        if (beatIds && beatIds.length > 0) {
          for (const beatId of beatIds) {
            await assignBeatToJournalist(journalistId, beatId);
          }
        }

        // Assign tags
        if (tagIds && tagIds.length > 0) {
          for (const tagId of tagIds) {
            await assignTagToJournalist(journalistId, tagId);
          }
        }

        return { id: journalistId };
      }),

    // Get all journalists for current user
    list: protectedProcedure.query(async ({ ctx }) => {
      return getJournalistsByUserId(ctx.user.id);
    }),

    // Get journalist by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getJournalistById(input.id);
      }),

    // Update journalist
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        title: z.string().optional(),
        mediaOutletId: z.number().optional(),
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
        website: z.string().optional(),
        bio: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(["active", "inactive", "bounced"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateJournalist(id, data);
        return { success: true };
      }),

    // Delete journalist
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteJournalist(input.id);
        return { success: true };
      }),

    // Search journalists
    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ ctx, input }) => {
        return searchJournalists(ctx.user.id, input.query);
      }),

    // Get journalists by outlet
    byOutlet: protectedProcedure
      .input(z.object({ outletId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getJournalistsByOutlet(ctx.user.id, input.outletId);
      }),

    // Get journalists by beat
    byBeat: protectedProcedure
      .input(z.object({ beatId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getJournalistsByBeat(ctx.user.id, input.beatId);
      }),

    // Get journalists by tag
    byTag: protectedProcedure
      .input(z.object({ tagId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getJournalistsByTag(ctx.user.id, input.tagId);
      }),

    // Assign beat to journalist
    assignBeat: protectedProcedure
      .input(z.object({
        journalistId: z.number(),
        beatId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await assignBeatToJournalist(input.journalistId, input.beatId);
        return { success: true };
      }),

    // Remove beat from journalist
    removeBeat: protectedProcedure
      .input(z.object({
        journalistId: z.number(),
        beatId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await removeBeatFromJournalist(input.journalistId, input.beatId);
        return { success: true };
      }),

    // Assign tag to journalist
    assignTag: protectedProcedure
      .input(z.object({
        journalistId: z.number(),
        tagId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await assignTagToJournalist(input.journalistId, input.tagId);
        return { success: true };
      }),

    // Remove tag from journalist
    removeTag: protectedProcedure
      .input(z.object({
        journalistId: z.number(),
        tagId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await removeTagFromJournalist(input.journalistId, input.tagId);
        return { success: true };
      }),

    // Get beats for journalist
    getBeats: protectedProcedure
      .input(z.object({ journalistId: z.number() }))
      .query(async ({ input }) => {
        return getBeatsByJournalist(input.journalistId);
      }),

    // Get tags for journalist
    getTags: protectedProcedure
      .input(z.object({ journalistId: z.number() }))
      .query(async ({ input }) => {
        return getTagsByJournalist(input.journalistId);
      }),

    // Create outreach record
    createOutreach: protectedProcedure
      .input(z.object({
        journalistId: z.number(),
        type: z.enum(["email", "phone", "social", "meeting"]),
        subject: z.string().optional(),
        message: z.string().optional(),
        sentAt: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        const outreachId = await createOutreach({
          ...input,
          userId: ctx.user.id,
        });
        return { id: outreachId };
      }),

    // Get outreach history
    getOutreach: protectedProcedure
      .input(z.object({ journalistId: z.number() }))
      .query(async ({ input }) => {
        return getOutreachByJournalist(input.journalistId);
      }),

    // Update outreach status
    updateOutreachStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["sent", "opened", "replied", "bounced", "no_response"]),
        timestamp: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateOutreachStatus(input.id, input.status, input.timestamp);
        return { success: true };
      }),

    // Get outreach statistics
    getStats: protectedProcedure.query(async ({ ctx }) => {
      return getOutreachStats(ctx.user.id);
    }),
  }),

  // Media Outlets
  mediaOutlets: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        website: z.string().optional(),
        type: z.enum(["newspaper", "magazine", "online", "tv", "radio", "podcast", "blog"]),
        reach: z.enum(["local", "regional", "national", "international"]).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const outletId = await createMediaOutlet(input);
        return { id: outletId };
      }),

    list: protectedProcedure.query(async () => {
      return getAllMediaOutlets();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getMediaOutletById(input.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        website: z.string().optional(),
        type: z.enum(["newspaper", "magazine", "online", "tv", "radio", "podcast", "blog"]).optional(),
        reach: z.enum(["local", "regional", "national", "international"]).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateMediaOutlet(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteMediaOutlet(input.id);
        return { success: true };
      }),
  }),

  // Journalist Beats
  journalistBeats: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const beatId = await createBeat(input);
        return { id: beatId };
      }),

    list: protectedProcedure.query(async () => {
      return getAllBeats();
    }),
  }),

  // Journalist Tags
  journalistTags: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        color: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const tagId = await createTag(input);
        return { id: tagId };
      }),

    list: protectedProcedure.query(async () => {
      return getAllTags();
    }),
  }),

  // Admin-only endpoints
  admin: router({
    getCreditStats: protectedProcedure
      .input(z.object({
        timeRange: z.enum(["7d", "30d", "90d", "all"]),
      }))
      .query(async ({ ctx, input }) => {
        // Only allow admin users
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        }

        const { timeRange } = input;

        // Calculate date filter
        let dateFilter: Date | null = null;
        if (timeRange !== "all") {
          const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
          dateFilter = new Date();
          dateFilter.setDate(dateFilter.getDate() - days);
        }

        // Get total credits and tokens
        const creditQuery = db
          .select({
            totalCredits: sql<number>`COALESCE(SUM(CAST(${creditUsage.creditsUsed} AS DECIMAL(10,4))), 0)`,
            totalTokens: sql<number>`COALESCE(SUM(${creditUsage.tokensUsed}), 0)`,
          })
          .from(creditUsage);

        if (dateFilter) {
          creditQuery.where(gte(creditUsage.createdAt, dateFilter));
        }

        const [totals] = await creditQuery;

        // Get total users
        const [userCount] = await db
          .select({ count: sql<number>`COUNT(DISTINCT ${creditUsage.userId})` })
          .from(creditUsage);

        const totalUsers = userCount?.count || 0;
        const avgCreditsPerUser = totalUsers > 0 ? Number(totals.totalCredits) / totalUsers : 0;

        // Get daily trend
        const dailyQuery = db
          .select({
            date: sql<string>`DATE(${creditUsage.createdAt})`,
            credits: sql<number>`SUM(CAST(${creditUsage.creditsUsed} AS DECIMAL(10,4)))`,
          })
          .from(creditUsage)
          .groupBy(sql`DATE(${creditUsage.createdAt})`)
          .orderBy(sql`DATE(${creditUsage.createdAt})`);

        if (dateFilter) {
          dailyQuery.where(gte(creditUsage.createdAt, dateFilter));
        }

        const dailyTrend = await dailyQuery;

        // Get breakdown by feature
        const featureQuery = db
          .select({
            name: creditUsage.featureType,
            value: sql<number>`SUM(CAST(${creditUsage.creditsUsed} AS DECIMAL(10,4)))`,
          })
          .from(creditUsage)
          .groupBy(creditUsage.featureType);

        if (dateFilter) {
          featureQuery.where(gte(creditUsage.createdAt, dateFilter));
        }

        const byFeature = await featureQuery;

        // Get top users
        const topUsersQuery = db
          .select({
            name: users.name,
            email: users.email,
            credits: sql<number>`SUM(CAST(${creditUsage.creditsUsed} AS DECIMAL(10,4)))`,
          })
          .from(creditUsage)
          .leftJoin(users, eq(creditUsage.userId, users.id))
          .groupBy(users.id, users.name, users.email)
          .orderBy(sql`SUM(CAST(${creditUsage.creditsUsed} AS DECIMAL(10,4))) DESC`)
          .limit(10);

        if (dateFilter) {
          topUsersQuery.where(gte(creditUsage.createdAt, dateFilter));
        }

        const topUsers = await topUsersQuery;

        return {
          totalCredits: Number(totals.totalCredits),
          totalTokens: Number(totals.totalTokens),
          totalUsers,
          avgCreditsPerUser,
          dailyTrend: dailyTrend.map(d => ({
            date: d.date,
            credits: Number(d.credits),
          })),
          byFeature: byFeature.map(f => ({
            name: f.name,
            value: Number(f.value),
          })),
          topUsers: topUsers.map(u => ({
            name: u.name || u.email || "Unknown",
            credits: Number(u.credits),
          })),
        };
      }),

    // Alert management endpoints
    getAlertThresholds: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        const db = await getDb();
        if (!db) return [];

        return await db.select().from(creditAlertThresholds).orderBy(creditAlertThresholds.createdAt);
      }),

    createAlertThreshold: protectedProcedure
      .input(z.object({
        name: z.string(),
        thresholdType: z.enum(["daily", "weekly", "monthly", "total"]),
        thresholdValue: z.number(),
        notifyEmails: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        }

        const [threshold] = await db.insert(creditAlertThresholds).values({
          name: input.name,
          thresholdType: input.thresholdType,
          thresholdValue: input.thresholdValue.toString(),
          isActive: 1,
          notifyEmails: input.notifyEmails,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return { id: threshold.insertId };
      }),

    updateAlertThreshold: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        thresholdValue: z.number().optional(),
        isActive: z.boolean().optional(),
        notifyEmails: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        }

        const { id, ...updates } = input;
        const updateData: any = { updatedAt: new Date() };

        if (updates.name) updateData.name = updates.name;
        if (updates.thresholdValue) updateData.thresholdValue = updates.thresholdValue.toString();
        if (updates.isActive !== undefined) updateData.isActive = updates.isActive ? 1 : 0;
        if (updates.notifyEmails) updateData.notifyEmails = updates.notifyEmails;

        await db.update(creditAlertThresholds)
          .set(updateData)
          .where(eq(creditAlertThresholds.id, id));

        return { success: true };
      }),

    deleteAlertThreshold: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        }

        await db.delete(creditAlertThresholds).where(eq(creditAlertThresholds.id, input.id));
        return { success: true };
      }),

    getAlertHistory: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        const db = await getDb();
        if (!db) return [];

        const query = db
          .select({
            id: creditAlertHistory.id,
            thresholdId: creditAlertHistory.thresholdId,
            triggeredAt: creditAlertHistory.triggeredAt,
            creditsUsed: creditAlertHistory.creditsUsed,
            thresholdValue: creditAlertHistory.thresholdValue,
            emailSent: creditAlertHistory.emailSent,
            thresholdName: creditAlertThresholds.name,
          })
          .from(creditAlertHistory)
          .leftJoin(creditAlertThresholds, eq(creditAlertHistory.thresholdId, creditAlertThresholds.id))
          .orderBy(sql`${creditAlertHistory.triggeredAt} DESC`);

        if (input.limit) {
          query.limit(input.limit);
        }

        return await query;
      }),

    triggerAlertCheck: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        await checkCreditAlerts();
        return { success: true, message: "Alert check triggered successfully" };
      }),

    // Stripe Product Management
    syncStripeProducts: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        const { fullSync } = await import("./stripeProductSync");
        const result = await fullSync();

        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "sync_stripe_products",
          entityType: "stripe_product",
          entityId: 0,
          description: `Synced Stripe products: ${result.created} created, ${result.updated} updated`,
        });

        return result;
      }),

    listStripeProducts: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        const { listStripeProducts } = await import("./stripeProductSync");
        return await listStripeProducts();
      }),

    getProductDefinitions: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        const { PRODUCT_DEFINITIONS } = await import("./productDefinitions");
        return PRODUCT_DEFINITIONS;
      }),
  }),

  // Purchase flows for add-ons
  purchases: router({
    createWordCountCheckout: protectedProcedure
      .input(z.object({
        wordCountKey: z.enum(["words_300", "words_600", "words_900"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createWordCountCheckoutSession } = await import("./stripeCheckout");
        
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        
        const session = await createWordCountCheckoutSession(input.wordCountKey, {
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          successUrl: `${frontendUrl}/dashboard/purchases/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${frontendUrl}/dashboard/purchases/cancel`,
        });
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "create_word_count_checkout",
          entityType: "purchase",
          entityId: 0,
          description: `Created checkout session for ${input.wordCountKey}`,
        });
        
        return session;
      }),

    createImagePackCheckout: protectedProcedure
      .input(z.object({
        imagePackKey: z.enum(["single", "pack_5", "pack_10"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createImagePackCheckoutSession } = await import("./stripeCheckout");
        
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        
        const session = await createImagePackCheckoutSession(input.imagePackKey, {
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          successUrl: `${frontendUrl}/dashboard/purchases/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${frontendUrl}/dashboard/purchases/cancel`,
        });
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "create_image_pack_checkout",
          entityType: "purchase",
          entityId: 0,
          description: `Created checkout session for ${input.imagePackKey}`,
        });
        
        return session;
      }),

    verifyPurchase: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const { getCheckoutSession } = await import("./stripeCheckout");
        
        const session = await getCheckoutSession(input.sessionId);
        
        // Verify this session belongs to the current user
        if (session.client_reference_id !== ctx.user.id.toString()) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Session does not belong to user" });
        }
        
        return {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          metadata: session.metadata,
        };
      }),

    getWordCountCredits: protectedProcedure
      .query(async ({ ctx }) => {
        const { getAvailableWordCountCredits } = await import("./addOnCredits");
        const availableWords = await getAvailableWordCountCredits(ctx.user.id);
        
        return {
          availableWords,
        };
      }),

    getImageCredits: protectedProcedure
      .query(async ({ ctx }) => {
        const { getAvailableImageCredits } = await import("./addOnCredits");
        const availableImages = await getAvailableImageCredits(ctx.user.id);
        
        return {
          availableImages,
        };
      }),

    getPurchaseHistory: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        }

        // Get word count purchases
        const wordCountPurchases = await db
          .select()
          .from(wordCountCredits)
          .where(eq(wordCountCredits.userId, ctx.user.id))
          .orderBy(sql`${wordCountCredits.purchaseDate} DESC`);

        // Get image pack purchases
        const imagePurchases = await db
          .select()
          .from(imageCredits)
          .where(eq(imageCredits.userId, ctx.user.id))
          .orderBy(sql`${imageCredits.purchaseDate} DESC`);

        return {
          wordCountPurchases,
          imagePurchases,
        };
      }),
  }),

  // Usage warnings
  usage: router({
    getWarnings: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserUsageWarnings } = await import("./usageWarnings");
        return await getUserUsageWarnings(ctx.user.id);
      }),

    getSummary: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUsageSummary } = await import("./usageWarnings");
        return await getUsageSummary(ctx.user.id);
      }),

    checkLimits: protectedProcedure
      .query(async ({ ctx }) => {
        const { hasExceededLimits } = await import("./usageWarnings");
        return await hasExceededLimits(ctx.user.id);
      }),
  }),

  // Sports Teams
  sportsTeams: router({
    create: protectedProcedure
      .input(
        z.object({
          teamName: z.string().min(1),
          sport: z.string().min(1),
          league: z.string().optional(),
          division: z.string().optional(),
          location: z.string().optional(),
          founded: z.number().optional(),
          stadium: z.string().optional(),
          website: z.string().url().optional(),
          logo: z.string().url().optional(),
          primaryColor: z.string().optional(),
          secondaryColor: z.string().optional(),
          description: z.string().optional(),
          achievements: z.array(z.object({ year: z.number(), title: z.string() })).optional(),
          socialMedia: z.object({
            twitter: z.string().optional(),
            instagram: z.string().optional(),
            facebook: z.string().optional(),
          }).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { createSportsTeam } = await import("./sportsTeams");
        const business = await getUserBusiness(ctx.user.id);
        
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile required to create teams",
          });
        }

        return await createSportsTeam(business.id, input);
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        const { getBusinessTeams } = await import("./sportsTeams");
        const business = await getUserBusiness(ctx.user.id);
        
        if (!business) {
          return [];
        }

        return await getBusinessTeams(business.id);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getTeamById } = await import("./sportsTeams");
        const business = await getUserBusiness(ctx.user.id);
        
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile required",
          });
        }

        return await getTeamById(input.id, business.id);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          teamName: z.string().min(1).optional(),
          sport: z.string().min(1).optional(),
          league: z.string().optional(),
          division: z.string().optional(),
          location: z.string().optional(),
          founded: z.number().optional(),
          stadium: z.string().optional(),
          website: z.string().url().optional(),
          logo: z.string().url().optional(),
          primaryColor: z.string().optional(),
          secondaryColor: z.string().optional(),
          description: z.string().optional(),
          achievements: z.array(z.object({ year: z.number(), title: z.string() })).optional(),
          socialMedia: z.object({
            twitter: z.string().optional(),
            instagram: z.string().optional(),
            facebook: z.string().optional(),
          }).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { updateSportsTeam } = await import("./sportsTeams");
        const business = await getUserBusiness(ctx.user.id);
        
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile required",
          });
        }

        const { id, ...updates } = input;
        return await updateSportsTeam(id, business.id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteSportsTeam } = await import("./sportsTeams");
        const business = await getUserBusiness(ctx.user.id);
        
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile required",
          });
        }

        return await deleteSportsTeam(input.id, business.id);
      }),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ ctx, input }) => {
        const { searchTeams } = await import("./sportsTeams");
        const business = await getUserBusiness(ctx.user.id);
        
        if (!business) {
          return [];
        }

        return await searchTeams(business.id, input.query);
      }),

    getBySport: protectedProcedure
      .input(z.object({ sport: z.string() }))
      .query(async ({ ctx, input }) => {
        const { getTeamsBySport } = await import("./sportsTeams");
        const business = await getUserBusiness(ctx.user.id);
        
        if (!business) {
          return [];
        }

        return await getTeamsBySport(business.id, input.sport);
      }),

    getPressReleaseAngles: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { generateTeamPressReleaseAngles } = await import("./sportsTeams");
        const business = await getUserBusiness(ctx.user.id);
        
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile required",
          });
        }

        return await generateTeamPressReleaseAngles(input.teamId, business.id);
      }),
  }),

  imagePacks: router({
    createCheckout: protectedProcedure
      .input(
        z.object({
          packId: z.enum(["single", "pack_5", "pack_10"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: "2025-12-15.clover",
        });

        const { IMAGE_PACK_PRODUCTS } = await import("./products");
        const product = IMAGE_PACK_PRODUCTS[input.packId];

        if (!product || !product.stripePriceId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found or not configured",
          });
        }

        const session = await stripe.checkout.sessions.create({
          customer_email: ctx.user.email || undefined,
          line_items: [
            {
              price: product.stripePriceId!,
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${process.env.FRONTEND_URL}/dashboard/image-packs?success=true`,
          cancel_url: `${process.env.FRONTEND_URL}/dashboard/image-packs?canceled=true`,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            productType: "image_pack",
            productKey: input.packId,
            images: product.images.toString(),
            userId: ctx.user.id.toString(),
          },
        });

        return { url: session.url };
      }),
  }),

  // Social Media Connections
  socialConnections: router({
    // Get all connections for current user
    getConnections: protectedProcedure.query(async ({ ctx }) => {
      const { socialConnections } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const connections = await db
        .select()
        .from(socialConnections)
        .where(eq(socialConnections.userId, ctx.user.id));

      // Don't expose access tokens to frontend
      return connections.map((conn) => ({
        id: conn.id,
        platform: conn.platform,
        platformUserId: conn.platformUserId,
        platformUsername: conn.platformUsername,
        profilePictureUrl: conn.profilePictureUrl,
        isActive: conn.isActive,
        createdAt: conn.createdAt,
      }));
    }),

    // Disconnect a social account
    disconnect: protectedProcedure
      .input(z.object({ connectionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { socialConnections } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Verify ownership before deleting
        const connection = await db
          .select()
          .from(socialConnections)
          .where(
            and(
              eq(socialConnections.id, input.connectionId),
              eq(socialConnections.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (connection.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Connection not found",
          });
        }

        await db
          .delete(socialConnections)
          .where(eq(socialConnections.id, input.connectionId));

        return { success: true };
      }),
  }),

  // Business Dossier & AI Memory
  businessDossier: router({
    // Get user's business dossier
    get: protectedProcedure.query(async ({ ctx }) => {
      const dossier = await getBusinessDossier(ctx.user.id);
      return dossier;
    }),

    // Analyze website and create/update dossier
    analyzeWebsite: protectedProcedure
      .input(z.object({ websiteUrl: z.string().url() }))
      .mutation(async ({ ctx, input }) => {
        const { analyzeWebsite } = await import("./websiteAnalysis");
        
        // Run website analysis
        const analysis = await analyzeWebsite(input.websiteUrl);
        
        // Check if dossier exists
        const existingDossier = await getBusinessDossier(ctx.user.id);
        
        if (existingDossier) {
          // Update existing dossier
          await updateBusinessDossier(ctx.user.id, {
            website: input.websiteUrl,
            companyName: analysis.companyName,
            industry: analysis.industry,
            businessDescription: analysis.businessDescription,
            services: analysis.services,
            targetAudience: analysis.targetAudience,
            uniqueSellingPoints: analysis.uniqueSellingPoints,
            competitors: analysis.competitors,
            brandVoice: analysis.brandVoice,
            brandTone: analysis.brandTone,
            keyMessages: analysis.keyMessages,
            employees: analysis.employees,
            contactEmail: analysis.contactEmail,
            contactPhone: analysis.contactPhone,
            websiteAnalyzedAt: new Date(),
            websiteAnalysisData: analysis,
          });
        } else {
          // Create new dossier
          await createBusinessDossier({
            userId: ctx.user.id,
            website: input.websiteUrl,
            companyName: analysis.companyName,
            industry: analysis.industry,
            businessDescription: analysis.businessDescription,
            services: analysis.services,
            targetAudience: analysis.targetAudience,
            uniqueSellingPoints: analysis.uniqueSellingPoints,
            competitors: analysis.competitors,
            brandVoice: analysis.brandVoice,
            brandTone: analysis.brandTone,
            keyMessages: analysis.keyMessages,
            employees: analysis.employees,
            contactEmail: analysis.contactEmail,
            contactPhone: analysis.contactPhone,
            websiteAnalyzedAt: new Date(),
            websiteAnalysisData: analysis,
          });
        }
        
        return { success: true, analysis };
      }),

    // Update dossier manually
    update: protectedProcedure
      .input(
        z.object({
          companyName: z.string().optional(),
          website: z.string().url().optional(),
          industry: z.string().optional(),
          sicCode: z.string().optional(),
          businessDescription: z.string().optional(),
          services: z.array(z.string()).optional(),
          targetAudience: z.string().optional(),
          uniqueSellingPoints: z.array(z.string()).optional(),
          competitors: z.array(z.string()).optional(),
          brandVoice: z.string().optional(),
          brandTone: z.string().optional(),
          keyMessages: z.array(z.string()).optional(),
          employees: z.array(
            z.object({
              name: z.string(),
              role: z.string(),
              bio: z.string().optional(),
            })
          ).optional(),
          primaryContact: z.string().optional(),
          contactEmail: z.string().email().optional(),
          contactPhone: z.string().optional(),
          sportsTeamAffiliation: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateBusinessDossier(ctx.user.id, input);
        return { success: true };
      }),

    // Save AI conversation
    saveConversation: protectedProcedure
      .input(
        z.object({
          conversationType: z.enum(["chat", "phone_call", "email"]),
          role: z.enum(["user", "assistant", "system"]),
          content: z.string(),
          callDuration: z.number().optional(),
          transcriptUrl: z.string().optional(),
          metadata: z.any().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get dossier ID if exists
        const dossier = await getBusinessDossier(ctx.user.id);
        
        await saveAIConversation({
          userId: ctx.user.id,
          dossierId: dossier?.id,
          conversationType: input.conversationType,
          role: input.role,
          content: input.content,
          callDuration: input.callDuration,
          transcriptUrl: input.transcriptUrl,
          metadata: input.metadata,
        });
        
        return { success: true };
      }),

    // Get AI conversation history
    getConversations: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        const conversations = await getAIConversations(ctx.user.id, input.limit);
        return conversations;
      }),

    // Admin Credit Management procedures
    getAllUsersCredits: protectedProcedure.query(async ({ ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const { getAllUsersCreditsUsage } = await import("./adminCreditManagement");
      return await getAllUsersCreditsUsage();
    }),

    adjustCredits: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          addonType: z.enum(["aiChat", "aiCallIn"]),
          amount: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { adjustUserCredits } = await import("./adminCreditManagement");
        return await adjustUserCredits({
          userId: input.userId,
          addonType: input.addonType,
          amount: input.amount,
          adminNote: `Adjusted by admin ${ctx.user.name}`,
        });
      }),

    exportCreditUsage: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const { exportCreditUsageToCSV } = await import("./adminCreditManagement");
      const csv = await exportCreditUsageToCSV();
      return { csv };
    }),
  }),

  // Billing router
  billing: router({
    getInvoices: protectedProcedure.query(async ({ ctx }) => {
      const subscription = await getUserSubscription(ctx.user.id);
      if (!subscription?.stripeCustomerId) {
        return [];
      }
      const { getCustomerInvoices } = await import("./billing");
      return await getCustomerInvoices(subscription.stripeCustomerId);
    }),

    getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
      const subscription = await getUserSubscription(ctx.user.id);
      if (!subscription?.stripeCustomerId) {
        return [];
      }
      const { getCustomerPaymentMethods, getCustomerDefaultPaymentMethod } = await import("./billing");
      const paymentMethods = await getCustomerPaymentMethods(subscription.stripeCustomerId);
      const defaultPmId = await getCustomerDefaultPaymentMethod(subscription.stripeCustomerId);
      
      return paymentMethods.map((pm) => ({
        ...pm,
        isDefault: pm.id === defaultPmId,
      }));
    }),

    createBillingPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
      const subscription = await getUserSubscription(ctx.user.id);
      if (!subscription?.stripeCustomerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No Stripe customer found" });
      }
      const { createBillingPortalSession } = await import("./billing");
      const origin = ctx.req.headers.origin || "http://localhost:3000";
      return await createBillingPortalSession(subscription.stripeCustomerId, `${origin}/dashboard/billing`);
    }),

    getUpcomingInvoice: protectedProcedure.query(async ({ ctx }) => {
      const subscription = await getUserSubscription(ctx.user.id);
      if (!subscription?.stripeCustomerId) {
        return null;
      }
      const { getUpcomingInvoice } = await import("./billing");
      return await getUpcomingInvoice(subscription.stripeCustomerId);
    }),
  }),

  // CSV Export router
  csvExport: router({
    exportPressReleaseAnalytics: protectedProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { exportPressReleaseAnalytics } = await import("./csvExport");
        const startDate = input.startDate ? new Date(input.startDate) : undefined;
        const endDate = input.endDate ? new Date(input.endDate) : undefined;
        const csv = await exportPressReleaseAnalytics(ctx.user.id, startDate, endDate);
        return { csv };
      }),

    exportCampaignAnalytics: protectedProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { exportCampaignAnalytics } = await import("./csvExport");
        const startDate = input.startDate ? new Date(input.startDate) : undefined;
        const endDate = input.endDate ? new Date(input.endDate) : undefined;
        const csv = await exportCampaignAnalytics(ctx.user.id, startDate, endDate);
        return { csv };
      }),

    exportSocialMediaAnalytics: protectedProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { exportSocialMediaAnalytics } = await import("./csvExport");
        const startDate = input.startDate ? new Date(input.startDate) : undefined;
        const endDate = input.endDate ? new Date(input.endDate) : undefined;
        const csv = await exportSocialMediaAnalytics(ctx.user.id, startDate, endDate);
        return { csv };
      }),

    exportAnalyticsSummary: protectedProcedure
      .input(
        z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { exportAnalyticsSummary } = await import("./csvExport");
        const startDate = input.startDate ? new Date(input.startDate) : undefined;
        const endDate = input.endDate ? new Date(input.endDate) : undefined;
        const csv = await exportAnalyticsSummary(ctx.user.id, startDate, endDate);
        return { csv };
      }),
  }),

  feedback: router({
    submit: protectedProcedure
      .input(
        z.object({
          feedbackType: z.enum(["rating", "voice", "text", "suggestion"]),
          rating: z.number().min(1).max(5).optional(),
          feedbackText: z.string().optional(),
          voiceRecordingUrl: z.string().optional(),
          voiceRecordingDuration: z.number().optional(),
          context: z.string().optional(),
          pageUrl: z.string().optional(),
          userAgent: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { notifyOwner } = await import("./_core/notification");
        try {
          // TODO: Implement database insert once schema is migrated
          // For now, just log and notify owner
          await notifyOwner({
            title: `New ${input.feedbackType} feedback from ${ctx.user.name}`,
            content: `Rating: ${input.rating || "N/A"}\nFeedback: ${input.feedbackText || "Voice recording"}\nContext: ${input.context || "N/A"}\nPage: ${input.pageUrl || "N/A"}`,
          });

          return { success: true };
        } catch (error) {
          console.error("Error submitting feedback:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit feedback",
          });
        }
      }),
  }),

  issues: router({
    submit: protectedProcedure
      .input(
        z.object({
          issueType: z.enum(["bug", "feature_request", "improvement", "question"]),
          title: z.string().min(1),
          description: z.string().min(1),
          stepsToReproduce: z.string().optional(),
          expectedBehavior: z.string().optional(),
          actualBehavior: z.string().optional(),
          browserInfo: z.string().optional(),
          deviceInfo: z.string().optional(),
          pageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { notifyOwner } = await import("./_core/notification");
        try {
          // TODO: Implement database insert once schema is migrated
          // For now, just log and notify owner
          await notifyOwner({
            title: `New ${input.issueType} from ${ctx.user.name}: ${input.title}`,
            content: `Description: ${input.description}\n\nSteps: ${input.stepsToReproduce || "N/A"}\n\nExpected: ${input.expectedBehavior || "N/A"}\n\nActual: ${input.actualBehavior || "N/A"}\n\nBrowser: ${input.browserInfo || "N/A"}\nDevice: ${input.deviceInfo || "N/A"}\nPage: ${input.pageUrl || "N/A"}`,
          });

          return { success: true };
        } catch (error) {
          console.error("Error submitting issue:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit issue",
          });
        }
      }),
  }),

  marketing: router({
    captureEmail: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          source: z.string(),
          leadMagnet: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const { emailCaptures } = await import("../drizzle/schema");
        const { sendEmail } = await import("./_core/email");
        const { notifyOwner } = await import("./_core/notification");

        try {
          // Save email capture to database
          await db.insert(emailCaptures).values({
            email: input.email,
            source: input.source,
            leadMagnet: input.leadMagnet || null,
          });

          // Notify owner of new lead
          await notifyOwner({
            title: `New Email Capture from ${input.source}`,
            content: `Email: ${input.email}\nSource: ${input.source}\nLead Magnet: ${input.leadMagnet || "None"}`,
          });

          // Send welcome email with resources
          await sendEmail({
            to: input.email,
            subject: "Your Free PR Resources - UpsurgeIQ",
            html: `
              <h2>Welcome to UpsurgeIQ!</h2>
              <p>Thank you for subscribing. Here are your free PR resources:</p>
              <ul>
                <li><strong>Press Release Template:</strong> A professional template to get you started</li>
                <li><strong>Media List Building Guide:</strong> How to find and connect with journalists</li>
                <li><strong>PR Best Practices:</strong> Industry insights from our blog</li>
              </ul>
              <p>Ready to take your PR to the next level? <a href="https://upsurgeiq.com/subscribe">Start your free trial</a> today.</p>
              <br>
              <p>Best regards,<br>The UpsurgeIQ Team</p>
              <p style="font-size: 12px; color: #666;">You can <a href="#">unsubscribe</a> at any time.</p>
            `,
          });

          return { success: true };
        } catch (error) {
          console.error("Error capturing email:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to subscribe. Please try again.",
          });
        }
      }),
  }),

  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          subject: z.string(),
          message: z.string().min(10),
        })
      )
      .mutation(async ({ input }) => {
        const { sendEmail } = await import("./_core/email");
        const { notifyOwner } = await import("./_core/notification");

        // Send notification to owner
        await notifyOwner({
          title: `New Contact Form Submission: ${input.subject}`,
          content: `From: ${input.name} (${input.email})\n\nSubject: ${input.subject}\n\nMessage:\n${input.message}`,
        });

        // Send confirmation email to user
        try {
          await sendEmail({
            to: input.email,
            subject: "We received your message - UpsurgeIQ",
            html: `
              <h2>Thank you for contacting UpsurgeIQ!</h2>
              <p>Hi ${input.name},</p>
              <p>We've received your message and will get back to you within 24 hours.</p>
              <p><strong>Your message:</strong></p>
              <p>${input.message.replace(/\n/g, '<br>')}</p>
              <br>
              <p>Best regards,<br>The UpsurgeIQ Team</p>
            `,
          });
        } catch (error) {
          console.error("Failed to send confirmation email:", error);
          // Don't fail the mutation if email fails
        }

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
