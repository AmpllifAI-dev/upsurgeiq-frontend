import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users, campaigns, campaignVariants, userNotifications } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "./notificationService";

describe("Notification System", () => {
  let testUserId: number;
  let testCampaignId: number;
  let testVariantId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const userOpenId = `test-notification-user-${Date.now()}`;
    const userResult = await db.insert(users).values({
      openId: userOpenId,
      name: "Notification Test User",
      email: "notification-test@example.com",
      role: "user",
      supportRole: "none",
    });
    
    // Fetch the created user to get the ID
    const [createdUser] = await db.select().from(users).where(eq(users.openId, userOpenId)).limit(1);
    if (!createdUser) throw new Error("Failed to create test user");
    testUserId = createdUser.id;

    // Create test campaign
    const campaignResult = await db.insert(campaigns).values({
      businessId: 1,
      userId: testUserId,
      name: "Test Notification Campaign",
      status: "active",
    });
    const campaignInsertId = (campaignResult as any).insertId;
    testCampaignId = typeof campaignInsertId === 'bigint' ? Number(campaignInsertId) : campaignInsertId;
    
    // Verify campaign was created
    const [createdCampaign] = await db.select().from(campaigns).where(eq(campaigns.name, "Test Notification Campaign")).limit(1);
    if (createdCampaign) {
      testCampaignId = createdCampaign.id;
    }

    // Create test variant
    const variantResult = await db.insert(campaignVariants).values({
      campaignId: testCampaignId,
      name: "Test Variant",
      psychologicalAngle: "Scarcity",
      adCopy: "Test ad copy",
      status: "testing",
      approvalStatus: "pending",
      deploymentStatus: "not_deployed",
    });
    const variantInsertId = (variantResult as any).insertId;
    testVariantId = typeof variantInsertId === 'bigint' ? Number(variantInsertId) : variantInsertId;
    
    // Verify variant was created
    const [createdVariant] = await db.select().from(campaignVariants).where(eq(campaignVariants.name, "Test Variant")).limit(1);
    if (createdVariant) {
      testVariantId = createdVariant.id;
    }
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Cleanup
    await db.delete(userNotifications).where(eq(userNotifications.userId, testUserId));
    await db.delete(campaignVariants).where(eq(campaignVariants.id, testVariantId));
    await db.delete(campaigns).where(eq(campaigns.id, testCampaignId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe("Notification Creation", () => {
    it("should create a pending approval notification", async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: "pending_approval",
        title: "Test Pending Approval",
        message: "Test message for pending approval",
        entityType: "campaign",
        entityId: testCampaignId,
      });

      expect(notification).toBeDefined();
      expect(notification.id).toBeGreaterThan(0);
      expect(notification.type).toBe("pending_approval");
      expect(notification.title).toBe("Test Pending Approval");
    });

    it("should create an underperforming ad notification", async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: "underperforming_ad",
        title: "Test Underperforming Ad",
        message: "Test message for underperforming ad",
        entityType: "campaign_variant",
        entityId: testVariantId,
      });

      expect(notification).toBeDefined();
      expect(notification.type).toBe("underperforming_ad");
    });

    it("should create an optimization action notification", async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: "optimization_action",
        title: "Test Optimization Action",
        message: "Test message for optimization action",
      });

      expect(notification).toBeDefined();
      expect(notification.type).toBe("optimization_action");
    });

    it("should create a variant deployed notification", async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: "variant_deployed",
        title: "Test Variant Deployed",
        message: "Test message for variant deployed",
        entityType: "campaign_variant",
        entityId: testVariantId,
      });

      expect(notification).toBeDefined();
      expect(notification.type).toBe("variant_deployed");
    });

    it("should create a variant paused notification", async () => {
      const notification = await createNotification({
        userId: testUserId,
        type: "variant_paused",
        title: "Test Variant Paused",
        message: "Test message for variant paused",
        entityType: "campaign_variant",
        entityId: testVariantId,
      });

      expect(notification).toBeDefined();
      expect(notification.type).toBe("variant_paused");
    });
  });

  describe("Notification Retrieval", () => {
    it("should get all notifications for a user", async () => {
      const notifications = await getUserNotifications(testUserId);

      expect(notifications).toBeDefined();
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBeGreaterThan(0);
    });

    it("should get unread count for a user", async () => {
      const count = await getUnreadCount(testUserId);

      expect(count).toBeGreaterThan(0);
      expect(typeof count).toBe("number");
    });

    it("should return notifications in descending order by creation date", async () => {
      const notifications = await getUserNotifications(testUserId);

      if (notifications.length > 1) {
        const firstDate = new Date(notifications[0].createdAt).getTime();
        const secondDate = new Date(notifications[1].createdAt).getTime();
        expect(firstDate).toBeGreaterThanOrEqual(secondDate);
      }
    });
  });

  describe("Notification Status Management", () => {
    it("should mark a notification as read", async () => {
      const notifications = await getUserNotifications(testUserId);
      const unreadNotification = notifications.find((n) => !n.isRead);

      if (unreadNotification) {
        const result = await markNotificationAsRead(unreadNotification.id, testUserId);
        expect(result.success).toBe(true);

        // Verify it's marked as read
        const updated = await getUserNotifications(testUserId);
        const markedNotification = updated.find((n) => n.id === unreadNotification.id);
        expect(markedNotification?.isRead).toBe(1);
        expect(markedNotification?.readAt).toBeDefined();
      }
    });

    it("should mark all notifications as read", async () => {
      // Create a few more unread notifications
      await createNotification({
        userId: testUserId,
        type: "pending_approval",
        title: "Unread Test 1",
        message: "Test unread message 1",
      });

      await createNotification({
        userId: testUserId,
        type: "pending_approval",
        title: "Unread Test 2",
        message: "Test unread message 2",
      });

      const result = await markAllNotificationsAsRead(testUserId);
      expect(result.success).toBe(true);

      // Verify all are marked as read
      const unreadCount = await getUnreadCount(testUserId);
      expect(unreadCount).toBe(0);
    });

    it("should delete a notification", async () => {
      // Create a notification to delete
      const notification = await createNotification({
        userId: testUserId,
        type: "pending_approval",
        title: "To Be Deleted",
        message: "This notification will be deleted",
      });

      const result = await deleteNotification(notification.id, testUserId);
      expect(result.success).toBe(true);

      // Verify it's deleted
      const notifications = await getUserNotifications(testUserId);
      const deletedNotification = notifications.find((n) => n.id === notification.id);
      expect(deletedNotification).toBeUndefined();
    });
  });

  describe("Notification Security", () => {
    it("should not allow marking another user's notification as read", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create another test user
      const otherUserOpenId = `test-other-user-${Date.now()}`;
      await db.insert(users).values({
        openId: otherUserOpenId,
        name: "Other Test User",
        email: "other-test@example.com",
        role: "user",
        supportRole: "none",
      });
      
      const [otherUser] = await db.select().from(users).where(eq(users.openId, otherUserOpenId)).limit(1);
      if (!otherUser) throw new Error("Failed to create other test user");
      const otherUserId = otherUser.id;

      // Create notification for other user
      const notification = await createNotification({
        userId: otherUserId,
        type: "pending_approval",
        title: "Other User Notification",
        message: "This belongs to another user",
      });

      // Try to mark it as read with wrong user ID
      await markNotificationAsRead(notification.id, testUserId);

      // Verify it's still unread for the other user
      const unreadCount = await getUnreadCount(otherUserId);
      expect(unreadCount).toBeGreaterThan(0);

      // Cleanup
      await db.delete(userNotifications).where(eq(userNotifications.userId, otherUserId));
      await db.delete(users).where(eq(users.id, otherUserId));
    });

    it("should not allow deleting another user's notification", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create another test user
      const otherUserOpenId = `test-other-user-delete-${Date.now()}`;
      await db.insert(users).values({
        openId: otherUserOpenId,
        name: "Other Test User Delete",
        email: "other-test-delete@example.com",
        role: "user",
        supportRole: "none",
      });
      
      const [otherUser] = await db.select().from(users).where(eq(users.openId, otherUserOpenId)).limit(1);
      if (!otherUser) throw new Error("Failed to create other test user");
      const otherUserId = otherUser.id;

      // Create notification for other user
      const notification = await createNotification({
        userId: otherUserId,
        type: "pending_approval",
        title: "Other User Notification to Delete",
        message: "This belongs to another user",
      });

      // Try to delete it with wrong user ID
      await deleteNotification(notification.id, testUserId);

      // Verify it still exists for the other user
      const notifications = await getUserNotifications(otherUserId);
      const stillExists = notifications.find((n) => n.id === notification.id);
      expect(stillExists).toBeDefined();

      // Cleanup
      await db.delete(userNotifications).where(eq(userNotifications.userId, otherUserId));
      await db.delete(users).where(eq(users.id, otherUserId));
    });
  });

  describe("Notification Limits", () => {
    it("should limit notifications to 50 per query", async () => {
      // Create 60 notifications
      for (let i = 0; i < 60; i++) {
        await createNotification({
          userId: testUserId,
          type: "pending_approval",
          title: `Bulk Test ${i}`,
          message: `Bulk test message ${i}`,
        });
      }

      const notifications = await getUserNotifications(testUserId);
      expect(notifications.length).toBeLessThanOrEqual(50);
    });
  });
});
