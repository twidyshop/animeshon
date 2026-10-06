import { BASE, clean } from '../lib/utils.js';
import { parseCards } from '../lib/scraper.js';

async function getHTML(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; TLIBRARY metadata client)',
      'accept': 'text/html,application/xhtml+xml'
    }
  });
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return response.text();
}

export default async function handler(req, res) {
  try {
    const q = clean(req.query.q);
    if (!q) return res.status(200).json({ ok: true, items: [] });
    const url = `${BASE}/search?keyword=${encodeURIComponent(q)}`;
    const items = parseCards(await getHTML(url));
    res.status(200).json({ ok: true, query: q, items, source: url });
  } catch (e) {
    res.status(502).json({ ok: false, error: e?.message || 'Search failed' });
  }
}
