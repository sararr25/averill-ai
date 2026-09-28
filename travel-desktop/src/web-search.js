async function searchPublicWeb(query, key = process.env.TAVILY_API_KEY) {
  return (await publicResearch(query, key, false)).results;
}

async function factCheckPublic(query, key = process.env.TAVILY_API_KEY) {
  return publicResearch(query, key, true);
}

async function publicResearch(query, key, includeAnswer) {
  const input = String(query || '').trim().slice(0, 300);
  if (!input) throw new Error('Enter a public web search query');
  if (!key) throw new Error('Tavily API key is not configured');
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: input, search_depth: 'basic', max_results: 5, include_answer: includeAnswer, include_raw_content: false, include_images: false }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Tavily search failed (${response.status})`);
  const body = await response.json();
  const results = (body.results || []).filter((item) => /^https?:\/\//.test(item.url || '')).slice(0, 5).map((item) => ({ title: String(item.title || item.url).slice(0, 200), url: item.url, content: String(item.content || '').slice(0, 600) }));
  return { answer: includeAnswer && results.length ? String(body.answer || '').slice(0, 2000) : '', results };
}

module.exports = { searchPublicWeb, factCheckPublic };
