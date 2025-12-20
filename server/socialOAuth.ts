/**
 * Social Media OAuth Configuration
 * 
 * This file contains OAuth configuration for social media platforms.
 * 
 * SETUP INSTRUCTIONS:
 * ===================
 * 
 * 1. Create developer apps for each platform:
 *    - Facebook: https://developers.facebook.com/apps/
 *    - Instagram: (uses Facebook app with Instagram permissions)
 *    - LinkedIn: https://www.linkedin.com/developers/apps/
 *    - X (Twitter): https://developer.x.com/en/portal/dashboard
 * 
 * 2. Configure OAuth redirect URLs in each platform:
 *    - Facebook: https://yourdomain.com/api/oauth/facebook/callback
 *    - Instagram: https://yourdomain.com/api/oauth/instagram/callback
 *    - LinkedIn: https://yourdomain.com/api/oauth/linkedin/callback
 *    - X: https://yourdomain.com/api/oauth/x/callback
 * 
 * 3. Request appropriate permissions/scopes:
 *    - Facebook: pages_manage_posts, pages_read_engagement, publish_to_groups
 *    - Instagram: instagram_basic, instagram_content_publish
 *    - LinkedIn: w_member_social, r_basicprofile
 *    - X: tweet.read, tweet.write, users.read
 * 
 * 4. Add your credentials to environment variables (DO NOT commit to git):
 *    - FACEBOOK_CLIENT_ID
 *    - FACEBOOK_CLIENT_SECRET
 *    - INSTAGRAM_CLIENT_ID (same as Facebook)
 *    - INSTAGRAM_CLIENT_SECRET (same as Facebook)
 *    - LINKEDIN_CLIENT_ID
 *    - LINKEDIN_CLIENT_SECRET
 *    - X_CLIENT_ID
 *    - X_CLIENT_SECRET
 */

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scopes: string[];
}

export const OAUTH_CONFIGS: Record<string, OAuthConfig> = {
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID || "YOUR_FACEBOOK_CLIENT_ID",
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "YOUR_FACEBOOK_CLIENT_SECRET",
    authorizationUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    redirectUri: `${process.env.FRONTEND_URL}/api/oauth/facebook/callback`,
    scopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
  },
  instagram: {
    clientId: process.env.FACEBOOK_CLIENT_ID || "YOUR_FACEBOOK_CLIENT_ID",
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "YOUR_FACEBOOK_CLIENT_SECRET",
    authorizationUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    redirectUri: `${process.env.FRONTEND_URL}/api/oauth/instagram/callback`,
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list", "pages_read_engagement", "business_management"],
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || "YOUR_LINKEDIN_CLIENT_ID",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "YOUR_LINKEDIN_CLIENT_SECRET",
    authorizationUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    redirectUri: `${process.env.FRONTEND_URL}/api/oauth/linkedin/callback`,
    scopes: ["w_member_social", "profile", "openid"],
  },
  x: {
    clientId: process.env.X_CLIENT_ID || "YOUR_X_CLIENT_ID",
    clientSecret: process.env.X_CLIENT_SECRET || "YOUR_X_CLIENT_SECRET",
    authorizationUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    redirectUri: `${process.env.FRONTEND_URL}/api/oauth/x/callback`,
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  },
};

/**
 * Generate OAuth authorization URL for a platform
 */
export function getAuthorizationUrl(platform: string, state: string): string {
  const config = OAUTH_CONFIGS[platform];
  if (!config) {
    throw new Error(`Unknown OAuth platform: ${platform}`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
  });

  return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  platform: string,
  code: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
  const config = OAUTH_CONFIGS[platform];
  if (!config) {
    throw new Error(`Unknown OAuth platform: ${platform}`);
  }

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(
  platform: string,
  refreshToken: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
  const config = OAUTH_CONFIGS[platform];
  if (!config) {
    throw new Error(`Unknown OAuth platform: ${platform}`);
  }

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in,
  };
}
