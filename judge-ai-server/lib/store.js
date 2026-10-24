// Counter stores: Upstash's REST API, or a direct Redis connection (REDIS_URL, or a prefixed *_REDIS_URL set by the
// Vercel storage integration). The in-memory store is only for tests and local runs.
function upstashStore({ url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN, fetcher = globalThis.fetch } = {}) {
  if (!url || !token) return null;
  return {
    async incrby(key, by, ttlSeconds) {
      const response = await fetcher(`${url.replace(/\/$/, '')}/pipeline`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['INCRBY', key, String(by)], ['EXPIRE', key, String(ttlSeconds)]]),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error(`Usage store failed (${response.status}).`);
      const [first] = await response.json();
      if (first?.error) throw new Error(`Usage store failed: ${first.error}`);
      return Number(first.result);
    },
  };
}
function redisUrlFromEnv(env = process.env) {
  if (env.REDIS_URL) return env.REDIS_URL;
  const name = Object.keys(env).sort().find(key => /_REDIS_URL$/i.test(key) && env[key]);
  return name ? env[name] : null;
}
function redisStore({ url = redisUrlFromEnv(), createClient = () => require('redis').createClient({ url, socket: { connectTimeout: 5000 } }) } = {}) {
  if (!url) return null;
  let connecting = null;
  // One connection per warm function instance, opened on first use.
  const client = () => connecting ||= (async () => {
    const instance = createClient();
    instance.on('error', () => { connecting = null; });
    await instance.connect();
    return instance;
  })().catch(error => { connecting = null; throw new Error(`Usage store failed: ${error.message}`); });
  return {
    async incrby(key, by, ttlSeconds) {
      const [total] = await (await client()).multi().incrBy(key, by).expire(key, ttlSeconds).exec();
      return Number(total);
    },
  };
}
function memoryStore() {
  const counts = new Map();
  return { counts, async incrby(key, by) { const total = (counts.get(key) || 0) + by; counts.set(key, total); return total; } };
}
module.exports = { upstashStore, redisStore, redisUrlFromEnv, memoryStore };
