import { BASE } from '../lib/utils.js';
import { parseDetail } from '../lib/scraper.js';

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
    const id = String(req.query.id || '').replace(/\D/g, '');
    if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });
    const url = `${BASE}/title/${type}/${id}`;
    res.status(200).json({ ok: true, data: parseDetail(await getHTML(url), url) });
  } catch (e) {
    res.status(502).json({ ok: false, error: e?.message || 'Detail request failed' });
  }
}
