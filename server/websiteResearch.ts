/**
 * AI-Powered Website Research & Analysis
 * 
 * Extracts and analyzes company information from websites to enhance press releases
 */

import { invokeLLM } from "./_core/llm";

export interface WebsiteResearchResult {
  url: string;
  companyName?: string;
  industry?: string;
  description?: string;
  products?: string[];
  recentNews?: string[];
  keyPeople?: Array<{ name: string; role: string }>;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  socialMedia?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
  competitors?: string[];
  keyMessages?: string[];
  brandTone?: string;
  targetAudience?: string;
  rawContent?: string;
}

/**
 * Research a website and extract structured company information
 */
export async function researchWebsite(url: string): Promise<WebsiteResearchResult> {
  // Fetch website content
  const content = await fetchWebsiteContent(url);
  
  if (!content) {
    throw new Error("Failed to fetch website content");
  }

  // Use AI to extract structured information
  const analysis = await analyzeWebsiteContent(url, content);
  
  return {
    url,
    ...analysis,
    rawContent: content.substring(0, 5000), // Store first 5000 chars for reference
  };
}

/**
 * Fetch website content using browser automation
 */
async function fetchWebsiteContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Extract text content from HTML (simple approach)
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return textContent.substring(0, 15000); // Limit to 15k chars for AI processing
  } catch (error) {
    console.error("Failed to fetch website:", error);
    return null;
  }
}

/**
 * Analyze website content using AI to extract structured information
 */
async function analyzeWebsiteContent(
  url: string,
  content: string
): Promise<Omit<WebsiteResearchResult, "url" | "rawContent">> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a professional business analyst specializing in company research. 
Extract structured information from website content to help create compelling press releases.
Focus on: company identity, products/services, recent news, key people, brand messaging, and competitive positioning.`,
      },
      {
        role: "user",
        content: `Analyze this website content and extract structured information:

URL: ${url}

Content:
${content}

Extract the following information in JSON format:
{
  "companyName": "string",
  "industry": "string",
  "description": "string (2-3 sentences)",
  "products": ["array of main products/services"],
  "recentNews": ["array of recent announcements or news"],
  "keyPeople": [{"name": "string", "role": "string"}],
  "contactInfo": {
    "email": "string or null",
    "phone": "string or null",
    "address": "string or null"
  },
  "socialMedia": {
    "twitter": "string or null",
    "linkedin": "string or null",
    "facebook": "string or null"
  },
  "competitors": ["array of mentioned competitors"],
  "keyMessages": ["array of main value propositions or messages"],
  "brandTone": "string (professional, casual, innovative, etc.)",
  "targetAudience": "string (who they serve)"
}

Only include information that is clearly stated or strongly implied. Use null for missing data.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "website_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            companyName: { type: ["string", "null"] },
            industry: { type: ["string", "null"] },
            description: { type: ["string", "null"] },
            products: {
              type: "array",
              items: { type: "string" },
            },
            recentNews: {
              type: "array",
              items: { type: "string" },
            },
            keyPeople: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  role: { type: "string" },
                },
                required: ["name", "role"],
                additionalProperties: false,
              },
            },
            contactInfo: {
              type: "object",
              properties: {
                email: { type: ["string", "null"] },
                phone: { type: ["string", "null"] },
                address: { type: ["string", "null"] },
              },
              required: [],
              additionalProperties: false,
            },
            socialMedia: {
              type: "object",
              properties: {
                twitter: { type: ["string", "null"] },
                linkedin: { type: ["string", "null"] },
                facebook: { type: ["string", "null"] },
              },
              required: [],
              additionalProperties: false,
            },
            competitors: {
              type: "array",
              items: { type: "string" },
            },
            keyMessages: {
              type: "array",
              items: { type: "string" },
            },
            brandTone: { type: ["string", "null"] },
            targetAudience: { type: ["string", "null"] },
          },
          required: [
            "products",
            "recentNews",
            "keyPeople",
            "contactInfo",
            "socialMedia",
            "competitors",
            "keyMessages",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const responseContent = response.choices[0]?.message?.content;
  const analysisText = typeof responseContent === "string" ? responseContent : "";
  
  if (!analysisText) {
    throw new Error("No analysis returned from AI");
  }

  const analysis = JSON.parse(analysisText);
  
  return {
    companyName: analysis.companyName || undefined,
    industry: analysis.industry || undefined,
    description: analysis.description || undefined,
    products: analysis.products || [],
    recentNews: analysis.recentNews || [],
    keyPeople: analysis.keyPeople || [],
    contactInfo: analysis.contactInfo || {},
    socialMedia: analysis.socialMedia || {},
    competitors: analysis.competitors || [],
    keyMessages: analysis.keyMessages || [],
    brandTone: analysis.brandTone || undefined,
    targetAudience: analysis.targetAudience || undefined,
  };
}

/**
 * Generate press release suggestions based on website research
 */
export async function generatePressReleaseSuggestions(
  research: WebsiteResearchResult
): Promise<string[]> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a PR expert. Generate compelling press release angle suggestions based on company research.",
      },
      {
        role: "user",
        content: `Based on this company research, suggest 5 compelling press release angles:

Company: ${research.companyName || "Unknown"}
Industry: ${research.industry || "Unknown"}
Description: ${research.description || "N/A"}
Products: ${research.products?.join(", ") || "N/A"}
Recent News: ${research.recentNews?.join(", ") || "N/A"}
Key Messages: ${research.keyMessages?.join(", ") || "N/A"}

Provide 5 specific, newsworthy press release angles that would interest journalists.`,
      },
    ],
  });

  const responseContent = response.choices[0]?.message?.content;
  const suggestions = typeof responseContent === "string" ? responseContent : "";
  
  // Parse suggestions (assuming they're numbered or bulleted)
  return suggestions
    .split("\n")
    .filter((line: string) => line.match(/^[\d\-\*•]/))
    .map((line: string) => line.replace(/^[\d\-\*•\.\)]\s*/, "").trim())
    .filter((line: string) => line.length > 0)
    .slice(0, 5);
}
