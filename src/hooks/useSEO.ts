import { useEffect } from "react";

interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
  keywords?: string;
}

const BASE_URL = "https://faithfulautocare.uk";
const DEFAULT_IMAGE = `${BASE_URL}/LandingPage1.png`;
const SITE_NAME = "Faithful Auto Care";

function setMetaTag(attribute: string, key: string, value: string) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
}

function setLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.href = href;
}

export function useSEO(config: SEOConfig) {
  useEffect(() => {
    const {
      title,
      description,
      canonical,
      ogType = "website",
      ogImage = DEFAULT_IMAGE,
      ogImageAlt = "Faithful Auto Care - Professional Car Wash and Detailing Service",
      noIndex = false,
      keywords,
    } = config;

    const fullTitle = title.includes(SITE_NAME)
      ? title
      : `${title} | ${SITE_NAME}`;

    document.title = fullTitle;

    setMetaTag("name", "description", description);
    setMetaTag(
      "name",
      "robots",
      noIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    if (keywords) {
      setMetaTag("name", "keywords", keywords);
    }

    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "og:image", ogImage);
    setMetaTag("property", "og:image:alt", ogImageAlt);
    setMetaTag("property", "og:site_name", SITE_NAME);

    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", ogImage);
    setMetaTag("name", "twitter:image:alt", ogImageAlt);

    if (canonical) {
      const canonicalUrl = canonical.startsWith("http")
        ? canonical
        : `${BASE_URL}${canonical}`;
      setMetaTag("property", "og:url", canonicalUrl);
      setLinkTag("canonical", canonicalUrl);
    }
  }, [config.title, config.description, config.canonical, config.ogType, config.ogImage, config.ogImageAlt, config.noIndex, config.keywords]);
}
