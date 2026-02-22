import { useEffect } from "react";

export function useDocumentMeta({
  title,
  description,
}: {
  title: string;
  description: string;
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

    // Cleanup function to restore originals when component unmounts
    return () => {
      document.title = originalTitle;
      if (descElem) descElem.setAttribute("content", originalDesc);
      if (ogTitleElem) ogTitleElem.setAttribute("content", originalOgTitle);
      if (ogDescElem) ogDescElem.setAttribute("content", originalOgDesc);
    };
  }, [title, description]);
}
