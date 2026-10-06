import { BASE } from '../lib/utils.js';
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
    const type = req.query.type === 'tv' ? 'tv' : 'movie';
    const page = Math.max(1, Number(req.query.page) || 1);
    const url = `${BASE}/category/${type}${page > 1 ? `?page=${page}` : ''}`;
    const items = parseCards(await getHTML(url));
    res.status(200).json({ ok: true, page, type, items, source: url });
  } catch (e) {
    res.status(502).json({ ok: false, error: e?.message || 'Catalog request failed' });
  }
}
