import { LRUCache } from "lru-cache";

type RateLimitTier = "auth" | "api" | "dashboard";

const rateLimits = {
  auth: { max: 5, ttl: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  api: { max: 60, ttl: 60 * 1000 }, // 60 requests per minute
  dashboard: { max: 200, ttl: 60 * 1000 }, // 200 requests per minute
};

const tokenCache = new LRUCache<string, number>({
  max: 5000,
  ttl: 60 * 1000,
  ttlResolution: 1000,
  ttlAutopurge: true,
});

export function rateLimit(ip: string, tier: RateLimitTier) {
  const { max, ttl } = rateLimits[tier];
  const key = `${ip}_${tier}`;
  const tokenCount = tokenCache.get(key) ?? 0;

  if (tokenCount === 0) {
    tokenCache.set(key, 1, { ttl });
    return { success: true, remaining: max - 1, limit: max };
  }

  if (tokenCount >= max) {
    return { success: false, remaining: 0, limit: max };
  }

  const currentTtl = tokenCache.getRemainingTTL(key);
  tokenCache.set(key, tokenCount + 1, { ttl: currentTtl });
  return { success: true, remaining: max - tokenCount - 1, limit: max };
}
