import { track } from "@vercel/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const isExtension =
  typeof window !== "undefined" &&
  (window.location.protocol === "chrome-extension:" ||
    window.location.protocol === "ms-browser-extension:");

const getEnv = (): Record<string, string | boolean | undefined> =>
  (
    import.meta as unknown as {
      env?: Record<string, string | boolean | undefined>;
    }
  )?.env || {};

/**
 * Initializes Google Analytics 4 (gtag.js) if a Measurement ID is provided
 * via environment variables (VITE_GA_MEASUREMENT_ID) or window configuration.
 * Automatically skips initialization in Chrome/Edge extensions to prevent CSP issues.
 */
export function initAnalytics(customId?: string): void {
  if (typeof window === "undefined" || isExtension) {
    return;
  }

  const env = getEnv();
  const gaId = customId || (env.VITE_GA_MEASUREMENT_ID as string | undefined);

  if (!gaId || gaId.trim() === "" || gaId === "G-XXXXXXXXXX") {
    if (env.DEV) {
      console.info(
        "[Analytics] No VITE_GA_MEASUREMENT_ID found. GA4 will run in mock/log mode.",
      );
    }
    return;
  }

  // Avoid injecting script multiple times
  if (
    document.getElementById("ga-gtag-script") ||
    document.querySelector('script[src*="googletagmanager.com/gtag/js"]')
  ) {
    return;
  }

  try {
    const script = document.createElement("script");
    script.id = "ga-gtag-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    }
    window.gtag = gtag;

    gtag("js", new Date());
    // We send manual pageviews via React Router on route change
    gtag("config", gaId, {
      send_page_view: false,
    });

    if (getEnv().DEV) {
      console.info(`[Analytics] Google Analytics 4 initialized with ${gaId}`);
    }
  } catch (err) {
    console.warn("[Analytics] Failed to initialize Google Analytics:", err);
  }
}

/**
 * Sends a page_view event to GA4 and Vercel Analytics.
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (typeof window === "undefined" || isExtension) {
    return;
  }

  if (getEnv().DEV) {
    console.debug(`[Analytics] PageView: ${pagePath} (${pageTitle || ""})`);
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      page_location: window.location.href,
    });
  }
}

/**
 * Sends a custom event to Google Analytics (gtag) and Vercel Analytics (track).
 * Safe to call anywhere; fails silently if analytics is not available.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined" || isExtension) {
    return;
  }

  if (getEnv().DEV) {
    console.debug(`[Analytics] Event: "${eventName}"`, params);
  }

  // 1. Google Analytics
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", eventName, params);
    } catch (e) {
      // Ignore GA errors
    }
  }

  // 2. Vercel Analytics
  try {
    track(
      eventName,
      params as Record<string, string | number | boolean | null>,
    );
  } catch (e) {
    // Ignore Vercel errors in non-Vercel environments
  }
}

/**
 * Helper to record user click interactions specifically.
 */
export function trackClick(
  actionName: string,
  category: string,
  metadata?: Record<string, unknown>,
): void {
  trackEvent(actionName, {
    event_category: category,
    ...metadata,
  });
}
