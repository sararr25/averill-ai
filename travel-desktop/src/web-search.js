async function searchPublicWeb(query, key = process.env.TAVILY_API_KEY) {
  const input = String(query || '').trim().slice(0, 300);
  if (!input) throw new Error('Enter a public web search query');
  if (!key) throw new Error('Tavily API key is not configured');
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: input, search_depth: 'basic', max_results: 5, include_answer: false, include_raw_content: false, include_images: false }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Tavily search failed (${response.status})`);
  const body = await response.json();
  return (body.results || []).filter((item) => /^https?:\/\//.test(item.url || '')).slice(0, 5).map((item) => ({ title: String(item.title || item.url).slice(0, 200), url: item.url, content: String(item.content || '').slice(0, 600) }));
}

module.exports = { searchPublicWeb };
