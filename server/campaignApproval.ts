import { getDb } from "./db";
import { campaignVariants, campaigns } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { logActivity } from "./activityLog";

/**
 * Approve a variant for deployment
 */
export async function approveVariant(variantId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get variant details
  const [variant] = await db
    .select()
    .from(campaignVariants)
    .where(eq(campaignVariants.id, variantId))
    .limit(1);

  if (!variant) {
    throw new Error("Variant not found");
  }

  // Update approval status
  await db
    .update(campaignVariants)
    .set({
      approvalStatus: "approved",
      updatedAt: new Date(),
    })
    .where(eq(campaignVariants.id, variantId));

  // Log activity
  await logActivity({
    userId,
    action: "approve",
    entityType: "campaign_variant",
    entityId: variantId,
    description: `Approved variant: ${variant.name}`,
    metadata: {
      variantId,
      campaignId: variant.campaignId,
      psychologicalAngle: variant.psychologicalAngle,
    },
  });

  // Create notification
  const { createNotification } = await import("./notificationService");
  await createNotification({
    userId,
    type: "optimization_action",
    title: "Ad Variant Approved",
    message: `Ad variant "${variant.name}" has been approved and is ready for deployment.`,
    entityType: "campaign_variant",
    entityId: variantId,
  });

  return { success: true, variant: { ...variant, approvalStatus: "approved" } };
}

/**
 * Reject a variant
 */
export async function rejectVariant(variantId: number, userId: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get variant details
  const [variant] = await db
    .select()
    .from(campaignVariants)
    .where(eq(campaignVariants.id, variantId))
    .limit(1);

  if (!variant) {
    throw new Error("Variant not found");
  }

  // Update approval status
  await db
    .update(campaignVariants)
    .set({
      approvalStatus: "rejected",
      updatedAt: new Date(),
    })
    .where(eq(campaignVariants.id, variantId));

  // Log activity
  await logActivity({
    userId,
    action: "reject",
    entityType: "campaign_variant",
    entityId: variantId,
    description: `Rejected variant: ${variant.name}${reason ? ` - Reason: ${reason}` : ""}`,
    metadata: {
      variantId,
      campaignId: variant.campaignId,
      reason,
    },
  });

  return { success: true };
}

/**
 * Deploy an approved variant to ad platforms
 */
export async function deployVariant(variantId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get variant details
  const [variant] = await db
    .select()
    .from(campaignVariants)
    .where(eq(campaignVariants.id, variantId))
    .limit(1);

  if (!variant) {
    throw new Error("Variant not found");
  }

  // Check if approved
  if (variant.approvalStatus !== "approved") {
    throw new Error("Variant must be approved before deployment");
  }

  // Update deployment status
  await db
    .update(campaignVariants)
    .set({
      deploymentStatus: "deployed",
      deployedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(campaignVariants.id, variantId));

  // Log activity
  await logActivity({
    userId,
    action: "deploy",
    entityType: "campaign_variant",
    entityId: variantId,
    description: `Deployed variant: ${variant.name}`,
    metadata: {
      variantId,
      campaignId: variant.campaignId,
      psychologicalAngle: variant.psychologicalAngle,
    },
  });

  // Create notification
  const { createNotification } = await import("./notificationService");
  await createNotification({
    userId,
    type: "variant_deployed",
    title: "Ad Variant Deployed",
    message: `Ad variant "${variant.name}" has been deployed and is now live.`,
    entityType: "campaign_variant",
    entityId: variantId,
  });

  return { success: true, deployedAt: new Date() };
}

/**
 * Pause a deployed variant
 */
export async function pauseVariant(variantId: number, userId: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get variant details
  const [variant] = await db
    .select()
    .from(campaignVariants)
    .where(eq(campaignVariants.id, variantId))
    .limit(1);

  if (!variant) {
    throw new Error("Variant not found");
  }

  // Update deployment status
  await db
    .update(campaignVariants)
    .set({
      deploymentStatus: "paused",
      pausedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(campaignVariants.id, variantId));

  // Log activity
  await logActivity({
    userId,
    action: "pause",
    entityType: "campaign_variant",
    entityId: variantId,
    description: `Paused variant: ${variant.name}${reason ? ` - Reason: ${reason}` : ""}`,
    metadata: {
      variantId,
      campaignId: variant.campaignId,
      reason,
    },
  });

  // Create notification
  const { createNotification } = await import("./notificationService");
  await createNotification({
    userId,
    type: "variant_paused",
    title: "Ad Variant Paused",
    message: reason
      ? `Ad variant "${variant.name}" has been paused. Reason: ${reason}`
      : `Ad variant "${variant.name}" has been paused.`,
    entityType: "campaign_variant",
    entityId: variantId,
  });

  return { success: true };
}

/**
 * Resume a paused variant
 */
export async function resumeVariant(variantId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get variant details
  const [variant] = await db
    .select()
    .from(campaignVariants)
    .where(eq(campaignVariants.id, variantId))
    .limit(1);

  if (!variant) {
    throw new Error("Variant not found");
  }

  // Check if approved
  if (variant.approvalStatus !== "approved") {
    throw new Error("Variant must be approved before resuming");
  }

  // Update deployment status
  await db
    .update(campaignVariants)
    .set({
      deploymentStatus: "deployed",
      pausedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(campaignVariants.id, variantId));

  // Log activity
  await logActivity({
    userId,
    action: "resume",
    entityType: "campaign_variant",
    entityId: variantId,
    description: `Resumed variant: ${variant.name}`,
    metadata: {
      variantId,
      campaignId: variant.campaignId,
    },
  });

  return { success: true };
}

/**
 * Get pending variants for a campaign (require approval)
 */
export async function getPendingVariants(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const variants = await db
    .select()
    .from(campaignVariants)
    .where(
      and(
        eq(campaignVariants.campaignId, campaignId),
        eq(campaignVariants.approvalStatus, "pending")
      )
    );

  return variants;
}

/**
 * Get approved variants ready for deployment
 */
export async function getApprovedVariants(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const variants = await db
    .select()
    .from(campaignVariants)
    .where(
      and(
        eq(campaignVariants.campaignId, campaignId),
        eq(campaignVariants.approvalStatus, "approved"),
        eq(campaignVariants.deploymentStatus, "not_deployed")
      )
    );

  return variants;
}

/**
 * Get deployed variants for a campaign
 */
export async function getDeployedVariants(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const variants = await db
    .select()
    .from(campaignVariants)
    .where(
      and(
        eq(campaignVariants.campaignId, campaignId),
        eq(campaignVariants.deploymentStatus, "deployed")
      )
    );

  return variants;
}
