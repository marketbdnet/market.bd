import { Product } from '../types';
import { isProductPublicActive } from './productStatus';
import { KNOWN_JUNK_PRODUCT_IDS } from './knownJunkProductIds';

export interface MergeCatalogParams {
  canonicalProducts?: Product[];
  supplementalProducts?: Product[];
  apiProducts?: Product[];
  firestoreProducts?: Product[];
  syncProducts?: Product[];
  localCustomProducts?: Product[];
  deletedIds?: Iterable<string>;
  junkIds?: Iterable<string>;
}

function getPostedTimestamp(p: Partial<Product>): number {
  const raw = p.postedAt || p.createdAt || p.updatedAt || '';
  const ts = Date.parse(String(raw));
  return Number.isFinite(ts) ? ts : 0;
}

function isValidCandidate(
  p: Partial<Product> | null | undefined,
  deletedSet: Set<string>,
  junkSet: Set<string>
): p is Product {
  if (!p || typeof p !== 'object') return false;
  const id = String(p.id || '').trim();
  const title = String(p.title || '').trim();
  if (!id || !title) return false;
  if (deletedSet.has(id) || junkSet.has(id)) return false;
  if ((p as any).isDeleted === true) return false;
  if (String(p.status || '').toLowerCase().trim() === 'deleted') return false;
  return true;
}

/**
 * Deterministic union merge across Canonical Catalog, Supplemental Preserved User Ads,
 * Server API, Firestore Realtime Listener, Sync State, and Local Optimistic/Custom Ads.
 * Guarantees unique IDs (zero duplicates) and zero unintended ad drops across Web & Android.
 */
export function mergeAndDeduplicateProducts(params: MergeCatalogParams): Product[] {
  const deletedSet = new Set<string>();
  if (params.deletedIds) {
    for (const id of params.deletedIds) {
      if (typeof id === 'string' && id.trim()) deletedSet.add(id.trim());
    }
  }

  const junkSet = new Set<string>(params.junkIds || KNOWN_JUNK_PRODUCT_IDS);
  const byId = new Map<string, Product>();

  const applyLayer = (list: Product[] | undefined, preserveBaseDefaults: boolean) => {
    if (!Array.isArray(list)) return;
    for (const raw of list) {
      if (!isValidCandidate(raw, deletedSet, junkSet)) continue;
      const id = String(raw.id).trim();
      const existing = byId.get(id);
      if (preserveBaseDefaults) {
        const normalized: Product = {
          ...raw,
          id,
          status: raw.status || 'active',
          isApproved: raw.isApproved ?? true,
          isActive: raw.isActive ?? true,
          moderationStatus: raw.moderationStatus || 'approved',
        };
        byId.set(id, existing ? { ...existing, ...normalized } : normalized);
      } else if (existing) {
        byId.set(id, {
          ...existing,
          ...raw,
          id,
          images:
            Array.isArray(raw.images) && raw.images.some(img => typeof img === 'string' && img.trim() !== '')
              ? raw.images
              : existing.images,
          views: Math.max(Number(existing.views || 0), Number(raw.views || 0)),
        });
      } else {
        byId.set(id, { ...raw, id });
      }
    }
  };

  // Precedence order: base canonical (416) -> preserved supplemental user ads (23) -> API -> sync -> Firestore -> local edits
  applyLayer(params.canonicalProducts, true);
  applyLayer(params.supplementalProducts, true);
  applyLayer(params.apiProducts, false);
  applyLayer(params.syncProducts, false);
  applyLayer(params.firestoreProducts, false);
  applyLayer(params.localCustomProducts, false);

  return Array.from(byId.values()).sort((a, b) => {
    const diff = getPostedTimestamp(b) - getPostedTimestamp(a);
    if (diff !== 0) return diff;
    return String(a.id).localeCompare(String(b.id));
  });
}

/**
 * Canonical public active filter used uniformly across Web, Android, and REST APIs.
 */
export function filterPublicActiveProducts(list: Product[]): Product[] {
  const seen = new Set<string>();
  const result: Product[] = [];
  for (const p of list) {
    if (!p || !p.id || seen.has(p.id)) continue;
    if (!isProductPublicActive(p)) continue;
    seen.add(p.id);
    result.push(p);
  }
  return result;
}
