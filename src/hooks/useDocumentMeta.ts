import { useEffect } from "react";

export function useDocumentMeta({
  title,
  description,
  schema,
}: {
  title: string;
  description: string;
  schema?: Record<string, any>;
}) {
  useEffect(() => {
    // Save original values
    const originalTitle = document.title;
    const ogTitleElem = document.querySelector('meta[property="og:title"]');
    const originalOgTitle = ogTitleElem?.getAttribute("content") || "";

    const descElem = document.querySelector('meta[name="description"]');
    const originalDesc = descElem?.getAttribute("content") || "";

    const ogDescElem = document.querySelector(
      'meta[property="og:description"]',
    );
    const originalOgDesc = ogDescElem?.getAttribute("content") || "";

    const canonicalElem = document.querySelector('link[rel="canonical"]');
    const originalCanonical = canonicalElem?.getAttribute("href") || "";

    // Set new values
    document.title = title;

    if (descElem) {
      descElem.setAttribute("content", description);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }

    if (ogTitleElem) ogTitleElem.setAttribute("content", title);
    if (ogDescElem) ogDescElem.setAttribute("content", description);

    // Dynamic Canonical
    if (canonicalElem) {
      const currentUrl = window.location.origin + window.location.pathname;
      canonicalElem.setAttribute("href", currentUrl);
    }

    // Optional dynamic JSON-LD injection
    const pageSchemaId = "page-custom-schema";
    let scriptTag: HTMLScriptElement | null = null;
    if (schema) {
      scriptTag = document.getElementById(
        pageSchemaId,
      ) as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = pageSchemaId;
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    }

    // Cleanup function to restore originals when component unmounts
    return () => {
      document.title = originalTitle;
      if (descElem) descElem.setAttribute("content", originalDesc);
      if (ogTitleElem) ogTitleElem.setAttribute("content", originalOgTitle);
      if (ogDescElem) ogDescElem.setAttribute("content", originalOgDesc);
      if (canonicalElem) canonicalElem.setAttribute("href", originalCanonical);
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [title, description, schema]);
}
