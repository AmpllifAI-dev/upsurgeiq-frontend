import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendPurchaseConfirmationEmail } from "./purchaseEmails";
import * as emailModule from "./_core/email";

// Mock the email module
vi.mock("./_core/email", () => ({
  sendEmail: vi.fn(),
}));

describe("Purchase Confirmation Emails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send word count purchase confirmation email", async () => {
    const params = {
      to: "test@example.com",
      name: "Test User",
      productType: "word_count" as const,
      productKey: "words_300",
      amountPaid: 400, // £4.00 in pence
      currency: "gbp",
      purchaseDate: new Date("2025-12-20"),
      availableCredits: {
        words: 300,
      },
    };

    await sendPurchaseConfirmationEmail(params);

    expect(emailModule.sendEmail).toHaveBeenCalledTimes(1);
    
    const emailCall = vi.mocked(emailModule.sendEmail).mock.calls[0][0];
    
    expect(emailCall.to).toBe("test@example.com");
    expect(emailCall.subject).toContain("Purchase Confirmed");
    expect(emailCall.subject).toContain("300 Extra Words");
    expect(emailCall.html).toContain("Test User");
    expect(emailCall.html).toContain("£4.00");
    expect(emailCall.html).toContain("300");
    expect(emailCall.html).toContain("words");
    expect(emailCall.text).toContain("Test User");
    expect(emailCall.text).toContain("£4.00");
  });

  it("should send image pack purchase confirmation email", async () => {
    const params = {
      to: "test@example.com",
      name: "Test User",
      productType: "image_pack" as const,
      productKey: "pack_5",
      amountPaid: 1499, // £14.99 in pence
      currency: "gbp",
      purchaseDate: new Date("2025-12-20"),
      availableCredits: {
        images: 5,
      },
    };

    await sendPurchaseConfirmationEmail(params);

    expect(emailModule.sendEmail).toHaveBeenCalledTimes(1);
    
    const emailCall = vi.mocked(emailModule.sendEmail).mock.calls[0][0];
    
    expect(emailCall.to).toBe("test@example.com");
    expect(emailCall.subject).toContain("Purchase Confirmed");
    expect(emailCall.subject).toContain("5 Image Credits");
    expect(emailCall.html).toContain("Test User");
    expect(emailCall.html).toContain("£14.99");
    expect(emailCall.html).toContain("5");
    expect(emailCall.html).toContain("images");
  });

  it("should include both word and image credits in balance", async () => {
    const params = {
      to: "test@example.com",
      name: "Test User",
      productType: "word_count" as const,
      productKey: "words_600",
      amountPaid: 800,
      currency: "gbp",
      purchaseDate: new Date("2025-12-20"),
      availableCredits: {
        words: 900,
        images: 10,
      },
    };

    await sendPurchaseConfirmationEmail(params);

    const emailCall = vi.mocked(emailModule.sendEmail).mock.calls[0][0];
    
    expect(emailCall.html).toContain("900");
    expect(emailCall.html).toContain("10");
    expect(emailCall.html).toContain("Extra Words Available");
    expect(emailCall.html).toContain("AI Images Available");
  });

  it("should format amount correctly", async () => {
    const params = {
      to: "test@example.com",
      name: "Test User",
      productType: "word_count" as const,
      productKey: "words_900",
      amountPaid: 1200, // £12.00 in pence
      currency: "gbp",
      purchaseDate: new Date("2025-12-20"),
      availableCredits: {
        words: 900,
      },
    };

    await sendPurchaseConfirmationEmail(params);

    const emailCall = vi.mocked(emailModule.sendEmail).mock.calls[0][0];
    
    expect(emailCall.html).toContain("£12.00");
    expect(emailCall.text).toContain("£12.00");
  });

  it("should include purchase date in email", async () => {
    const purchaseDate = new Date("2025-12-20");
    const params = {
      to: "test@example.com",
      name: "Test User",
      productType: "image_pack" as const,
      productKey: "single",
      amountPaid: 399,
      currency: "gbp",
      purchaseDate,
      availableCredits: {
        images: 1,
      },
    };

    await sendPurchaseConfirmationEmail(params);

    const emailCall = vi.mocked(emailModule.sendEmail).mock.calls[0][0];
    
    // Check for formatted date (20 December 2025)
    expect(emailCall.html).toContain("20");
    expect(emailCall.html).toContain("December");
    expect(emailCall.html).toContain("2025");
  });

  it("should include CTA link to dashboard", async () => {
    const params = {
      to: "test@example.com",
      name: "Test User",
      productType: "word_count" as const,
      productKey: "words_300",
      amountPaid: 400,
      currency: "gbp",
      purchaseDate: new Date("2025-12-20"),
      availableCredits: {
        words: 300,
      },
    };

    await sendPurchaseConfirmationEmail(params);

    const emailCall = vi.mocked(emailModule.sendEmail).mock.calls[0][0];
    
    expect(emailCall.html).toContain("/dashboard");
    expect(emailCall.html).toContain("Start Creating");
  });

  it("should include support contact information", async () => {
    const params = {
      to: "test@example.com",
      name: "Test User",
      productType: "word_count" as const,
      productKey: "words_300",
      amountPaid: 400,
      currency: "gbp",
      purchaseDate: new Date("2025-12-20"),
      availableCredits: {
        words: 300,
      },
    };

    await sendPurchaseConfirmationEmail(params);

    const emailCall = vi.mocked(emailModule.sendEmail).mock.calls[0][0];
    
    expect(emailCall.html).toContain("support@upsurgeiq.com");
    expect(emailCall.text).toContain("support@upsurgeiq.com");
  });
});
