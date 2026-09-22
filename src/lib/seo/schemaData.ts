/**
 * Structured Data (JSON-LD) generators for Campus Flow
 * Complies with Schema.org standards for Google Search, Bing, and AI search engines
 */

export const BASE_URL = "https://mycampusflow.live";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "Campus Flow",
    alternateName: ["CampusFlow", "Campus Flow Platform"],
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/favicon.png`,
      caption: "Campus Flow Logo",
      width: 512,
      height: 512,
    },
    image: `${BASE_URL}/og-image.png`,
    description:
      "Campus Flow is a comprehensive academic resource platform for college students to access lecture notes, PYQs, study rooms, AI doubt solving, and community discussions.",
    sameAs: [
      "https://instagram.com/droneclubshivalik",
      "https://dronexsce.in"
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "sigmaprimeplus@gmail.com",
        availableLanguage: ["English", "Hindi"],
      },
    ],
  };
}

export function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "Campus Flow",
    publisher: {
      "@id": `${BASE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/browse?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function createWebPageSchema({
  title,
  description,
  url,
  breadcrumbs,
}: {
  title: string;
  description: string;
  url: string;
  breadcrumbs?: BreadcrumbItem[];
}) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${fullUrl}#webpage`,
    url: fullUrl,
    name: title,
    description: description,
    isPartOf: {
      "@id": `${BASE_URL}/#website`,
    },
    inLanguage: "en-US",
    ...(breadcrumbs && breadcrumbs.length > 0
      ? {
          breadcrumb: createBreadcrumbSchema(breadcrumbs),
        }
      : {}),
  };
}

export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

export function createFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
