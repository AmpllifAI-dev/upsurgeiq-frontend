import axios from "axios";

/**
 * WordPress REST API Integration
 * 
 * This module provides functions to interact with WordPress REST API
 * for managing business profiles, press releases, and preset prompts
 * using ACF Pro custom fields.
 */

export interface WordPressConfig {
  siteUrl: string;
  username: string;
  applicationPassword: string;
}

export interface BusinessProfile {
  title: string;
  content: string;
  acf: {
    company_name: string;
    industry: string;
    sic_code?: string;
    website_url?: string;
    brand_voice?: string;
    brand_tone?: string;
    target_audience?: string;
    key_messages?: string;
  };
}

export interface PressReleasePost {
  title: string;
  content: string;
  status: "publish" | "draft" | "pending";
  acf: {
    headline: string;
    subheadline?: string;
    body_content: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    release_date?: string;
    media_contact?: string;
  };
}

export interface PresetPrompt {
  title: string;
  content: string;
  acf: {
    prompt_category: string;
    prompt_text: string;
    target_industry?: string;
    use_case?: string;
  };
}

/**
 * Create WordPress API client
 */
export function createWordPressClient(config: WordPressConfig) {
  const auth = Buffer.from(`${config.username}:${config.applicationPassword}`).toString("base64");

  const client = axios.create({
    baseURL: `${config.siteUrl}/wp-json/wp/v2`,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });

  return {
    /**
     * Create or update a business profile post
     */
    async upsertBusinessProfile(profile: BusinessProfile, postId?: number) {
      const endpoint = postId ? `/posts/${postId}` : "/posts";
      const method = postId ? "put" : "post";

      const response = await client[method](endpoint, {
        title: profile.title,
        content: profile.content,
        status: "publish",
        meta: profile.acf,
      });

      return response.data;
    },

    /**
     * Create a press release post
     */
    async createPressRelease(pressRelease: PressReleasePost) {
      const response = await client.post("/posts", {
        title: pressRelease.title,
        content: pressRelease.content,
        status: pressRelease.status,
        meta: pressRelease.acf,
      });

      return response.data;
    },

    /**
     * Update a press release post
     */
    async updatePressRelease(postId: number, pressRelease: Partial<PressReleasePost>) {
      const response = await client.put(`/posts/${postId}`, {
        title: pressRelease.title,
        content: pressRelease.content,
        status: pressRelease.status,
        meta: pressRelease.acf,
      });

      return response.data;
    },

    /**
     * Get a post by ID
     */
    async getPost(postId: number) {
      const response = await client.get(`/posts/${postId}`);
      return response.data;
    },

    /**
     * Delete a post
     */
    async deletePost(postId: number) {
      const response = await client.delete(`/posts/${postId}`);
      return response.data;
    },

    /**
     * Create a preset prompt post
     */
    async createPresetPrompt(prompt: PresetPrompt) {
      const response = await client.post("/posts", {
        title: prompt.title,
        content: prompt.content,
        status: "publish",
        meta: prompt.acf,
      });

      return response.data;
    },

    /**
     * Get all posts with optional filters
     */
    async getPosts(params?: {
      per_page?: number;
      page?: number;
      search?: string;
      status?: string;
    }) {
      const response = await client.get("/posts", { params });
      return response.data;
    },
  };
}

/**
 * Sync business dossier to WordPress
 */
export async function syncBusinessToWordPress(
  config: WordPressConfig,
  business: {
    name: string;
    industry: string;
    sicCode?: string;
    websiteUrl?: string;
    brandVoice?: string;
    brandTone?: string;
    targetAudience?: string;
    keyMessages?: string;
  },
  wordpressPostId?: number
) {
  const client = createWordPressClient(config);

  const profile: BusinessProfile = {
    title: business.name,
    content: `Business profile for ${business.name}`,
    acf: {
      company_name: business.name,
      industry: business.industry,
      sic_code: business.sicCode,
      website_url: business.websiteUrl,
      brand_voice: business.brandVoice,
      brand_tone: business.brandTone,
      target_audience: business.targetAudience,
      key_messages: business.keyMessages,
    },
  };

  return await client.upsertBusinessProfile(profile, wordpressPostId);
}

/**
 * Sync press release to WordPress
 */
export async function syncPressReleaseToWordPress(
  config: WordPressConfig,
  pressRelease: {
    title: string;
    body: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  }
) {
  const client = createWordPressClient(config);

  const post: PressReleasePost = {
    title: pressRelease.title,
    content: pressRelease.body,
    status: "publish",
    acf: {
      headline: pressRelease.title,
      body_content: pressRelease.body,
      contact_name: pressRelease.contactName,
      contact_email: pressRelease.contactEmail,
      contact_phone: pressRelease.contactPhone,
      release_date: new Date().toISOString(),
    },
  };

  return await client.createPressRelease(post);
}
