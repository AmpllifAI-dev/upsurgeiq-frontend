// Feature and Add-on content for modal explanations

export interface FeatureContent {
  title: string;
  description: string;
  benefits: string[];
  useCases?: string[];
}

export interface AddOnContent {
  title: string;
  description: string;
  benefits: string[];
  pricing: string;
  ctaText: string;
  ctaLink: string;
}

export const featureContent: Record<string, FeatureContent> = {
  "campaigns": {
    title: "AI-Drafted Campaigns",
    description: "Each campaign includes a professionally written press release with your own uploaded imagery, automatically distributed to your chosen media lists and social platforms.",
    benefits: [
      "AI generates professional press release copy in seconds",
      "Upload your own images to accompany the press release",
      "Automatic distribution to journalist media lists",
      "Simultaneous posting to all connected social media platforms",
      "SEO-optimized content for maximum reach",
      "Edit and refine before publishing"
    ],
    useCases: [
      "Product launches and announcements",
      "Company news and milestones",
      "Event promotions",
      "Thought leadership content"
    ]
  },
  "social_platforms": {
    title: "4 Social Media Platforms",
    description: "Connect and publish to Facebook, Instagram, LinkedIn, and X (Twitter) from a single dashboard.",
    benefits: [
      "One-click publishing to multiple platforms",
      "Platform-specific formatting and optimization",
      "Unified content calendar",
      "Cross-platform analytics",
      "Schedule posts in advance",
      "Maintain consistent brand presence"
    ]
  },
  "unlimited_posts": {
    title: "Unlimited User-Composed Social Posts",
    description: "Create and publish as many social media posts as you want with your own copy and images - no limits.",
    benefits: [
      "No monthly post limits",
      "Write your own copy or use AI assistance",
      "Upload your own images",
      "Schedule posts for optimal timing",
      "Track engagement across platforms",
      "Perfect for daily social media management"
    ],
    useCases: [
      "Daily social media updates",
      "Behind-the-scenes content",
      "Customer testimonials",
      "Quick announcements and updates"
    ]
  },
  "media_lists": {
    title: "Journalist Media Lists",
    description: "Curated lists of journalists and media contacts in your industry for targeted press release distribution.",
    benefits: [
      "Pre-vetted journalist contacts",
      "Industry-specific targeting",
      "Automatic email distribution",
      "Track open and engagement rates",
      "Build relationships with key media",
      "Expand lists as you grow"
    ]
  },
  "campaign_lab": {
    title: "Intelligent Campaign Lab",
    description: "Test multiple campaign variations and automatically deploy the winning version based on real performance data.",
    benefits: [
      "A/B test different headlines and copy",
      "AI analyzes performance metrics",
      "Automatically promotes best-performing version",
      "Optimize for clicks, engagement, or conversions",
      "Learn what resonates with your audience",
      "Continuous improvement over time"
    ],
    useCases: [
      "Optimize product launch messaging",
      "Test different value propositions",
      "Refine audience targeting",
      "Maximize campaign ROI"
    ]
  },
  "support": {
    title: "Customer Support",
    description: "Get help when you need it with our dedicated support team.",
    benefits: [
      "Email support: Response within 24 hours",
      "Priority support: Response within 4 hours",
      "Help with platform setup and onboarding",
      "Content strategy guidance",
      "Technical troubleshooting",
      "Best practices and tips"
    ]
  }
};

export const addOnContent: Record<string, AddOnContent> = {
  "ai_chat": {
    title: "AI Chat Educational Tool",
    description: "Refine your content through natural conversation with our AI assistant. Perfect for brainstorming, editing, and improving your messaging.",
    benefits: [
      "32 AI chat messages per month",
      "Conversational content refinement",
      "Brainstorm campaign ideas",
      "Get instant feedback on copy",
      "Improve headlines and messaging",
      "Learn best practices through dialogue"
    ],
    pricing: "£39/month",
    ctaText: "Add AI Chat",
    ctaLink: "/dashboard/ai-addons"
  },
  "ai_callin": {
    title: "AI Call-in Virtual Assistant",
    description: "Call in to draft content on the go. Speak your ideas and our AI transcribes and structures them into professional content.",
    benefits: [
      "32 AI call-in messages per month",
      "Draft content while driving or commuting",
      "Voice-to-text transcription",
      "AI structures your spoken ideas",
      "Perfect for busy executives",
      "Capture inspiration anytime, anywhere"
    ],
    pricing: "£59/month",
    ctaText: "Add AI Call-in",
    ctaLink: "/dashboard/ai-addons"
  },
  "image_packs": {
    title: "AI Generated Image Packs",
    description: "Professional AI-generated images for your campaigns and social posts. No stock photo fees, no copyright concerns.",
    benefits: [
      "Custom images generated from text descriptions",
      "Professional quality output",
      "No licensing or copyright issues",
      "Perfect for unique brand imagery",
      "Multiple style options",
      "Fast generation (seconds)"
    ],
    pricing: "£3.99 - £24.99",
    ctaText: "Buy Image Credits",
    ctaLink: "/dashboard/image-packs"
  }
};
