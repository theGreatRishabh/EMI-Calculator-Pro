import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useDocumentMeta } from "./useDocumentMeta";

describe("useDocumentMeta Hook", () => {
  let originalTitle: string;
  let metaDesc: HTMLMetaElement | null;
  let ogTitle: HTMLMetaElement | null;
  let ogDesc: HTMLMetaElement | null;
  let canonical: HTMLLinkElement | null;

  beforeEach(() => {
    // Setup initial DOM elements for testing
    originalTitle = document.title;

    // Create elements if they don't exist
    metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      metaDesc.content = "Original Description";
      document.head.appendChild(metaDesc);
    }

    ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      ogTitle.content = "Original OG Title";
      document.head.appendChild(ogTitle);
    }

    ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      ogDesc.content = "Original OG Description";
      document.head.appendChild(ogDesc);
    }

    canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      canonical.href = "https://example.com/original";
      document.head.appendChild(canonical);
    }
  });

  afterEach(() => {
    // Clean up added elements
    if (metaDesc && metaDesc.parentNode)
      metaDesc.parentNode.removeChild(metaDesc);
    if (ogTitle && ogTitle.parentNode) ogTitle.parentNode.removeChild(ogTitle);
    if (ogDesc && ogDesc.parentNode) ogDesc.parentNode.removeChild(ogDesc);
    if (canonical && canonical.parentNode)
      canonical.parentNode.removeChild(canonical);
    document.title = originalTitle;
  });

  it("updates document metadata on mount", () => {
    const { unmount } = renderHook(() =>
      useDocumentMeta({
        title: "Test Title",
        description: "Test Description",
      }),
    );

    expect(document.title).toBe("Test Title");
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content"),
    ).toBe("Test Description");
    expect(
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content"),
    ).toBe("Test Title");
    expect(
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content"),
    ).toBe("Test Description");

    // Should update canonical URL dynamically
    const expectedCanonicalUrl =
      window.location.origin + window.location.pathname;
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe(expectedCanonicalUrl);

    // Unmount and check if values are restored
    unmount();

    expect(document.title).toBe(originalTitle);
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content"),
    ).toBe("Original Description");
    expect(
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content"),
    ).toBe("Original OG Title");
    expect(
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content"),
    ).toBe("Original OG Description");
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe("https://example.com/original");
  });

  it("creates description element if it does not exist", () => {
    // Remove description element
    if (metaDesc && metaDesc.parentNode)
      metaDesc.parentNode.removeChild(metaDesc);
    metaDesc = null;

    const { unmount } = renderHook(() =>
      useDocumentMeta({
        title: "Another Test Title",
        description: "Another Test Description",
      }),
    );

    const createdDesc = document.querySelector('meta[name="description"]');
    expect(createdDesc).not.toBeNull();
    expect(createdDesc?.getAttribute("content")).toBe(
      "Another Test Description",
    );

    unmount();
  });
});
