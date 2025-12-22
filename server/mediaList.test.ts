import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { mediaListCategories, mediaListCredits, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Media List and Credit Management", () => {
  let testUserId: number;
  let testCategoryId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        openId: `test-media-${Date.now()}`,
        name: "Test User",
        email: "test@example.com",
        role: "user",
      })
      .$returningId();

    testUserId = user.id;

    // Create test category
    const [category] = await db
      .insert(mediaListCategories)
      .values({
        name: "Test Yachting",
        type: "genre",
        description: "Test yachting publications",
        isPopulated: false,
      })
      .$returningId();

    testCategoryId = category.id;

    // Initialize credit balance (only if doesn't exist)
    const existing = await db
      .select()
      .from(mediaListCredits)
      .where(eq(mediaListCredits.userId, testUserId))
      .limit(1);
    
    if (existing.length === 0) {
      await db.insert(mediaListCredits).values({
        userId: testUserId,
        credits: 0,
      });
    }
  });

  it("should retrieve media list categories", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const categories = await caller.mediaList.getCategories({});
    
    expect(categories).toBeDefined();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    
    const testCategory = categories.find((c) => c.id === testCategoryId);
    expect(testCategory).toBeDefined();
    expect(testCategory?.name).toBe("Test Yachting");
    expect(testCategory?.type).toBe("genre");
  });

  it("should filter categories by type", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const genreCategories = await caller.mediaList.getCategories({ type: "genre" });
    
    expect(genreCategories).toBeDefined();
    expect(genreCategories.every((c) => c.type === "genre")).toBe(true);
  });

  it("should get user credit balance", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test", name: "Test", role: "user" } as any,
      req: {} as any,
      res: {} as any,
    });

    const balance = await caller.mediaList.getCredits();
    
    expect(balance).toBeDefined();
    expect(typeof balance).toBe("number");
    expect(balance).toBe(0);
  });

  it("should retrieve available credit products", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const products = await caller.stripe.getProducts();
    
    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBe(3);
    
    const starter = products.find((p) => p.id === "STARTER");
    expect(starter).toBeDefined();
    expect(starter?.credits).toBe(10);
    expect(starter?.priceGBP).toBe(3600);
    expect(starter?.priceId).toBe("price_1Sh4t0IEVr3V21Jee3XjNcYX");
    
    const professional = products.find((p) => p.id === "PROFESSIONAL");
    expect(professional).toBeDefined();
    expect(professional?.credits).toBe(20);
    expect(professional?.priceGBP).toBe(6800);
    
    const enterprise = products.find((p) => p.id === "ENTERPRISE");
    expect(enterprise).toBeDefined();
    expect(enterprise?.credits).toBe(30);
    expect(enterprise?.priceGBP).toBe(9600);
  });

  it("should create Stripe checkout session for authenticated user", async () => {
    const caller = appRouter.createCaller({
      user: { 
        id: testUserId, 
        openId: "test", 
        name: "Test User", 
        email: "test@example.com",
        role: "user" 
      } as any,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.stripe.createCheckoutSession({
      productId: "STARTER",
    });
    
    expect(result).toBeDefined();
    expect(result.checkoutUrl).toBeDefined();
    expect(typeof result.checkoutUrl).toBe("string");
    expect(result.checkoutUrl).toContain("checkout.stripe.com");
  });

  it("should require authentication for checkout", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.stripe.createCheckoutSession({ productId: "STARTER" })
    ).rejects.toThrow();
  });
});
