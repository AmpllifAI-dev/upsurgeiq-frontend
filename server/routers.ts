import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { eq, and, inArray } from "drizzle-orm";
import {
  mediaListCategories,
  mediaListGenerationRequests,
  journalistContacts,
  mediaListCredits,
  mediaListCreditTransactions,
  distributionSaves,
} from "../drizzle/schema";
import { checkAndQueueGeneration } from "./mediaListAI";
import { getCreditBalance, hasEnoughCredits, deductCredits } from "./mediaListCredits";
import {
  saveDistributionForLater,
  getSavedDistributions,
  markSaveCompleted,
} from "./distributionSaveForLater";
import { uploadPressReleaseImageFromBase64 } from "./pressReleaseImageHosting";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  // Media List Management
  mediaList: router({
    // Get all categories by type
    getCategories: publicProcedure
      .input(z.object({ type: z.enum(["genre", "geography", "industry"]).optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        if (input.type) {
          return await db
            .select()
            .from(mediaListCategories)
            .where(eq(mediaListCategories.type, input.type));
        }
        return await db.select().from(mediaListCategories);
      }),

    // Check category status and queue generation if needed
    checkCategoryStatus: protectedProcedure
      .input(z.object({ categoryId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await checkAndQueueGeneration(input.categoryId, ctx.user.id);
      }),

    // Get generation requests for user
    getGenerationRequests: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select()
        .from(mediaListGenerationRequests)
        .where(eq(mediaListGenerationRequests.userId, ctx.user.id));
    }),

    // Get contacts for a category
    getCategoryContacts: protectedProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        return await db
          .select()
          .from(journalistContacts)
          .where(eq(journalistContacts.mediaListId, input.categoryId));
      }),

    // Get user's credit balance
    getCredits: protectedProcedure.query(async ({ ctx }) => {
      return await getCreditBalance(ctx.user.id);
    }),

    // Get credit transaction history
    getCreditTransactions: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select()
        .from(mediaListCreditTransactions)
        .where(eq(mediaListCreditTransactions.userId, ctx.user.id));
    }),
  }),

  // Press Release Distribution
  distribution: router({
    // Save distribution for later
    saveForLater: protectedProcedure
      .input(
        z.object({
          pressReleaseId: z.number(),
          mediaListIds: z.array(z.number()),
          scheduledFor: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const saveId = await saveDistributionForLater(
          ctx.user.id,
          input.pressReleaseId,
          input.mediaListIds,
          input.scheduledFor
        );
        return { saveId };
      }),

    // Get saved distributions
    getSaved: protectedProcedure.query(async ({ ctx }) => {
      return await getSavedDistributions(ctx.user.id);
    }),

    // Complete a saved distribution
    completeSave: protectedProcedure
      .input(z.object({ saveId: z.number() }))
      .mutation(async ({ input }) => {
        await markSaveCompleted(input.saveId);
        return { success: true };
      }),
  }),

  // Press Release Image Upload
  pressRelease: router({
    uploadImage: protectedProcedure
      .input(
        z.object({
          pressReleaseId: z.number(),
          base64Data: z.string(),
          contentType: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await uploadPressReleaseImageFromBase64(
          input.pressReleaseId,
          input.base64Data,
          input.contentType
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;
