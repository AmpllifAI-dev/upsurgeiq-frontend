import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { 
  getUserSubscription, 
  getUserBusiness, 
  createBusiness, 
  updateBusiness 
} from "./db";
import {
  createPressRelease,
  getPressReleasesByBusiness,
  getPressReleaseById,
  updatePressRelease,
  deletePressRelease,
  createSocialMediaPost,
  getSocialMediaPostsByBusiness,
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

        const pressRelease = await createPressRelease({
          userId: ctx.user.id,
          businessId: business.id,
          title: input.title,
          body: input.content,
          status: input.status,
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
      .mutation(async ({ input }) => {
        return await generateImage({ prompt: input.prompt });
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

        const campaign = await createCampaign({
          businessId: business.id,
          userId: ctx.user.id,
          name: input.name,
          goal: input.goal,
          budget: input.budget,
          status: input.status || "draft",
          platforms: input.platforms,
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
      .mutation(async ({ input }) => {
        return await createDistribution({
          pressReleaseId: input.pressReleaseId,
          mediaListId: input.mediaListId,
          status: "pending",
          recipientCount: input.recipientCount || 0,
        });
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
});

export type AppRouter = typeof appRouter;
