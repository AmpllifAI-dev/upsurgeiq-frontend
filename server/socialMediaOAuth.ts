/**
 * Social Media OAuth Integration
 * 
 * Handles OAuth flows for Twitter, LinkedIn, and Facebook
 * Allows clients to connect their own social accounts for direct posting
 */

import { getDb } from "./db";
import { socialMediaAccounts } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

/**
 * Twitter/X OAuth 2.0
 */
export class TwitterOAuth {
  private config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Generate authorization URL for Twitter OAuth
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(" "),
      state,
      code_challenge: "challenge", // PKCE required
      code_challenge_method: "plain",
    });

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<OAuthTokens> {
    const response = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.config.redirectUri,
        code_verifier: "challenge",
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Twitter OAuth failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const response = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Twitter token refresh failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    };
  }

  /**
   * Post tweet
   */
  async postTweet(accessToken: string, text: string): Promise<{ id: string; text: string }> {
    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Twitter post failed: ${error.detail || response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }
}

/**
 * LinkedIn OAuth 2.0
 */
export class LinkedInOAuth {
  private config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Generate authorization URL for LinkedIn OAuth
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(" "),
      state,
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<OAuthTokens> {
    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`LinkedIn OAuth failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    };
  }

  /**
   * Post to LinkedIn
   */
  async createPost(accessToken: string, text: string, authorId: string): Promise<{ id: string }> {
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${authorId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text,
            },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LinkedIn post failed: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return { id: data.id };
  }

  /**
   * Get LinkedIn user profile
   */
  async getUserProfile(accessToken: string): Promise<{ id: string; firstName: string; lastName: string }> {
    const response = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`LinkedIn profile fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      firstName: data.localizedFirstName,
      lastName: data.localizedLastName,
    };
  }
}

/**
 * Facebook OAuth 2.0
 */
export class FacebookOAuth {
  private config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Generate authorization URL for Facebook OAuth
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(","),
      state,
      response_type: "code",
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      code,
    });

    const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Facebook OAuth failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    };
  }

  /**
   * Post to Facebook page
   */
  async createPagePost(accessToken: string, pageId: string, message: string): Promise<{ id: string }> {
    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook post failed: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return { id: data.id };
  }

  /**
   * Get user's Facebook pages
   */
  async getUserPages(accessToken: string): Promise<Array<{ id: string; name: string; accessToken: string }>> {
    const response = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);

    if (!response.ok) {
      throw new Error(`Facebook pages fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((page: any) => ({
      id: page.id,
      name: page.name,
      accessToken: page.access_token,
    }));
  }
}

/**
 * Store social media account credentials
 */
export async function storeSocialMediaAccount(
  businessId: number,
  platform: "x" | "linkedin" | "facebook",
  tokens: OAuthTokens,
  platformUserId: string,
  username: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  await db
    .insert(socialMediaAccounts)
    .values({
      businessId,
      platform,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiry: tokens.expiresAt,
      accountId: platformUserId,
      accountName: username,
      isConnected: 1,
    });

  // Get the inserted account
  const [account] = await db
    .select()
    .from(socialMediaAccounts)
    .where(and(eq(socialMediaAccounts.businessId, businessId), eq(socialMediaAccounts.platform, platform as any)))
    .orderBy(socialMediaAccounts.id)
    .limit(1);

  return account;
}

/**
 * Get social media account by business and platform
 */
export async function getSocialMediaAccount(businessId: number, platform: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const [account] = await db
    .select()
    .from(socialMediaAccounts)
    .where(and(eq(socialMediaAccounts.businessId, businessId), eq(socialMediaAccounts.platform, platform as any)))
    .limit(1);

  return account;
}

/**
 * Update social media account tokens
 */
export async function updateSocialMediaTokens(accountId: number, tokens: OAuthTokens) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  await db
    .update(socialMediaAccounts)
    .set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiry: tokens.expiresAt,
    })
    .where(eq(socialMediaAccounts.id, accountId));
}

/**
 * Delete social media account
 */
export async function deleteSocialMediaAccount(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  await db.delete(socialMediaAccounts).where(eq(socialMediaAccounts.id, accountId));
}
