import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

// Generate or retrieve session ID from localStorage
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  
  let sessionId = localStorage.getItem("analytics_session_id");
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("analytics_session_id", sessionId);
  }
  
  return sessionId;
}

/**
 * Hook to track page views automatically
 */
export function usePageTracking() {
  const trackEvent = trpc.leadBehaviour.trackEvent.useMutation();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    const sessionId = getSessionId();
    
    trackEvent.mutate({
      sessionId,
      eventType: "page_view",
      pageUrl: window.location.href,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
    });
  }, []);
}

/**
 * Hook to track custom events
 */
export function useEventTracking() {
  const trackEvent = trpc.leadBehaviour.trackEvent.useMutation();

  const track = (
    eventType: "resource_download" | "blog_read" | "case_study_view" | "cta_click" | "video_play" | "external_link_click",
    eventData?: Record<string, any>
  ) => {
    const sessionId = getSessionId();
    
    trackEvent.mutate({
      sessionId,
      eventType,
      eventData,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    });
  };

  return { track };
}

/**
 * Track resource downloads
 */
export function trackDownload(resourceName: string, resourceUrl: string) {
  const sessionId = getSessionId();
  
  // Use fetch to avoid blocking the download
  fetch("/api/trpc/analytics.trackEvent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      eventType: "resource_download",
      eventData: {
        resourceName,
        resourceUrl,
      },
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    }),
  }).catch(() => {
    // Silently fail to not disrupt user experience
  });
}

/**
 * Track blog post reads (call when user scrolls past 50% of content)
 */
export function trackBlogRead(blogTitle: string, blogUrl: string) {
  const sessionId = getSessionId();
  
  fetch("/api/trpc/analytics.trackEvent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      eventType: "blog_read",
      eventData: {
        blogTitle,
        blogUrl,
      },
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    }),
  }).catch(() => {});
}

/**
 * Track case study views
 */
export function trackCaseStudyView(caseStudyTitle: string) {
  const sessionId = getSessionId();
  
  fetch("/api/trpc/analytics.trackEvent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      eventType: "case_study_view",
      eventData: {
        caseStudyTitle,
      },
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    }),
  }).catch(() => {});
}
