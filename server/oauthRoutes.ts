/**
 * OAuth Routes for Social Media Platforms
 * 
 * Handles OAuth callbacks for Facebook, Instagram, LinkedIn, and X (Twitter)
 */

import { Router } from "express";
import { getAuthorizationUrl, exchangeCodeForToken } from "./socialOAuth";
import { getDb } from "./db";
import { socialConnections } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { createLogger } from "./_core/logger";
import crypto from "crypto";

const logger = createLogger("OAuthRoutes");
const router = Router();

// Store state tokens temporarily (in production, use Redis or database)
const stateStore = new Map<string, { userId: number; platform: string; timestamp: number }>();

// Clean up expired state tokens (older than 10 minutes)
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(stateStore.entries());
  for (const [state, data] of entries) {
    if (now - data.timestamp > 10 * 60 * 1000) {
      stateStore.delete(state);
    }
  }
}, 60 * 1000);

/**
 * Initiate OAuth flow
 * GET /api/oauth/:platform/authorize
 */
router.get("/:platform/authorize", async (req, res) => {
  const { platform } = req.params;
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).send("Missing userId parameter");
  }

  if (!["facebook", "instagram", "linkedin", "x"].includes(platform)) {
    return res.status(400).send("Invalid platform");
  }

  try {
    // Generate state token for CSRF protection
    const state = crypto.randomBytes(32).toString("hex");
    stateStore.set(state, {
      userId: parseInt(userId),
      platform,
      timestamp: Date.now(),
    });

    // Get authorization URL
    const authUrl = getAuthorizationUrl(platform, state);

    logger.info("OAuth flow initiated", {
      action: "initiateOAuth",
      userId: parseInt(userId),
      metadata: { platform },
    });

    res.redirect(authUrl);
  } catch (error: any) {
    logger.error("Failed to initiate OAuth", error, {
      action: "initiateOAuth",
      metadata: { platform },
    });
    res.status(500).send("Failed to initiate OAuth flow");
  }
});

/**
 * Handle OAuth callback
 * GET /api/oauth/:platform/callback
 */
router.get("/:platform/callback", async (req, res) => {
  const { platform } = req.params;
  const { code, state, error, error_description } = req.query;

  // Handle OAuth errors
  if (error) {
    logger.error("OAuth error from provider", undefined, {
      action: "handleCallback",
      metadata: { platform, error, error_description },
    });
    return res.redirect(
      `/dashboard/social-connections?error=${encodeURIComponent(error_description as string || error as string)}`
    );
  }

  if (!code || !state) {
    return res.status(400).send("Missing code or state parameter");
  }

  // Verify state token
  const stateData = stateStore.get(state as string);
  if (!stateData) {
    logger.error("Invalid or expired state token", undefined, {
      action: "handleCallback",
      metadata: { platform },
    });
    return res.redirect(
      `/dashboard/social-connections?error=${encodeURIComponent("Invalid or expired state token")}`
    );
  }

  // Clean up state token
  stateStore.delete(state as string);

  const { userId, platform: expectedPlatform } = stateData;

  // Verify platform matches
  if (platform !== expectedPlatform) {
    return res.status(400).send("Platform mismatch");
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(platform, code as string);

    // Fetch user profile from the platform
    const profile = await fetchUserProfile(platform, tokenData.accessToken);

    // Save connection to database
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }

    // Check if connection already exists
    const existing = await db
      .select()
      .from(socialConnections)
      .where(
        and(
          eq(socialConnections.userId, userId),
          eq(socialConnections.platform, platform as any)
        )
      )
      .limit(1);

    const connectionData = {
      userId,
      platform: platform as "facebook" | "instagram" | "linkedin" | "x",
      platformUserId: profile.id,
      platformUsername: profile.username || profile.name,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken || null,
      tokenExpiresAt: tokenData.expiresIn
        ? new Date(Date.now() + tokenData.expiresIn * 1000)
        : null,
      profilePictureUrl: profile.profilePicture || null,
      isActive: 1,
    };

    if (existing.length > 0) {
      // Update existing connection
      await db
        .update(socialConnections)
        .set(connectionData)
        .where(eq(socialConnections.id, existing[0].id));

      logger.info("Social connection updated", {
        action: "updateConnection",
        userId,
        metadata: { platform, platformUserId: profile.id },
      });
    } else {
      // Insert new connection
      await db.insert(socialConnections).values(connectionData);

      logger.info("Social connection created", {
        action: "createConnection",
        userId,
        metadata: { platform, platformUserId: profile.id },
      });
    }

    // Redirect back to social connections page with success
    res.redirect(`/dashboard/social-connections?success=${platform}`);
  } catch (error: any) {
    logger.error("Failed to complete OAuth", error, {
      action: "handleCallback",
      userId,
      metadata: { platform },
    });
    res.redirect(
      `/dashboard/social-connections?error=${encodeURIComponent(error.message || "Failed to connect account")}`
    );
  }
});

/**
 * Fetch user profile from platform
 */
async function fetchUserProfile(
  platform: string,
  accessToken: string
): Promise<{ id: string; username?: string; name?: string; profilePicture?: string }> {
  let url: string;
  let headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  switch (platform) {
    case "facebook":
      url = "https://graph.facebook.com/v18.0/me?fields=id,name,picture";
      break;
    case "instagram":
      // Instagram uses Facebook Graph API for OAuth
      // First get the user's Facebook pages, then get Instagram Business Account
      url = "https://graph.facebook.com/v18.0/me/accounts?fields=id,name,instagram_business_account{id,username,profile_picture_url}";
      break;
    case "linkedin":
      url = "https://api.linkedin.com/v2/userinfo";
      break;
    case "x":
      url = "https://api.twitter.com/2/users/me?user.fields=profile_image_url";
      break;
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const error = await response.text();
    logger.error(`Failed to fetch ${platform} profile`, undefined, {
      action: "fetchUserProfile",
      metadata: { platform, statusCode: response.status, error },
    });
    throw new Error(`Failed to fetch profile: ${error}`);
  }

  const data = await response.json();
  
  logger.info(`Successfully fetched ${platform} profile`, {
    action: "fetchUserProfile",
    metadata: { platform, hasData: !!data },
  });

  // Normalize response across platforms
  switch (platform) {
    case "facebook":
      return {
        id: data.id,
        name: data.name,
        profilePicture: data.picture?.data?.url,
      };
    case "instagram":
      // Find the first page with an Instagram Business Account
      const pageWithInstagram = data.data?.find((page: any) => page.instagram_business_account);
      if (!pageWithInstagram?.instagram_business_account) {
        logger.error("No Instagram Business Account found", undefined, {
          action: "fetchUserProfile",
          metadata: { 
            platform: "instagram", 
            pagesFound: data.data?.length || 0,
            pageNames: data.data?.map((p: any) => p.name) || [],
          },
        });
        throw new Error(
          "No Instagram Business Account found linked to your Facebook Pages. " +
          "Please: 1) Convert your Instagram to a Business or Creator account, " +
          "2) Link it to one of your Facebook Pages in Instagram settings, " +
          "3) Make sure you grant access to that Facebook Page when authorizing."
        );
      }
      const igAccount = pageWithInstagram.instagram_business_account;
      return {
        id: igAccount.id,
        username: igAccount.username,
        profilePicture: igAccount.profile_picture_url,
      };
    case "linkedin":
      return {
        id: data.sub,
        name: data.name,
        profilePicture: data.picture,
      };
    case "x":
      return {
        id: data.data.id,
        username: data.data.username,
        profilePicture: data.data.profile_image_url,
      };
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

export default router;
