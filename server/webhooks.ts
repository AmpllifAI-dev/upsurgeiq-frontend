/**
 * Webhook Integration Module
 * Sends user registration and onboarding data to Make.com for Airtable sync
 */

// Webhook integration module - no external dependencies needed

/**
 * Webhook event types
 */
export type WebhookEventType = "user.registered" | "user.onboarded";

/**
 * User registration webhook payload
 */
export interface UserRegisteredPayload {
  event: "user.registered";
  timestamp: string;
  user: {
    id: number;
    email: string;
    name: string | null;
    createdAt: string;
  };
}

/**
 * User onboarding webhook payload
 */
export interface UserOnboardedPayload {
  event: "user.onboarded";
  timestamp: string;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  business: {
    id: number;
    companyName: string;
    website: string | null;
    industry: string | null;
    sicCode: string | null;
    sicDescription: string | null;
    employeeCount: string | null;
    targetAudience: string | null;
    uniqueSellingPoints: string | null;
    brandVoice: string | null;
    toneStyle: string | null;
    keyMessages: string | null;
    competitorInfo: string | null;
    imageStyle: string | null;
    colorPreferences: string | null;
    logoUrl: string | null;
    createdAt: string;
  };
  subscription: {
    tier: string;
    status: string;
    startDate: string | null;
  } | null;
}

/**
 * Webhook delivery result
 */
export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  deliveredAt: string;
}

/**
 * Send webhook to Make.com endpoint
 */
export async function sendWebhook(
  webhookUrl: string,
  payload: UserRegisteredPayload | UserOnboardedPayload
): Promise<WebhookDeliveryResult> {
  const deliveredAt = new Date().toISOString();

  try {
    // Validate webhook URL
    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      throw new Error("Invalid webhook URL");
    }

    // Send POST request to Make.com webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "UpsurgeIQ-Webhook/1.0",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook delivery failed with status ${response.status}`);
    }

    return {
      success: true,
      statusCode: response.status,
      deliveredAt,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Log webhook delivery failure
    console.error("[WebhookDelivery] Failed to deliver webhook", {
      event: payload.event,
      userId: payload.user.id,
      error: errorMessage,
      timestamp: deliveredAt,
    });

    return {
      success: false,
      error: errorMessage,
      deliveredAt,
    };
  }
}

/**
 * Send webhook with retry logic
 */
export async function sendWebhookWithRetry(
  webhookUrl: string,
  payload: UserRegisteredPayload | UserOnboardedPayload,
  maxRetries: number = 3
): Promise<WebhookDeliveryResult> {
  let lastResult: WebhookDeliveryResult | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    lastResult = await sendWebhook(webhookUrl, payload);

    if (lastResult.success) {
      return lastResult;
    }

    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return lastResult!;
}

/**
 * Build user registered webhook payload
 */
export function buildUserRegisteredPayload(user: {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
}): UserRegisteredPayload {
  return {
    event: "user.registered",
    timestamp: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    },
  };
}

/**
 * Build user onboarded webhook payload
 */
export function buildUserOnboardedPayload(data: {
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  business: {
    id: number;
    companyName: string;
    website: string | null;
    industry: string | null;
    sicCode: string | null;
    sicDescription: string | null;
    employeeCount: string | null;
    targetAudience: string | null;
    uniqueSellingPoints: string | null;
    brandVoice: string | null;
    toneStyle: string | null;
    keyMessages: string | null;
    competitorInfo: string | null;
    imageStyle: string | null;
    colorPreferences: string | null;
    logoUrl: string | null;
    createdAt: Date;
  };
  subscription: {
    tier: string;
    status: string;
    startDate: Date | null;
  } | null;
}): UserOnboardedPayload {
  return {
    event: "user.onboarded",
    timestamp: new Date().toISOString(),
    user: data.user,
    business: {
      ...data.business,
      createdAt: data.business.createdAt.toISOString(),
    },
    subscription: data.subscription
      ? {
          ...data.subscription,
          startDate: data.subscription.startDate?.toISOString() || null,
        }
      : null,
  };
}
