/**
 * Website Analysis Service
 * 
 * AI-powered website scraping and analysis to automatically populate business dossiers.
 * Extracts company information, brand voice, services, and competitive positioning.
 */

import { invokeLLM } from "./_core/llm";
import { logger } from "./_core/logger";

export interface WebsiteAnalysisResult {
  companyName?: string;
  industry?: string;
  businessDescription?: string;
  services?: string[];
  targetAudience?: string;
  uniqueSellingPoints?: string[];
  competitors?: string[];
  brandVoice?: string;
  brandTone?: string;
  keyMessages?: string[];
  employees?: Array<{ name: string; role: string; bio?: string }>;
  contactEmail?: string;
  contactPhone?: string;
}

/**
 * Analyze a website and extract business information using AI
 */
export async function analyzeWebsite(websiteUrl: string): Promise<WebsiteAnalysisResult> {
  try {
    logger.info("Starting website analysis", {
      component: "WebsiteAnalysis",
      action: "analyzeWebsite",
      metadata: { websiteUrl },
    });

    // Step 1: Fetch website content
    const response = await fetch(websiteUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; UpsurgeIQ/1.0; +https://upsurgeiq.com)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // Step 2: Use AI to analyze the website content
    const analysisPrompt = `You are a business intelligence analyst. Analyze the following website HTML and extract key business information.

Website URL: ${websiteUrl}

HTML Content (first 50000 characters):
${html.substring(0, 50000)}

Extract and return the following information in JSON format:
{
  "companyName": "Company name",
  "industry": "Industry or sector",
  "businessDescription": "Brief description of what the company does",
  "services": ["Service 1", "Service 2", "Service 3"],
  "targetAudience": "Who their customers are",
  "uniqueSellingPoints": ["USP 1", "USP 2", "USP 3"],
  "competitors": ["Competitor 1", "Competitor 2"] (if mentioned),
  "brandVoice": "professional/casual/technical/friendly",
  "brandTone": "authoritative/innovative/approachable/expert",
  "keyMessages": ["Key message 1", "Key message 2"],
  "employees": [{"name": "John Doe", "role": "CEO", "bio": "Brief bio"}] (if found),
  "contactEmail": "email@example.com" (if found),
  "contactPhone": "+1234567890" (if found)
}

Focus on extracting factual information from the website content. If a field cannot be determined, omit it or set it to null.`;

    const llmResponse = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a business intelligence analyst. Extract structured business information from website content and return valid JSON only.",
        },
        {
          role: "user",
          content: analysisPrompt,
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
              companyName: { type: "string" },
              industry: { type: "string" },
              businessDescription: { type: "string" },
              services: { type: "array", items: { type: "string" } },
              targetAudience: { type: "string" },
              uniqueSellingPoints: { type: "array", items: { type: "string" } },
              competitors: { type: "array", items: { type: "string" } },
              brandVoice: { type: "string" },
              brandTone: { type: "string" },
              keyMessages: { type: "array", items: { type: "string" } },
              employees: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    role: { type: "string" },
                    bio: { type: "string" },
                  },
                  required: ["name", "role"],
                  additionalProperties: false,
                },
              },
              contactEmail: { type: "string" },
              contactPhone: { type: "string" },
            },
            required: [],
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = llmResponse.choices[0].message.content;
    if (!messageContent || typeof messageContent !== 'string') {
      throw new Error("No analysis result from LLM");
    }

    const analysis: WebsiteAnalysisResult = JSON.parse(messageContent);

    logger.info("Website analysis completed", {
      component: "WebsiteAnalysis",
      action: "analyzeWebsite",
      metadata: {
        websiteUrl,
        companyName: analysis.companyName,
        industry: analysis.industry,
      },
    });

    return analysis;
  } catch (error) {
    logger.error("Website analysis failed", error as Error, {
      component: "WebsiteAnalysis",
      action: "analyzeWebsite",
      metadata: { websiteUrl },
    });
    throw error;
  }
}
