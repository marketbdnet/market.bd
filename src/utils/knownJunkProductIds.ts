// Centralized list of known bad/test product IDs that leaked into the
// production sync-state data at some point. Previously this exact array was
// copy-pasted separately in 4 places in MarketContext.tsx and 2 places in
// server.ts — any edit to one copy silently didn't apply to the others,
// which was a real contributor to different clients showing different ad
// counts. Now there is exactly one source of truth.
//
// Long-term fix: remove these IDs directly from server_sync_state.json (or
// its replacement database) so this filter isn't needed going forward.
export const KNOWN_JUNK_PRODUCT_IDS: string[] = [
  'prod-1787413284395',
  'prod-pending-2',
  'prod-pending-3',
  'prod-1787183789329',
];
