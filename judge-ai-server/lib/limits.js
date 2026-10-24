// Daily usage caps. Every call reserves units on three counters (whole server, app install, IP address) before it
// runs; if any counter would pass its cap the reservation is undone and the call is refused. Counters reset each UTC day.
const DAY_SECONDS = 26 * 60 * 60;
const MESSAGES = {
  nebius: 'Daily AI limit reached. The approved-rules check still works.',
  tavily: 'Daily web search limit reached. Try again tomorrow.',
};

function number(env, name, fallback) {
  const value = Number(env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}
function limitsFromEnv(env = process.env) {
  return {
    nebius: { global: number(env, 'NEBIUS_DAILY_TOKENS', 200000), client: number(env, 'NEBIUS_DAILY_TOKENS_PER_CLIENT', 20000), ip: number(env, 'NEBIUS_DAILY_TOKENS_PER_IP', 40000) },
    tavily: { global: number(env, 'TAVILY_DAILY_UNITS', 60), client: number(env, 'TAVILY_DAILY_UNITS_PER_CLIENT', 10), ip: number(env, 'TAVILY_DAILY_UNITS_PER_IP', 20) },
  };
}
const day = now => new Date(now).toISOString().slice(0, 10);

class LimitError extends Error {
  constructor(service) { super(MESSAGES[service]); this.status = 429; this.service = service; }
}

function createLimiter({ store, limits = limitsFromEnv(), now = () => Date.now() }) {
  async function reserve(service, { client, ip }, units) {
    const caps = limits[service];
    if (!caps) throw new Error(`Unknown service ${service}`);
    const date = day(now());
    const keys = [['global', `${service}:${date}:global`], ['client', `${service}:${date}:client:${client}`], ['ip', `${service}:${date}:ip:${ip}`]];
    const taken = [];
    for (const [scope, key] of keys) {
      const total = await store.incrby(key, units, DAY_SECONDS);
      taken.push(key);
      if (total > caps[scope]) {
        for (const done of taken) await store.incrby(done, -units, DAY_SECONDS);
        throw new LimitError(service);
      }
    }
    return { keys: taken, units };
  }
  // Correct a reservation to what the provider actually used (never below zero extra).
  async function settle(reservation, used) {
    const delta = Math.max(0, Math.round(used)) - reservation.units;
    if (delta) for (const key of reservation.keys) await store.incrby(key, delta, DAY_SECONDS);
  }
  async function release(reservation) { await settle(reservation, 0); }
  return { reserve, settle, release };
}

module.exports = { createLimiter, limitsFromEnv, LimitError, MESSAGES };
