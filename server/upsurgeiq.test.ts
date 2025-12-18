import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(user?: AuthenticatedUser): TrpcContext {
  const defaultUser: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user: user || defaultUser,
    req: {
      protocol: "https",
      headers: { origin: "https://test.example.com" },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("upsurgeIQ Platform Tests", () => {
  describe("Authentication", () => {
    it("should return current user with auth.me", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.email).toBe("test@example.com");
      expect(result?.name).toBe("Test User");
    });

    it("should return null for unauthenticated user", async () => {
      const ctx = createTestContext(undefined);
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeNull();
    });
  });

  describe("Subscription Management", () => {
    it("should require authentication for subscription queries", async () => {
      const ctx = createTestContext(undefined);
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      await expect(caller.subscription.get()).rejects.toThrow();
    });
  });

  describe("Business Dossier", () => {
    it("should require authentication for business queries", async () => {
      const ctx = createTestContext(undefined);
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      await expect(caller.business.get()).rejects.toThrow();
    });
  });

  describe("Press Releases", () => {
    it("should require authentication for press release creation", async () => {
      const ctx = createTestContext(undefined);
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.pressRelease.create({
          title: "Test Release",
          body: "Test content",
          status: "draft",
        })
      ).rejects.toThrow();
    });
  });

  describe("Social Media", () => {
    it("should require authentication for social media posts", async () => {
      const ctx = createTestContext(undefined);
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.socialMedia.create({
          platforms: ["facebook"],
          content: { facebook: "Test post" },
          scheduledFor: new Date(),
        })
      ).rejects.toThrow();
    });
  });

  describe("Media Lists", () => {
    it("should require authentication for media list access", async () => {
      const ctx = createTestContext(undefined);
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      await expect(caller.mediaList.list()).rejects.toThrow();
    });
  });

  describe("AI Chat", () => {
    it("should require authentication for AI chat", async () => {
      const ctx = createTestContext(undefined);
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.aiChat.send({
          message: "Hello",
        })
      ).rejects.toThrow();
    });
  });

  describe("Campaign Lab", () => {
    it("should require authentication for campaign creation", async () => {
      const ctx = createTestContext(undefined);
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.campaign.create({
          name: "Test Campaign",
          objective: "awareness",
          platforms: ["facebook"],
          budget: 1000,
          startDate: new Date(),
          endDate: new Date(),
        })
      ).rejects.toThrow();
    });
  });

  describe("Partner Management", () => {
    it("should require admin role for partner access", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.partner.list()).rejects.toThrow("Admin access required");
    });

    it("should allow admin to list partners", async () => {
      const adminUser: AuthenticatedUser = {
        id: 2,
        openId: "admin-user",
        email: "admin@example.com",
        name: "Admin User",
        loginMethod: "manus",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx = createTestContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.partner.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Stripe Integration", () => {
    it("should require authentication for checkout creation", async () => {
      const ctx = createTestContext(undefined);
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.stripe.createCheckout({
          tier: "starter",
        })
      ).rejects.toThrow();
    });
  });

  describe("Dashboard Stats", () => {
    it("should require authentication for dashboard stats", async () => {
      const ctx = createTestContext(undefined);
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      await expect(caller.dashboard.stats()).rejects.toThrow();
    });
  });
});
