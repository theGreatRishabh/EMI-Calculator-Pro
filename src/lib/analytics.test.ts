import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  initAnalytics,
  trackEvent,
  trackPageView,
  trackClick,
} from "./analytics";
import * as vercelAnalytics from "@vercel/analytics";

vi.mock("@vercel/analytics", () => ({
  track: vi.fn(),
}));

describe("Analytics Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).gtag;
    delete (window as any).dataLayer;
    const existing = document.getElementById("ga-gtag-script");
    if (existing) existing.remove();
  });

  afterEach(() => {
    const existing = document.getElementById("ga-gtag-script");
    if (existing) existing.remove();
  });

  it("skips initialization if no Measurement ID is provided", () => {
    initAnalytics("");
    expect(document.getElementById("ga-gtag-script")).toBeNull();
    expect(window.gtag).toBeUndefined();
  });

  it("initializes GA4 when a valid Measurement ID is passed", () => {
    initAnalytics("G-TEST123456");
    const script = document.getElementById(
      "ga-gtag-script",
    ) as HTMLScriptElement;
    expect(script).not.toBeNull();
    expect(script.src).toContain("id=G-TEST123456");
    expect(window.gtag).toBeDefined();
    expect(window.dataLayer).toBeDefined();
  });

  it("does not inject script twice if already initialized", () => {
    initAnalytics("G-TEST123456");
    const firstScript = document.getElementById("ga-gtag-script");
    initAnalytics("G-TEST123456");
    const scripts = document.querySelectorAll("#ga-gtag-script");
    expect(scripts.length).toBe(1);
    expect(scripts[0]).toBe(firstScript);
  });

  it("trackEvent calls window.gtag and vercel track", () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    trackEvent("test_event", { loan_type: "HOME", amount: 5000000 });

    expect(mockGtag).toHaveBeenCalledWith("event", "test_event", {
      loan_type: "HOME",
      amount: 5000000,
    });
    expect(vercelAnalytics.track).toHaveBeenCalledWith("test_event", {
      loan_type: "HOME",
      amount: 5000000,
    });
  });

  it("trackPageView sends page_view event to gtag", () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    trackPageView("/home-loan", "Home Loan EMI Calculator");

    expect(mockGtag).toHaveBeenCalledWith("event", "page_view", {
      page_path: "/home-loan",
      page_title: "Home Loan EMI Calculator",
      page_location: window.location.href,
    });
  });

  it("trackClick delegates to trackEvent with event_category", () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    trackClick("click_export_pdf", "calculator_actions", {
      format: "pdf",
    });

    expect(mockGtag).toHaveBeenCalledWith("event", "click_export_pdf", {
      event_category: "calculator_actions",
      format: "pdf",
    });
    expect(vercelAnalytics.track).toHaveBeenCalledWith("click_export_pdf", {
      event_category: "calculator_actions",
      format: "pdf",
    });
  });
});
