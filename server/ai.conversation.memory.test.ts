import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { saveAIConversation, getAIConversationsByDossier, getBusinessDossier } from "./db";
import { eq } from "drizzle-orm";

/**
 * Test Suite: AI Conversation Memory
 * 
 * Purpose: Verify that the AI Assistant can remember previous conversations
 * and maintain context across multiple sessions.
 * 
 * Critical for: Client experience, conversation continuity, context retention
 */

describe("AI Conversation Memory System", () => {
  let testUserId: number;
  let testDossierId: number;
  let conversationIds: number[] = [];

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const { users, businesses } = await import("../drizzle/schema");

    // Create test user
    const [testUser] = await db
      .insert(users)
      .values({
        openId: `test-conversation-memory-${Date.now()}`,
        name: "Test User for Conversation Memory",
        email: `test-conv-${Date.now()}@example.com`,
        role: "user",
      })
      .$returningId();

    testUserId = testUser.id;

    // Create test business/dossier
    const [testBusiness] = await db
      .insert(businesses)
      .values({
        userId: testUserId,
        name: "Test Company for Conversation Memory",
        website: "https://testconversation.example.com",
      })
      .$returningId();

    testDossierId = testBusiness.id;
  });

  afterAll(async () => {
    // Cleanup test data
    const db = await getDb();
    if (!db) return;

    const { users, businesses, aiConversations } = await import("../drizzle/schema");

    // Delete conversations
    await db.delete(aiConversations).where(eq(aiConversations.userId, testUserId));

    // Delete business
    await db.delete(businesses).where(eq(businesses.userId, testUserId));

    // Delete user
    await db.delete(users).where(eq(users.id, testUserId));
  });

  it("should save user messages to database", async () => {
    const result = await saveAIConversation({
      userId: testUserId,
      dossierId: testDossierId,
      conversationType: "chat",
      role: "user",
      content: "Hello, my company name is TechCorp",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    conversationIds.push(result.id);
  });

  it("should save assistant responses to database", async () => {
    const result = await saveAIConversation({
      userId: testUserId,
      dossierId: testDossierId,
      conversationType: "chat",
      role: "assistant",
      content: "Hello! I understand your company is TechCorp. How can I help you today?",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    conversationIds.push(result.id);
  });

  it("should retrieve conversation history by dossier ID", async () => {
    const conversations = await getAIConversationsByDossier(testDossierId, 50);

    expect(conversations).toBeDefined();
    expect(conversations.length).toBeGreaterThanOrEqual(2);
    
    // Verify conversations are in reverse chronological order (newest first)
    expect(conversations[0].role).toBe("assistant");
    expect(conversations[1].role).toBe("user");
  });

  it("should maintain conversation order for AI context", async () => {
    // Add multiple conversation turns
    await saveAIConversation({
      userId: testUserId,
      dossierId: testDossierId,
      conversationType: "chat",
      role: "user",
      content: "What services do we offer?",
    });

    await saveAIConversation({
      userId: testUserId,
      dossierId: testDossierId,
      conversationType: "chat",
      role: "assistant",
      content: "Based on your dossier, TechCorp offers Testing and Quality Assurance services.",
    });

    await saveAIConversation({
      userId: testUserId,
      dossierId: testDossierId,
      conversationType: "chat",
      role: "user",
      content: "What was my company name again?",
    });

    const conversations = await getAIConversationsByDossier(testDossierId, 50);

    // Should have at least 5 messages now
    expect(conversations.length).toBeGreaterThanOrEqual(5);

    // When reversed for AI context, should be chronological
    const chronological = conversations.reverse();
    expect(chronological[0].content).toContain("TechCorp");
    expect(chronological[chronological.length - 1].content).toContain("company name again");
  });

  it("should respect conversation history limit", async () => {
    // Add 25 more conversation turns (50 messages total)
    for (let i = 0; i < 25; i++) {
      await saveAIConversation({
        userId: testUserId,
        dossierId: testDossierId,
        conversationType: "chat",
        role: "user",
        content: `Test message ${i}`,
      });

      await saveAIConversation({
        userId: testUserId,
        dossierId: testDossierId,
        conversationType: "chat",
        role: "assistant",
        content: `Test response ${i}`,
      });
    }

    // Request only last 20 messages
    const limitedConversations = await getAIConversationsByDossier(testDossierId, 20);

    expect(limitedConversations.length).toBe(20);
    
    // Should get the most recent 20
    expect(limitedConversations[0].content).toContain("Test response 24");
  });

  it("should verify conversation continuity across sessions", async () => {
    // Simulate first session
    await saveAIConversation({
      userId: testUserId,
      dossierId: testDossierId,
      conversationType: "chat",
      role: "user",
      content: "I'm planning a product launch in March",
    });

    await saveAIConversation({
      userId: testUserId,
      dossierId: testDossierId,
      conversationType: "chat",
      role: "assistant",
      content: "Great! A March product launch gives us time to plan. What's the product?",
    });

    // Simulate second session (days later)
    await saveAIConversation({
      userId: testUserId,
      dossierId: testDossierId,
      conversationType: "chat",
      role: "user",
      content: "When is my product launch?",
    });

    // Load conversation history as AI would
    const history = await getAIConversationsByDossier(testDossierId, 20);
    const chronological = history.reverse();

    // Verify AI has access to previous session
    const marchMention = chronological.find(conv => 
      conv.content.includes("March") && conv.role === "user"
    );

    expect(marchMention).toBeDefined();
    expect(marchMention?.content).toContain("product launch in March");
  });

  it("should handle empty conversation history gracefully", async () => {
    // Create a new dossier with no conversations
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const { businesses } = await import("../drizzle/schema");

    const [newBusiness] = await db
      .insert(businesses)
      .values({
        userId: testUserId,
        name: "Empty Conversation Test",
        website: "https://empty.example.com",
      })
      .$returningId();

    const emptyConversations = await getAIConversationsByDossier(newBusiness.id, 20);

    expect(emptyConversations).toBeDefined();
    expect(emptyConversations.length).toBe(0);

    // Cleanup
    await db.delete(businesses).where(eq(businesses.id, newBusiness.id));
  });

  it("should verify conversation metadata is preserved", async () => {
    const testMetadata = {
      model: "gpt-4",
      tokens: 150,
      responseTime: 1234,
    };

    await saveAIConversation({
      userId: testUserId,
      dossierId: testDossierId,
      conversationType: "chat",
      role: "user",
      content: "Test message with metadata",
      metadata: JSON.stringify(testMetadata),
    });

    const conversations = await getAIConversationsByDossier(testDossierId, 5);
    const withMetadata = conversations.find(conv => 
      conv.content === "Test message with metadata"
    );

    expect(withMetadata).toBeDefined();
    expect(withMetadata?.metadata).toBeDefined();
    
    if (withMetadata?.metadata) {
      expect(withMetadata.metadata.model).toBe("gpt-4");
      expect(withMetadata.metadata.tokens).toBe(150);
    }
  });
});

/**
 * Test Results Interpretation:
 * 
 * ✅ All tests pass: Conversation memory system is working correctly
 * ❌ Tests fail: Indicates issues with:
 *    - Database storage
 *    - Conversation retrieval
 *    - Order/chronology
 *    - Limit enforcement
 * 
 * Critical Success Criteria:
 * 1. Conversations are saved correctly
 * 2. Conversations are retrieved in correct order
 * 3. History limit is respected
 * 4. Context persists across sessions
 */
