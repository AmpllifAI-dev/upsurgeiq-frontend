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
});

export type AppRouter = typeof appRouter;
