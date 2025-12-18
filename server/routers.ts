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
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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
    list: protectedProcedure.query(async ({ ctx }) => {
      const business = await getUserBusiness(ctx.user.id);
      if (!business) {
        return [];
      }
      return await getPressReleasesByBusiness(business.id);
    }),

    get: protectedProcedure
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
        const business = await getUserBusiness(ctx.user.id);
        if (!business) {
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

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const content = response.choices[0]?.message?.content || "";

        return { content };
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
          businessId: business.id,
          userId: ctx.user.id,
          title: input.title,
          body: input.content,
          status: input.status,
        });

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
});

export type AppRouter = typeof appRouter;
