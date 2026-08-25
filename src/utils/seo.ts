import { Product } from '../types';

export const SITE_NAME = 'MarketBD.Net';
export const SITE_URL = 'https://marketbd.net';
export const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=600&q=80';
export const DEFAULT_DESCRIPTION = 'MarketBD.Net - বাংলাদেশের ১ নম্বর অনলাইন মার্কেটপ্লেস। ঢাকা, চট্টগ্রাম, সিলেট সহ ৬৪ জেলায় সহজে মোবাইল, ল্যাপটপ, গাড়ি, ফ্ল্যাট ক্রয়-বিক্রয় করুন।';

export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  image: string;
  url: string;
  type?: 'website' | 'article' | 'product';
  price?: number;
  currency?: string;
  condition?: string;
  category?: string;
  location?: string;
  jsonLd?: Record<string, any>[];
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('bn-BD').format(price) + ' ৳';
}

/**
 * Generate full SEO metadata for a Product
 */
export function getProductSEO(product: Product): SEOData {
  const title = `${product.title} - ৳${product.price.toLocaleString('en-US')} | ${SITE_NAME}`;
  const locationText = product.location
    ? `${product.location.thana || ''}, ${product.location.district || ''}, ${product.location.division || ''}`
    : 'Bangladesh';
  
  const cleanDescription = (product.descriptionBn || product.description || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  const description = `${product.title} - মূল্য: ৳${product.price.toLocaleString('en-US')} (${product.isNegotiable ? 'আলোচনা সাপেক্ষে' : 'ফিক্সড প্রাইস'})। স্থান: ${locationText}। ${cleanDescription}`;

  const image = product.images?.[0] || DEFAULT_LOGO;
  const url = `${SITE_URL}/ad/${product.slug || product.id}`;
  const keywords = `${product.title}, ${product.category}, ${product.brand || ''}, buy ${product.title} Bangladesh, second hand ${product.category}, ${locationText}, MarketBD.Net`;

  // 1. Google Rich Results - Product Schema (JSON-LD)
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': product.title,
    'image': product.images || [image],
    'description': product.description || product.title,
    'sku': product.id,
    'mpn': product.slug || product.id,
    'brand': {
      '@type': 'Brand',
      'name': product.brand || 'MarketBD.Net'
    },
    'offers': {
      '@type': 'Offer',
      'url': url,
      'priceCurrency': 'BDT',
      'price': product.price,
      'priceValidUntil': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      'itemCondition': product.condition === 'brand_new'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
      'availability': product.status === 'sold'
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': product.seller?.name || 'MarketBD.Net Seller'
      }
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': product.seller?.rating || 4.8,
      'reviewCount': product.seller?.totalReviews || 12,
      'bestRating': '5',
      'worstRating': '1'
    }
  };

  // 2. BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': SITE_URL
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': product.category ? product.category.toUpperCase() : 'Ads',
        'item': `${SITE_URL}/category/${product.category || 'all'}`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': product.title,
        'item': url
      }
    ]
  };

  return {
    title,
    description,
    keywords,
    image,
    url,
    type: 'product',
    price: product.price,
    currency: 'BDT',
    condition: product.condition,
    category: product.category,
    location: locationText,
    jsonLd: [productSchema, breadcrumbSchema]
  };
}

/**
 * Generate SEO metadata for Homepage
 */
export function getHomeSEO(): SEOData {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': SITE_NAME,
    'alternateName': ['MarketBD', 'Market BD', 'MarketBD Bangladesh'],
    'url': SITE_URL,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${SITE_URL}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': SITE_NAME,
    'url': SITE_URL,
    'logo': `${SITE_URL}/logo.jpg`,
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+8801723230230',
      'contactType': 'customer service',
      'areaServed': 'BD',
      'availableLanguage': ['en', 'bn']
    },
    'sameAs': [
      'https://facebook.com/marketbd.net',
      'https://twitter.com/marketbd_net'
    ]
  };

  return {
    title: `MarketBD.Net - বাংলাদেশের ১ নম্বর অনলাইন মার্কেটপ্লেস | Buy & Sell Online in Bangladesh`,
    description: DEFAULT_DESCRIPTION,
    keywords: 'MarketBD, MarketBD.Net, Bikroy BD, online shopping Bangladesh, buy sell mobiles, laptop price in BD, used cars Dhaka, property sale Bangladesh, buy bikes online BD',
    image: DEFAULT_LOGO,
    url: SITE_URL,
    type: 'website',
    jsonLd: [websiteSchema, organizationSchema]
  };
}

/**
 * Generate Category SEO
 */
export function getCategorySEO(categoryName: string): SEOData {
  const cap = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  const title = `${cap} Price in Bangladesh 2026 - Buy & Sell ${cap} | ${SITE_NAME}`;
  const description = `Find best deals on ${cap} in Bangladesh. Browse top brands, compare prices, verified sellers, cash on delivery across 64 districts on ${SITE_NAME}.`;
  const url = `${SITE_URL}/category/${categoryName}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': SITE_URL
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': cap,
        'item': url
      }
    ]
  };

  return {
    title,
    description,
    keywords: `${categoryName} price in BD, buy ${categoryName} online Bangladesh, used ${categoryName}, ${SITE_NAME}`,
    image: DEFAULT_LOGO,
    url,
    type: 'website',
    jsonLd: [breadcrumbSchema]
  };
}
