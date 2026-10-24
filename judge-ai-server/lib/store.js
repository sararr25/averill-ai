// Counter stores. Upstash Redis over its REST API in production; an in-memory store only for tests and local runs.
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
function memoryStore() {
  const counts = new Map();
  return { counts, async incrby(key, by) { const total = (counts.get(key) || 0) + by; counts.set(key, total); return total; } };
}
module.exports = { upstashStore, memoryStore };
