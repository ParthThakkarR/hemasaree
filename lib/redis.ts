import { createClient, type RedisClientType } from 'redis';

/**
 * Lazy, resilient Redis client.
 *
 * - On Vercel (serverless) Redis may not be available. All callers should
 *   handle `null` gracefully (fall back to no-cache, skip queue, etc.).
 * - The connection is established lazily on first use, not at import time,
 *   so the module never crashes the build or cold-start if REDIS_URL is unset.
 */

let _client: RedisClientType | null = null;
let _connecting = false;

export async function getRedisClient(): Promise<RedisClientType | null> {
  // If Redis is not configured, skip silently
  const url = process.env.REDIS_URL;
  if (!url) {
    return null;
  }

  // Return existing open connection
  if (_client?.isOpen) {
    return _client;
  }

  // Prevent concurrent connection attempts
  if (_connecting) {
    return null;
  }

  _connecting = true;
  try {
    _client = createClient({ url });
    _client.on('error', (err) => console.error('[Redis] Client error:', err));
    await _client.connect();
    return _client;
  } catch (err) {
    console.warn('[Redis] Connection failed — running without cache:', err);
    _client = null;
    return null;
  } finally {
    _connecting = false;
  }
}

// Re-export a convenience default for backwards compatibility in existing code.
// NOTE: This is the *unconnected* client — prefer getRedisClient() instead.
const redisClient = {
  /** @deprecated Use getRedisClient() for safe lazy access */
  get isOpen() {
    return _client?.isOpen ?? false;
  },
};

export default redisClient;
