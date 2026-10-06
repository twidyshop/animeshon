import * as cheerio from 'cheerio';
import { BASE, abs, clean, uniq } from './utils.js';

export function parseCards(html) {
  const $ = cheerio.load(html), out = [];
  $('a[href*="/title/"]').each((_, a) => {
    const href = $(a).attr('href') || '';
    const match = href.match(/\/title\/(movie|tv)\/(\d+)/);
    if (!match) return;
    const img = $(a).find('img').first();
    const text = clean($(a).text());
    const image = abs(img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src') || '');
    const title = clean($(a).find('h1,h2,h3,h4,h5,.title').first().text()) || clean(img.attr('alt')) || text;
    if (!title) return;
    const year = (text.match(/\b(?:19|20)\d{2}\b/) || [])[0] || '';
    const rating = (text.match(/(?:★|⭐)\s*([0-9.]+)/) || [])[1] || '';
    const url = abs(href);
    if (!out.some(item => item.url === url)) out.push({ id: match[2], type: match[1], title, image, year, rating, url });
  });
  return out;
}

export function parseDetail(html, url) {
  const $ = cheerio.load(html);
  const match = new URL(url).pathname.match(/\/title\/(movie|tv)\/(\d+)/);
  const type = match?.[1] || '', id = match?.[2] || '';
  const title = clean($('h1').first().text()) || clean($('meta[property="og:title"]').attr('content'));
  const backdrop = abs($('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '');
  const body = clean($('body').text());
  const rating = (body.match(/([0-9]+(?:\.[0-9]+)?)\s*\/\s*10/) || [])[1] || '';
  const year = (body.match(/\b(?:19|20)\d{2}\b/) || [])[0] || '';
  let synopsis = clean($('meta[name="description"]').attr('content'));
  $('h2,h3,h4').each((_, h) => {
    if (synopsis && !/^synopsis$/i.test(clean($(h).text()))) return;
    if (/^synopsis$/i.test(clean($(h).text()))) {
      const chunks = []; let node = $(h).next();
      for (let i = 0; i < 4 && node.length; i++, node = node.next()) { const value = clean(node.text()); if (value) chunks.push(value); }
      if (chunks.length) synopsis = clean(chunks.join(' '));
    }
  });
  const genres = [];
  const genreWords = /^(Action|Adventure|Action & Adventure|Animation|Comedy|Crime|Documentary|Drama|Family|Fantasy|History|Horror|Music|Mystery|Romance|Science Fiction|Sci-Fi & Fantasy|Thriller|War|Western|Reality|Kids)$/i;
  $('a,span,button').each((_, e) => { const value = clean($(e).text()); if (genreWords.test(value)) genres.push(value); });
  const cast = [];
  $('img').each((_, e) => {
    const image = abs($(e).attr('src') || $(e).attr('data-src') || '');
    const name = clean($(e).attr('alt'));
    const parent = clean($(e).closest('article,li,div').text());
    if (image && name && /profile|person|actor|cast/i.test(`${image} ${name}`)) cast.push({ name, image, character: parent.replace(name, '').trim() });
  });
  const seasons = uniq([...body.matchAll(/\bSeason\s+\d+\b/gi)].map(m => m[0]));
  const episodeCount = (body.match(/(\d+)\s+episodes?/i) || [])[1] || '';
  const watchUrl = `${BASE}/watch/${type}/${id}?play=1`;
  return { id, type, title, year, rating, backdrop, synopsis, genres: uniq(genres), cast: uniq(cast).slice(0, 100), seasons, episodeCount, source: url, watchUrl };
}
