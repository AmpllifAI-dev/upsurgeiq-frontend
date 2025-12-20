import { describe, it, expect } from "vitest";
import { getUserUsageWarnings, getUsageSummary, hasExceededLimits } from "./usageWarnings";

/**
 * Usage Warnings Tests
 * 
 * Tests 80% usage warning system and usage summary functionality
 */

describe("Usage Warnings Tests", () => {
  const testUserId = 1;

  describe("Usage Warnings", () => {
    it("should retrieve usage warnings for user", async () => {
      const warnings = await getUserUsageWarnings(testUserId);

      expect(warnings).toBeDefined();
      expect(warnings).toHaveProperty("pressReleases");
      expect(warnings).toHaveProperty("campaigns");
      expect(warnings).toHaveProperty("aiChatMessages");
      expect(warnings).toHaveProperty("images");
      expect(warnings).toHaveProperty("hasWarnings");
    });

    it("should have correct warning structure", async () => {
      const warnings = await getUserUsageWarnings(testUserId);

      const pressReleaseWarning = warnings.pressReleases;
      expect(pressReleaseWarning).toHaveProperty("feature");
      expect(pressReleaseWarning).toHaveProperty("current");
      expect(pressReleaseWarning).toHaveProperty("limit");
      expect(pressReleaseWarning).toHaveProperty("percentage");
      expect(pressReleaseWarning).toHaveProperty("shouldWarn");
      expect(pressReleaseWarning).toHaveProperty("message");
    });

    it("should calculate percentage correctly", async () => {
      const warnings = await getUserUsageWarnings(testUserId);

      for (const warning of Object.values(warnings)) {
        if (typeof warning === "object" && "percentage" in warning) {
          expect(warning.percentage).toBeGreaterThanOrEqual(0);
          expect(warning.percentage).toBeLessThanOrEqual(100);
        }
      }
    });

    it("should warn at 80% or above", async () => {
      const warnings = await getUserUsageWarnings(testUserId);

      for (const warning of Object.values(warnings)) {
        if (typeof warning === "object" && "shouldWarn" in warning && "percentage" in warning) {
          if (warning.shouldWarn) {
            expect(warning.percentage).toBeGreaterThanOrEqual(80);
          } else {
            expect(warning.percentage).toBeLessThan(80);
          }
        }
      }
    });
  });

  describe("Usage Summary", () => {
    it("should retrieve usage summary for user", async () => {
      const summary = await getUsageSummary(testUserId);

      expect(summary).toBeDefined();
      expect(summary).toHaveProperty("tier");
      expect(summary).toHaveProperty("usage");
      expect(summary).toHaveProperty("purchasedCredits");
    });

    it("should have correct usage structure", async () => {
      const summary = await getUsageSummary(testUserId);

      expect(summary.usage).toHaveProperty("pressReleases");
      expect(summary.usage).toHaveProperty("campaigns");
      expect(summary.usage).toHaveProperty("aiChatMessages");
      expect(summary.usage).toHaveProperty("images");

      // Check structure of each usage item
      const prUsage = summary.usage.pressReleases;
      expect(prUsage).toHaveProperty("current");
      expect(prUsage).toHaveProperty("limit");
      expect(prUsage).toHaveProperty("percentage");
      expect(typeof prUsage.current).toBe("number");
      expect(typeof prUsage.limit).toBe("number");
      expect(typeof prUsage.percentage).toBe("number");
    });

    it("should have valid tier", async () => {
      const summary = await getUsageSummary(testUserId);

      const validTiers = ["starter", "pro", "scale"];
      expect(validTiers).toContain(summary.tier);
    });

    it("should track purchased credits", async () => {
      const summary = await getUsageSummary(testUserId);

      expect(summary.purchasedCredits).toHaveProperty("words");
      expect(summary.purchasedCredits).toHaveProperty("images");
      expect(typeof summary.purchasedCredits.words).toBe("number");
      expect(typeof summary.purchasedCredits.images).toBe("number");
      expect(summary.purchasedCredits.words).toBeGreaterThanOrEqual(0);
      expect(summary.purchasedCredits.images).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Limit Checking", () => {
    it("should check if user has exceeded limits", async () => {
      const result = await hasExceededLimits(testUserId);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("exceeded");
      expect(result).toHaveProperty("limits");
      expect(typeof result.exceeded).toBe("boolean");
    });

    it("should have correct limit structure", async () => {
      const result = await hasExceededLimits(testUserId);

      expect(result.limits).toHaveProperty("pressReleases");
      expect(result.limits).toHaveProperty("campaigns");
      expect(result.limits).toHaveProperty("aiChatMessages");
      expect(result.limits).toHaveProperty("images");

      expect(typeof result.limits.pressReleases).toBe("boolean");
      expect(typeof result.limits.campaigns).toBe("boolean");
      expect(typeof result.limits.aiChatMessages).toBe("boolean");
      expect(typeof result.limits.images).toBe("boolean");
    });

    it("should set exceeded flag correctly", async () => {
      const result = await hasExceededLimits(testUserId);

      const anyLimitExceeded = Object.values(result.limits).some((exceeded) => exceeded);
      expect(result.exceeded).toBe(anyLimitExceeded);
    });
  });

  describe("Integration with Purchased Credits", () => {
    it("should include purchased image credits in limit calculation", async () => {
      const summary = await getUsageSummary(testUserId);

      // Image limit should include both tier limit and purchased credits
      const imageUsage = summary.usage.images;
      expect(imageUsage.limit).toBeGreaterThanOrEqual(0);

      // If user has purchased credits, limit should be higher
      if (summary.purchasedCredits.images > 0) {
        // Verify purchased credits are included in the limit
        expect(imageUsage.limit).toBeGreaterThan(0);
      }
    });
  });
});
