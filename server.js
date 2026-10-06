import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TTLCache } from './lib/cache.js';
import { BASE, abs, clean, uniq, numericId } from './lib/utils.js';
import { parseCards, parseDetail } from './lib/scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

const app = express();
const PORT = process.env.PORT || 3000;
const cache = new TTLCache(5 * 60 * 1000);

async function getHTML(url) {
  const hit = cache.get(url);
  if (hit) return hit;
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 TLIBRARY metadata client' } });
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return cache.set(url, await response.text());
}

app.use(express.static(publicDir));

app.get('/', (_, res) => res.sendFile(path.join(publicDir, 'index.html')));

app.get('/api/home', async (_, res) => {
  try { const html = await getHTML(BASE + '/'); res.json({ ok: true, items: parseCards(html).slice(0, 100), source: BASE }); }
  catch (e) { res.status(502).json({ ok: false, error: e.message }); }
});

app.get('/api/list', async (req, res) => {
  try {
    const type = req.query.type === 'tv' ? 'tv' : 'movie';
    const page = Math.max(1, Number(req.query.page) || 1);
    const url = `${BASE}/category/${type}${page > 1 ? `?page=${page}` : ''}`;
    const html = await getHTML(url);
    res.json({ ok: true, page, type, items: parseCards(html), source: url });
  } catch (e) { res.status(502).json({ ok: false, error: e.message }); }
});

app.get('/api/search', async (req, res) => {
  try {
    const q = clean(req.query.q);
    if (!q) return res.json({ ok: true, items: [] });
    const url = `${BASE}/search?keyword=${encodeURIComponent(q)}`;
    const html = await getHTML(url);
    res.json({ ok: true, query: q, items: parseCards(html), source: url });
  } catch (e) { res.status(502).json({ ok: false, error: e.message }); }
});

app.get('/api/detail', async (req, res) => {
  try {
    const type = req.query.type === 'tv' ? 'tv' : 'movie';
    const id = String(req.query.id || '').replace(/\D/g, '');
    if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });
    const url = `${BASE}/title/${type}/${id}`;
    res.json({ ok: true, data: parseDetail(await getHTML(url), url) });
  } catch (e) { res.status(502).json({ ok: false, error: e.message }); }
});

// Watch route for your own/authorized media. Set MEDIA_BASE_URL to an approved
// media host; this server never extracts VeloFlix's protected film streams.
app.get('/api/watch', (req, res) => {
  const src = process.env.MEDIA_BASE_URL;
  const id = String(req.query.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
  if (!src) return res.json({ ok: true, playable: false, message: 'Set MEDIA_BASE_URL to an authorized video host.' });
  res.json({ ok: true, playable: true, src: `${src.replace(/\/$/, '')}/${id}.mp4` });
});

app.get('/api/health', (_, res) => res.json({ ok: true, source: BASE, time: new Date().toISOString() }));
app.listen(PORT, () => console.log(`TLIBRARY running on :${PORT}`));
