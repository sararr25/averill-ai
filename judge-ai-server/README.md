# Averill judge AI server

Small Vercel project (ticket JD-10) that lets judges use NVIDIA Nemotron and Tavily without their own keys. The keys exist only as Vercel environment variables. Every call is capped per day; at the cap the server refuses with a plain message and the app keeps its local approved-rules check.

## Endpoints
- `POST /api/review` — `{ task: "email"|"linkedin"|"instagram", draft, sources: [{ title, version, text }] }`. Fixed model (Nemotron Super, picked from the key's model list unless `NEBIUS_MODEL` is set) and fixed prompt. Draft capped at 4,000 characters, up to 5 sources of 3,000 characters each, 800 output tokens.
- `POST /api/ask` — `{ question, sources: [{ title, version, text }] }` (question capped at 500 characters, same source caps as review, 800 output tokens). Returns `{ model, answer, evidence: [{ sourceTitle, quote }] }`; the app keeps the answer only when each quote is verbatim in the source it sent. Uses the same Nebius token counters as `/api/review`.
- `POST /api/search` — `{ kind: "search", query }` (1 unit) or `{ kind: "crawl", url }` (https only, 10 pages, 5 units).
- All need header `X-Averill-Client` (the app's install id, 8–64 letters, digits or dashes).

## Daily caps (reset at 00:00 UTC)
| Variable | Default | Meaning |
| --- | --- | --- |
| `NEBIUS_DAILY_TOKENS` | 200000 | Nemotron tokens for the whole server |
| `NEBIUS_DAILY_TOKENS_PER_CLIENT` | 20000 | per app install (about 25 reviews) |
| `NEBIUS_DAILY_TOKENS_PER_IP` | 40000 | per IP address |
| `TAVILY_DAILY_UNITS` | 60 | Tavily units for the whole server |
| `TAVILY_DAILY_UNITS_PER_CLIENT` | 10 | per app install |
| `TAVILY_DAILY_UNITS_PER_IP` | 20 | per IP address |

Tokens are reserved before each call (estimate) and corrected to Nebius's reported usage afterwards. Without a usage store the server refuses every call (503) rather than run uncapped.

## Owner setup on Vercel
1. Create a project from this repository with Root Directory `judge-ai-server`.
2. Settings → Environment Variables (Production): `NEBIUS_API_KEY`, `TAVILY_API_KEY`. Optionally override the caps above.
3. Storage → connect a Redis store (free). Either form works: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL` + `KV_REST_API_TOKEN`), or a direct `REDIS_URL` / prefixed `*_REDIS_URL` (the live project uses `averill_storage_REDIS_URL`).
4. Redeploy so the variables are used.

## Test
`npm test` (no network).
