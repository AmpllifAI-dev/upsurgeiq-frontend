/**
 * Press Release Image Generation
 * 
 * Generates AI-powered images for press releases using the built-in image generation API
 */

import { generateImage } from "./_core/imageGeneration";
import { invokeLLM } from "./_core/llm";

export interface ImageGenerationOptions {
  pressReleaseTitle: string;
  pressReleaseContent: string;
  businessName?: string;
  industry?: string;
  style?: "photorealistic" | "illustration" | "abstract" | "corporate" | "modern";
  mood?: "professional" | "energetic" | "calm" | "innovative" | "trustworthy";
}

/**
 * Generate an image prompt from press release content using AI
 */
async function generateImagePrompt(options: ImageGenerationOptions): Promise<string> {
  const { pressReleaseTitle, pressReleaseContent, businessName, industry, style = "photorealistic", mood = "professional" } = options;

  const systemPrompt = `You are an expert at creating image generation prompts for press releases. 
Your task is to analyze press release content and create a detailed, vivid image prompt that captures the essence of the announcement.

Guidelines:
- Focus on visual elements, not text
- Be specific about composition, lighting, colors, and mood
- Avoid including any text or words in the image
- Match the ${style} style and ${mood} mood
- Keep prompts under 200 words
- Make it suitable for ${industry || "business"} context`;

  const userPrompt = `Create an image generation prompt for this press release:

Title: ${pressReleaseTitle}

Content excerpt:
${pressReleaseContent.substring(0, 500)}...

${businessName ? `Business: ${businessName}` : ""}
${industry ? `Industry: ${industry}` : ""}

Generate a detailed image prompt that visually represents this announcement.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Failed to generate image prompt");
  }
  return content;
}

/**
 * Generate an image for a press release
 */
export async function generatePressReleaseImage(
  options: ImageGenerationOptions
): Promise<{ url: string; prompt: string }> {
  // Generate the image prompt using AI
  const prompt = await generateImagePrompt(options);

  // Generate the image
  const result = await generateImage({ prompt });
  if (!result.url) {
    throw new Error("Failed to generate image");
  }

  return {
    url: result.url,
    prompt,
  };
}

/**
 * Regenerate an image with a custom prompt
 */
export async function regenerateImage(
  customPrompt: string
): Promise<{ url: string }> {
  const result = await generateImage({ prompt: customPrompt });
  if (!result.url) {
    throw new Error("Failed to generate image");
  }
  return { url: result.url };
}

/**
 * Get style presets for image generation
 */
export function getImageStylePresets() {
  return {
    styles: [
      { value: "photorealistic", label: "Photorealistic", description: "Professional photography style with realistic lighting and details" },
      { value: "illustration", label: "Illustration", description: "Clean, modern illustration style perfect for tech and innovation" },
      { value: "abstract", label: "Abstract", description: "Abstract and conceptual visuals for creative announcements" },
      { value: "corporate", label: "Corporate", description: "Professional business aesthetic with clean, polished look" },
      { value: "modern", label: "Modern", description: "Contemporary and sleek visual style" },
    ],
    moods: [
      { value: "professional", label: "Professional", description: "Serious, credible, and trustworthy" },
      { value: "energetic", label: "Energetic", description: "Dynamic, exciting, and vibrant" },
      { value: "calm", label: "Calm", description: "Peaceful, serene, and reassuring" },
      { value: "innovative", label: "Innovative", description: "Cutting-edge, futuristic, and forward-thinking" },
      { value: "trustworthy", label: "Trustworthy", description: "Reliable, stable, and dependable" },
    ],
  };
}
