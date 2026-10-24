// Shared wiring for the Vercel functions: usage counters (Upstash REST or Redis URL) and caps from environment variables.
const { createLimiter } = require('./limits');
const { upstashStore, redisStore } = require('./store');
const { createHandlers } = require('./handlers');
const store = upstashStore() || redisStore();
module.exports = createHandlers({ limiter: store ? createLimiter({ store }) : null });
