export interface ProductReaction {
  likes: number;
  dislikes: number;
  loves: number;
  userReaction?: 'like' | 'dislike' | 'love';
}

export const REACTIONS_STORAGE_KEY = 'marketbd_product_reactions_v1';

export const EMPTY_REACTION: ProductReaction = {
  likes: 0,
  dislikes: 0,
  loves: 0,
};

function toSafeCount(val: unknown): number {
  const num = Number(val);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.floor(num);
}

function isValidReactionType(val: unknown): val is 'like' | 'dislike' | 'love' {
  return val === 'like' || val === 'dislike' || val === 'love';
}

export function sanitizeReactionEntry(entry: unknown): ProductReaction {
  if (!entry || typeof entry !== 'object') {
    return { ...EMPTY_REACTION };
  }
  const obj = entry as Record<string, unknown>;
  const sanitized: ProductReaction = {
    likes: toSafeCount(obj.likes),
    dislikes: toSafeCount(obj.dislikes),
    loves: toSafeCount(obj.loves),
  };
  if (isValidReactionType(obj.userReaction)) {
    sanitized.userReaction = obj.userReaction;
  }
  return sanitized;
}

export function sanitizeReactionRecord(raw: unknown): Record<string, ProductReaction> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const result: Record<string, ProductReaction> = {};
  for (const [productId, entry] of Object.entries(raw as Record<string, unknown>)) {
    if (!productId || !entry || typeof entry !== 'object') continue;
    const clean = sanitizeReactionEntry(entry);
    if (clean.likes > 0 || clean.dislikes > 0 || clean.loves > 0 || clean.userReaction) {
      result[productId] = clean;
    }
  }
  return result;
}

export function loadStoredReactions(rawJson: string | null | undefined): Record<string, ProductReaction> {
  if (!rawJson) return {};
  try {
    return sanitizeReactionRecord(JSON.parse(rawJson));
  } catch {
    return {};
  }
}

export function computeNextReactions(
  prev: Record<string, ProductReaction>,
  productId: string,
  type: 'like' | 'dislike' | 'love'
): Record<string, ProductReaction> {
  const current = prev[productId] ? sanitizeReactionEntry(prev[productId]) : { ...EMPTY_REACTION };
  const userPrev = current.userReaction;

  if (userPrev === type) {
    const nextLikes = type === 'like' ? Math.max(0, current.likes - 1) : current.likes;
    const nextDislikes = type === 'dislike' ? Math.max(0, current.dislikes - 1) : current.dislikes;
    const nextLoves = type === 'love' ? Math.max(0, current.loves - 1) : current.loves;

    return {
      ...prev,
      [productId]: {
        likes: nextLikes,
        dislikes: nextDislikes,
        loves: nextLoves,
        userReaction: undefined,
      },
    };
  }

  let newLikes = current.likes;
  let newDislikes = current.dislikes;
  let newLoves = current.loves;

  if (userPrev === 'like') newLikes = Math.max(0, newLikes - 1);
  if (userPrev === 'dislike') newDislikes = Math.max(0, newDislikes - 1);
  if (userPrev === 'love') newLoves = Math.max(0, newLoves - 1);

  if (type === 'like') newLikes += 1;
  if (type === 'dislike') newDislikes += 1;
  if (type === 'love') newLoves += 1;

  return {
    ...prev,
    [productId]: {
      likes: newLikes,
      dislikes: newDislikes,
      loves: newLoves,
      userReaction: type,
    },
  };
}

export function extractGlobalReactionCounts(
  reactions: Record<string, ProductReaction>
): Record<string, { likes: number; dislikes: number; loves: number }> {
  const output: Record<string, { likes: number; dislikes: number; loves: number }> = {};
  for (const [productId, entry] of Object.entries(reactions)) {
    const clean = sanitizeReactionEntry(entry);
    if (clean.likes > 0 || clean.dislikes > 0 || clean.loves > 0) {
      output[productId] = {
        likes: clean.likes,
        dislikes: clean.dislikes,
        loves: clean.loves,
      };
    }
  }
  return output;
}

export function mergeServerReactionCounts(
  local: Record<string, ProductReaction>,
  server: unknown
): Record<string, ProductReaction> {
  const cleanServer = sanitizeReactionRecord(server);
  const merged: Record<string, ProductReaction> = { ...local };

  for (const [productId, serverEntry] of Object.entries(cleanServer)) {
    const localEntry = merged[productId];
    merged[productId] = {
      likes: Math.max(serverEntry.likes, localEntry?.likes ?? 0),
      dislikes: Math.max(serverEntry.dislikes, localEntry?.dislikes ?? 0),
      loves: Math.max(serverEntry.loves, localEntry?.loves ?? 0),
      ...(localEntry?.userReaction ? { userReaction: localEntry.userReaction } : {}),
    };
  }

  return merged;
}
