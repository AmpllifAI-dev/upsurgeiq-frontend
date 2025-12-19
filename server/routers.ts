import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
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
  getUserSubscription
} from "./db";
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
import { TRPCError } from "@trpc/server";

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
  }),

  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      // TODO: Implement actual stats queries
      // For now, return mock data
      return {
        pressReleases: 0,
        posts: 0,
        campaigns: 0,
        distributions: 0,
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

        const systemPrompt = `You are a professional press release writer. Generate a compelling, newsworthy press release based on the following information:

Company: ${business.name}
Brand Voice Tone: ${input.tone || business.brandVoiceTone || "formal"}
Brand Voice Style: ${business.brandVoiceStyle || "detailed"}
Target Audience: ${input.targetAudience || business.targetAudience || "general public"}

Company Dossier:
${business.dossier || "No additional context provided"}

Write a professional press release that follows standard PR format with:
- Compelling headline
- Dateline
- Strong opening paragraph
- Supporting details
- Quote from company spokesperson
- Boilerplate about the company
- Contact information placeholder

Use markdown formatting for structure.`;

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

          prLogger.info("Press release generated successfully", {
            userId: ctx.user.id,
            action: "generate",
            metadata: { 
              topic: input.topic,
              wordCount: content.length 
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
          content: z.string(),
          status: z.enum(["draft", "scheduled", "published"]),
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
        const { allowed } = await checkLimit(ctx.user.id, "pressReleases");
        if (!allowed) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Press release limit reached for your subscription tier. Please upgrade to create more.",
          });
        }

        const pressRelease = await createPressRelease({
          userId: ctx.user.id,
          businessId: business.id,
          title: input.title,
          body: input.content,
          status: input.status,
        });

        // Increment usage counter
        await incrementUsage(ctx.user.id, "pressReleases");

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
  }),

  socialMedia: router({
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

        // Check usage limits
        const { allowed } = await checkLimit(ctx.user.id, "socialPosts");
        if (!allowed) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Social media post limit reached for your subscription tier. Please upgrade to create more.",
          });
        }

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

        // Increment usage counter
        await incrementUsage(ctx.user.id, "socialPosts");

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

        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
          aiLogger.error("Business profile not found", undefined, {
            userId: ctx.user.id,
            action: "chat",
          });
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business profile not found",
          });
        }

        const systemPrompt = `You are an expert PR and marketing consultant for ${input.context?.businessName || "a business"}. 

Business Context:
- Name: ${input.context?.businessName || "Unknown"}
- Industry: ${input.context?.industry || "General"}
- Brand Voice: ${input.context?.brandVoice || "Professional"}

Your role is to:
- Provide strategic PR and marketing advice
- Help with content creation and messaging
- Offer insights on media outreach and journalist relations
- Suggest campaign ideas and tactics
- Answer questions about best practices

Be concise, actionable, and professional. Use markdown formatting for clarity.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input.message },
            ],
          });

          const message = response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

          aiLogger.info("AI assistant response generated", {
            userId: ctx.user.id,
            action: "chat",
            metadata: { 
              responseLength: typeof message === 'string' ? message.length : 0 
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
          budget: z.number().optional(),
          status: z.enum(["draft", "active", "paused", "completed"]).optional(),
          platforms: z.string().optional(),
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
          status: z.enum(["draft", "active", "paused", "completed"]).optional(),

        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateCampaign(id, updates);
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
          status: z.enum(["draft", "active", "paused", "completed"]),
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
        // Check usage limits
        const { allowed } = await checkLimit(ctx.user.id, "distributions");
        if (!allowed) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Distribution limit reached for your subscription tier. Please upgrade to send more distributions.",
          });
        }

        const distribution = await createDistribution({
          pressReleaseId: input.pressReleaseId,
          mediaListId: input.mediaListId,
          status: "pending",
          recipientCount: input.recipientCount || 0,
        });

        // Increment usage counter
        await incrementUsage(ctx.user.id, "distributions");

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
      
      // Return with boolean values
      if (!preferences) {
        return {
          emailNotifications: true,
          pressReleaseNotifications: true,
          campaignNotifications: true,
          socialMediaNotifications: true,
          weeklyDigest: true,
          marketingEmails: false,
        };
      }

      return {
        emailNotifications: !!preferences.emailNotifications,
        pressReleaseNotifications: !!preferences.pressReleaseNotifications,
        campaignNotifications: !!preferences.campaignNotifications,
        socialMediaNotifications: !!preferences.socialMediaNotifications,
        weeklyDigest: !!preferences.weeklyDigest,
        marketingEmails: !!preferences.marketingEmails,
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
          socialMediaPosts: tierLimits.socialPosts,
          campaigns: tierLimits.campaigns,
          distributions: tierLimits.distributions,
          aiImages: tierLimits.aiImages,
          aiChatMessages: tierLimits.aiChatMessages,
        },
        period: usage.period,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
