import { CANONICAL_400_PRODUCTS } from './canonicalCatalog400';

// NOTE: this file previously contained ~72 unused "handcrafted" placeholder
// products (BASE_HANDCRAFTED_PRODUCTS, with stock Unsplash images and fake
// seller reviews) plus an unused import of generateComprehensiveCatalog.
// Neither was ever exported or used anywhere in the app — INITIAL_PRODUCTS
// always resolved directly to CANONICAL_400_PRODUCTS. Removed as dead code
// to shrink the client bundle.
export const INITIAL_PRODUCTS = CANONICAL_400_PRODUCTS;
