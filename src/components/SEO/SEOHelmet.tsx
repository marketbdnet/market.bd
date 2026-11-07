import React, { useEffect } from 'react';
import { Product } from '../../types';
import { getHomeSEO, getProductSEO, getCategorySEO, SEOData, SITE_NAME } from '../../utils/seo';

interface SEOHelmetProps {
  product?: Product | null;
  category?: string;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export const SEOHelmet: React.FC<SEOHelmetProps> = ({
  product,
  category,
  title: customTitle,
  description: customDescription,
  image: customImage,
  url: customUrl
}) => {
  useEffect(() => {
    let seoData: SEOData;

    if (product) {
      seoData = getProductSEO(product);
    } else if (category) {
      seoData = getCategorySEO(category);
    } else {
      seoData = getHomeSEO();
    }

    // Apply custom overrides if passed
    if (customTitle) seoData.title = customTitle;
    if (customDescription) seoData.description = customDescription;
    if (customImage) seoData.image = customImage;
    if (customUrl) seoData.url = customUrl;

    // 1. Update Document Title
    document.title = seoData.title;

    // Helper to update or create meta tags
    const updateMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to update canonical link
    const updateCanonical = (href: string) => {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // 2. Basic Meta Tags
    updateMetaTag('meta[name="description"]', 'name', 'description', seoData.description);
    updateMetaTag('meta[name="keywords"]', 'name', 'keywords', seoData.keywords);
    updateCanonical(seoData.url);

    // 3. Open Graph Tags (Facebook, WhatsApp, LinkedIn)
    updateMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
    updateMetaTag('meta[property="og:title"]', 'property', 'og:title', seoData.title);
    updateMetaTag('meta[property="og:description"]', 'property', 'og:description', seoData.description);
    updateMetaTag('meta[property="og:image"]', 'property', 'og:image', seoData.image);
    updateMetaTag('meta[property="og:url"]', 'property', 'og:url', seoData.url);
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', seoData.type || 'website');
    updateMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'bn_BD');

    if (seoData.type === 'product' && seoData.price) {
      updateMetaTag('meta[property="product:price:amount"]', 'property', 'product:price:amount', seoData.price.toString());
      updateMetaTag('meta[property="product:price:currency"]', 'property', 'product:price:currency', seoData.currency || 'BDT');
    }

    // 4. Twitter Card Meta Tags
    updateMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', seoData.title);
    updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', seoData.description);
    updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', seoData.image);

    // 5. Google Structured Data (JSON-LD Schema)
    let scriptTag = document.getElementById('json-ld-schema') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    if (seoData.jsonLd && seoData.jsonLd.length > 0) {
      scriptTag.textContent = JSON.stringify(seoData.jsonLd.length === 1 ? seoData.jsonLd[0] : seoData.jsonLd, null, 2);
    }
  }, [product, category, customTitle, customDescription, customImage, customUrl]);

  return null;
};
