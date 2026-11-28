export interface NavHistoryEntry {
  tab: string;
  productId?: string | null;
  scrollY: number;
}

export interface ListingViewSnapshot {
  homeAdViewMode: 'grid' | 'list';
  homeRecentCategory: string;
  homeRecentSort: 'newest' | 'price-asc' | 'price-desc';
  homeVisibleRecentCount: number;
  searchLayoutView: 'grid' | 'list';
}

export const DEFAULT_LISTING_SNAPSHOT: ListingViewSnapshot = {
  homeAdViewMode: 'grid',
  homeRecentCategory: 'all',
  homeRecentSort: 'newest',
  homeVisibleRecentCount: 16,
  searchLayoutView: 'grid',
};

/**
 * Records current scrollY on the top history entry and pushes a new forward entry.
 */
export function pushNavHistoryEntry(
  stack: NavHistoryEntry[],
  next: Omit<NavHistoryEntry, 'scrollY'>,
  currentScrollY: number
): NavHistoryEntry[] {
  const safeScroll = Math.max(0, Math.round(Number(currentScrollY) || 0));
  const updated = stack.length > 0 ? [...stack] : [{ tab: 'home', scrollY: 0 }];
  const top = updated[updated.length - 1];

  // If already at identical destination, just ensure scroll isn't lost
  if (top && top.tab === next.tab && (top.productId || null) === (next.productId || null)) {
    return updated;
  }

  updated[updated.length - 1] = { ...top, scrollY: safeScroll };
  updated.push({ tab: next.tab, productId: next.productId ?? null, scrollY: 0 });
  return updated;
}

/**
 * Pops the top history entry and returns the previous entry with its saved scrollY.
 */
export function popNavHistoryEntry(stack: NavHistoryEntry[]): {
  nextStack: NavHistoryEntry[];
  popped: NavHistoryEntry | null;
  target: NavHistoryEntry;
} {
  if (stack.length <= 1) {
    return {
      nextStack: [{ tab: 'home', scrollY: 0 }],
      popped: null,
      target: { tab: 'home', scrollY: 0 },
    };
  }
  const nextStack = [...stack];
  const popped = nextStack.pop() || null;
  const target = nextStack[nextStack.length - 1] || { tab: 'home', scrollY: 0 };
  return { nextStack, popped, target };
}
