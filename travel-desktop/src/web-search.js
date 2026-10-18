const tavily = require('./tavily');

async function searchPublicWeb(query, key = process.env.TAVILY_API_KEY) {
  return (await publicResearch(query, key, false)).results;
}

async function factCheckPublic(query, key = process.env.TAVILY_API_KEY) {
  return publicResearch(query, key, true);
}

async function publicResearch(query, key, includeAnswer) {
  if (!String(query || '').trim()) throw new Error('Enter a public web search query');
  const { answer, results } = await tavily.search(query, { key, answer: includeAnswer, purpose: includeAnswer ? 'fact-check' : 'search' });
  return { answer, results: results.map(({ title, url, content }) => ({ title, url, content })) };
}

module.exports = { searchPublicWeb, factCheckPublic };
