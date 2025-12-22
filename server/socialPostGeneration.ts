import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";

export interface PlatformPost {
  platform: "facebook" | "instagram" | "linkedin";
  content: string;
  imageUrl?: string;
  hashtags?: string[];
}

interface GenerateSocialPostsInput {
  pressReleaseTitle: string;
  pressReleaseContent: string;
  pressReleaseImageUrl?: string;
  brandVoice?: string;
  targetAudience?: string;
  companyName?: string;
}

/**
 * Generate platform-specific social media posts from a press release
 */
export async function generateSocialPostsFromPressRelease(
  input: GenerateSocialPostsInput
): Promise<PlatformPost[]> {
  const {
    pressReleaseTitle,
    pressReleaseContent,
    pressReleaseImageUrl,
    brandVoice = "professional",
    targetAudience = "general audience",
    companyName = "our company",
  } = input;

  // Extract key points from press release (first 500 chars for context)
  const pressReleaseExcerpt = pressReleaseContent.substring(0, 500);

  const posts: PlatformPost[] = [];

  // Generate Facebook post (longer format, engaging, emojis)
  const facebookPrompt = `You are a social media expert creating a Facebook post from a press release.

Press Release Title: ${pressReleaseTitle}
Press Release Excerpt: ${pressReleaseExcerpt}
Brand Voice: ${brandVoice}
Target Audience: ${targetAudience}
Company: ${companyName}

Create an engaging Facebook post that:
- Is 150-300 words (Facebook allows longer posts)
- Uses a conversational, engaging tone with appropriate emojis
- Highlights the key announcement or news
- Includes a call-to-action
- Uses 2-3 relevant hashtags at the end
- Captures attention in the first line

Return ONLY the post content, no explanations or meta-commentary.`;

  const facebookResponse = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert social media content creator." },
      { role: "user", content: facebookPrompt },
    ],
  });

  const facebookContentRaw = facebookResponse.choices[0]?.message?.content;
  const facebookContent = typeof facebookContentRaw === 'string' ? facebookContentRaw : "";

  posts.push({
    platform: "facebook",
    content: facebookContent,
    imageUrl: pressReleaseImageUrl || undefined,
  });

  // Generate Instagram post (visual focus, hashtags, shorter)
  const instagramPrompt = `You are a social media expert creating an Instagram post from a press release.

Press Release Title: ${pressReleaseTitle}
Press Release Excerpt: ${pressReleaseExcerpt}
Brand Voice: ${brandVoice}
Target Audience: ${targetAudience}
Company: ${companyName}

Create an Instagram post that:
- Is 125-150 words (Instagram caption limit considerations)
- Uses short paragraphs or line breaks for readability
- Includes relevant emojis to enhance visual appeal
- Has a strong opening hook
- Includes 5-10 relevant hashtags at the end
- Focuses on visual storytelling

Return ONLY the post content, no explanations or meta-commentary.`;

  const instagramResponse = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert social media content creator." },
      { role: "user", content: instagramPrompt },
    ],
  });

  const instagramContentRaw = instagramResponse.choices[0]?.message?.content;
  const instagramContent = typeof instagramContentRaw === 'string' ? instagramContentRaw : "";

  posts.push({
    platform: "instagram",
    content: instagramContent,
    imageUrl: pressReleaseImageUrl || undefined,
  });

  // Generate LinkedIn post (professional tone, industry keywords)
  const linkedinPrompt = `You are a social media expert creating a LinkedIn post from a press release.

Press Release Title: ${pressReleaseTitle}
Press Release Excerpt: ${pressReleaseExcerpt}
Brand Voice: ${brandVoice}
Target Audience: ${targetAudience}
Company: ${companyName}

Create a professional LinkedIn post that:
- Is 150-250 words
- Uses a professional, authoritative tone
- Highlights business impact and industry relevance
- Includes industry-specific keywords
- Has a clear call-to-action
- Uses 3-5 professional hashtags at the end
- Focuses on thought leadership and credibility

Return ONLY the post content, no explanations or meta-commentary.`;

  const linkedinResponse = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert social media content creator." },
      { role: "user", content: linkedinPrompt },
    ],
  });

  const linkedinContentRaw = linkedinResponse.choices[0]?.message?.content;
  const linkedinContent = typeof linkedinContentRaw === 'string' ? linkedinContentRaw : "";

  posts.push({
    platform: "linkedin",
    content: linkedinContent,
    imageUrl: pressReleaseImageUrl || undefined,
  });

  return posts;
}

/**
 * Generate platform-optimized images for social media posts
 */
export async function generateSocialMediaImages(
  pressReleaseTitle: string,
  platform: "facebook" | "instagram" | "linkedin"
): Promise<string | undefined> {
  const platformSpecs = {
    facebook: "1200x630px Facebook post image",
    instagram: "1080x1080px Instagram square post",
    linkedin: "1200x627px LinkedIn post image",
  };

  const prompt = `Create a professional ${platformSpecs[platform]} for a press release titled "${pressReleaseTitle}". 
  Make it eye-catching, modern, and suitable for ${platform}. 
  Include relevant imagery and typography that conveys the message clearly.`;

  const result = await generateImage({ prompt });
  return result.url;
}
