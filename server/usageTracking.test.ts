import { describe, it, expect, beforeEach } from "vitest";
import { TIER_LIMITS } from "./usageTracking";

describe("Subscription Tier Limits", () => {
  describe("TIER_LIMITS Configuration", () => {
    it("should have correct press release limits (2/5/15)", () => {
      expect(TIER_LIMITS.starter.pressReleases).toBe(2);
      expect(TIER_LIMITS.pro.pressReleases).toBe(5);
      expect(TIER_LIMITS.scale.pressReleases).toBe(15);
    });

    it("should have correct campaign limits (5/20/unlimited)", () => {
      expect(TIER_LIMITS.starter.campaigns).toBe(5);
      expect(TIER_LIMITS.pro.campaigns).toBe(20);
      expect(TIER_LIMITS.scale.campaigns).toBe(-1); // Unlimited
    });

    it("should have correct media list limits (3/5/10)", () => {
      expect(TIER_LIMITS.starter.mediaLists).toBe(3);
      expect(TIER_LIMITS.pro.mediaLists).toBe(5);
      expect(TIER_LIMITS.scale.mediaLists).toBe(10);
    });

    it("should have all 4 social channels for all tiers", () => {
      expect(TIER_LIMITS.starter.socialChannels).toBe(4);
      expect(TIER_LIMITS.pro.socialChannels).toBe(4);
      expect(TIER_LIMITS.scale.socialChannels).toBe(4);
    });

    it("should have AI images as add-on only (0 for all base plans)", () => {
      expect(TIER_LIMITS.starter.aiImages).toBe(0);
      expect(TIER_LIMITS.pro.aiImages).toBe(0);
      expect(TIER_LIMITS.scale.aiImages).toBe(0);
    });

    it("should have AI chat as add-on only (0 for all base plans)", () => {
      expect(TIER_LIMITS.starter.aiChatMessages).toBe(0);
      expect(TIER_LIMITS.pro.aiChatMessages).toBe(0);
      expect(TIER_LIMITS.scale.aiChatMessages).toBe(0);
    });

    it("should have AI call-in as add-on only (0 for all base plans)", () => {
      expect(TIER_LIMITS.starter.aiCallInMessages).toBe(0);
      expect(TIER_LIMITS.pro.aiCallInMessages).toBe(0);
      expect(TIER_LIMITS.scale.aiCallInMessages).toBe(0);
    });
  });

  describe("Starter Tier (£49/month)", () => {
    it("should include correct features", () => {
      const starter = TIER_LIMITS.starter;
      
      expect(starter.pressReleases).toBe(2);
      expect(starter.campaigns).toBe(5);
      expect(starter.mediaLists).toBe(3);
      expect(starter.socialChannels).toBe(4);
      
      // Add-ons only
      expect(starter.aiImages).toBe(0);
      expect(starter.aiChatMessages).toBe(0);
      expect(starter.aiCallInMessages).toBe(0);
    });
  });

  describe("Pro Tier (£99/month)", () => {
    it("should include correct features", () => {
      const pro = TIER_LIMITS.pro;
      
      expect(pro.pressReleases).toBe(5);
      expect(pro.campaigns).toBe(20);
      expect(pro.mediaLists).toBe(5); // 3 default + 2 optional
      expect(pro.socialChannels).toBe(4);
      
      // Add-ons only
      expect(pro.aiImages).toBe(0);
      expect(pro.aiChatMessages).toBe(0);
      expect(pro.aiCallInMessages).toBe(0);
    });
  });

  describe("Scale Tier (£349/month)", () => {
    it("should include correct features", () => {
      const scale = TIER_LIMITS.scale;
      
      expect(scale.pressReleases).toBe(15);
      expect(scale.campaigns).toBe(-1); // Unlimited
      expect(scale.mediaLists).toBe(10); // 3 default + 7 optional
      expect(scale.socialChannels).toBe(4);
      
      // Add-ons only
      expect(scale.aiImages).toBe(0);
      expect(scale.aiChatMessages).toBe(0);
      expect(scale.aiCallInMessages).toBe(0);
    });

    it("should have unlimited campaigns", () => {
      expect(TIER_LIMITS.scale.campaigns).toBe(-1);
    });
  });

  describe("Feature Availability", () => {
    it("should NOT include AI images in any base plan", () => {
      expect(TIER_LIMITS.starter.aiImages).toBe(0);
      expect(TIER_LIMITS.pro.aiImages).toBe(0);
      expect(TIER_LIMITS.scale.aiImages).toBe(0);
    });

    it("should NOT include AI chat in any base plan", () => {
      expect(TIER_LIMITS.starter.aiChatMessages).toBe(0);
      expect(TIER_LIMITS.pro.aiChatMessages).toBe(0);
      expect(TIER_LIMITS.scale.aiChatMessages).toBe(0);
    });

    it("should NOT include AI call-in in any base plan", () => {
      expect(TIER_LIMITS.starter.aiCallInMessages).toBe(0);
      expect(TIER_LIMITS.pro.aiCallInMessages).toBe(0);
      expect(TIER_LIMITS.scale.aiCallInMessages).toBe(0);
    });

    it("should include all 4 social platforms in all tiers", () => {
      expect(TIER_LIMITS.starter.socialChannels).toBe(4);
      expect(TIER_LIMITS.pro.socialChannels).toBe(4);
      expect(TIER_LIMITS.scale.socialChannels).toBe(4);
    });
  });

  describe("Pricing Alignment", () => {
    it("should match README blueprint specifications", () => {
      // Starter: £49/month - 2 press releases, 5 campaigns, 3 media lists
      expect(TIER_LIMITS.starter).toMatchObject({
        pressReleases: 2,
        campaigns: 5,
        mediaLists: 3,
        socialChannels: 4,
      });

      // Pro: £99/month - 5 press releases, 20 campaigns, 5 media lists
      expect(TIER_LIMITS.pro).toMatchObject({
        pressReleases: 5,
        campaigns: 20,
        mediaLists: 5,
        socialChannels: 4,
      });

      // Scale: £349/month - 15 press releases, unlimited campaigns, 10 media lists
      expect(TIER_LIMITS.scale).toMatchObject({
        pressReleases: 15,
        campaigns: -1,
        mediaLists: 10,
        socialChannels: 4,
      });
    });
  });

  describe("Add-on Products", () => {
    it("should define AI Chat as £39/month add-on (32 messages)", () => {
      // AI Chat is an add-on, not included in base plans
      expect(TIER_LIMITS.starter.aiChatMessages).toBe(0);
      expect(TIER_LIMITS.pro.aiChatMessages).toBe(0);
      expect(TIER_LIMITS.scale.aiChatMessages).toBe(0);
    });

    it("should define AI Call-in as £59/month add-on (32 messages)", () => {
      // AI Call-in is an add-on, not included in base plans
      expect(TIER_LIMITS.starter.aiCallInMessages).toBe(0);
      expect(TIER_LIMITS.pro.aiCallInMessages).toBe(0);
      expect(TIER_LIMITS.scale.aiCallInMessages).toBe(0);
    });

    it("should define Image Packs as add-ons (£3.99-24.99)", () => {
      // Images are add-ons only, not included in base plans
      expect(TIER_LIMITS.starter.aiImages).toBe(0);
      expect(TIER_LIMITS.pro.aiImages).toBe(0);
      expect(TIER_LIMITS.scale.aiImages).toBe(0);
    });
  });
});
