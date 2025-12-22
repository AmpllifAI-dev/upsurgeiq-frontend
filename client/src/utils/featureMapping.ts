// Map feature text to modal content keys

export function getFeatureKey(featureText: string): string | null {
  const text = featureText.toLowerCase();
  
  if (text.includes("campaign")) return "campaigns";
  if (text.includes("social media platforms") || text.includes("4 social")) return "social_platforms";
  if (text.includes("unlimited") && text.includes("social posts")) return "unlimited_posts";
  if (text.includes("media list")) return "media_lists";
  if (text.includes("campaign lab") || text.includes("intelligent campaign")) return "campaign_lab";
  if (text.includes("support")) return "support";
  
  return null;
}

export function getAddOnKey(addOnText: string): string | null {
  const text = addOnText.toLowerCase();
  
  if (text.includes("ai chat")) return "ai_chat";
  if (text.includes("ai call-in") || text.includes("call-in")) return "ai_callin";
  if (text.includes("image pack") || text.includes("image credit")) return "image_packs";
  
  return null;
}
