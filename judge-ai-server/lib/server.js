// Shared wiring for the Vercel functions: Upstash counters and the caps from environment variables.
const { createLimiter } = require('./limits');
const { upstashStore } = require('./store');
const { createHandlers } = require('./handlers');
const store = upstashStore();
module.exports = createHandlers({ limiter: store ? createLimiter({ store }) : null });
