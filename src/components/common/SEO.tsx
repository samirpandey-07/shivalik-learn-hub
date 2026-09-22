import { useEffect } from "react";
import { BASE_URL } from "@/lib/seo/schemaData";

export interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  noindex?: boolean;
  structuredData?: object | object[];
}

export function SEO({
  title,
  description,
  canonicalPath = "",
  ogType = "website",
  ogImage = `${BASE_URL}/og-image.png`,
  noindex = false,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    // 1. Update Document Title
    const formattedTitle = title.includes("Campus Flow")
      ? title
      : `${title} | Campus Flow`;
    document.title = formattedTitle;

    // 2. Helper to set or create meta tags
    const setMetaTag = (attrName: "name" | "property", attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 3. Helper to set or create link tags
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    // 4. Compute Canonical URL
    const cleanPath = canonicalPath.startsWith("/")
      ? canonicalPath
      : canonicalPath
      ? `/${canonicalPath}`
      : "";
    const canonicalUrl = `${BASE_URL}${cleanPath}`;

    // Standard metadata
    setMetaTag("name", "description", description);
    setMetaTag(
      "name",
      "robots",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );
    setLinkTag("canonical", canonicalUrl);

    // Open Graph metadata
    setMetaTag("property", "og:title", formattedTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "og:image", ogImage);
    setMetaTag("property", "og:site_name", "Campus Flow");

    // Twitter / X metadata
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", formattedTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", ogImage);

    // 5. Manage Dynamic JSON-LD Structured Data
    const existingDynamicScript = document.getElementById("seo-dynamic-jsonld");
    if (existingDynamicScript) {
      existingDynamicScript.remove();
    }

    if (structuredData) {
      const script = document.createElement("script");
      script.id = "seo-dynamic-jsonld";
      script.type = "application/ld+json";
      const payload = Array.isArray(structuredData)
        ? {
            "@context": "https://schema.org",
            "@graph": structuredData,
          }
        : structuredData;
      script.text = JSON.stringify(payload);
      document.head.appendChild(script);
    }

    return () => {
      const dynamicScript = document.getElementById("seo-dynamic-jsonld");
      if (dynamicScript) {
        dynamicScript.remove();
      }
    };
  }, [title, description, canonicalPath, ogType, ogImage, noindex, structuredData]);

  return null;
}
