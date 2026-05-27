// Public edge function: fetches Google News RSS for African francophone education
// No auth required, cached 30 min via Cache-Control header.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface NewsItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
}

const FEEDS: { category: string; query: string }[] = [
  { category: 'Éducation', query: 'éducation Afrique francophone' },
  { category: 'Examens', query: 'BAC BEPC Afrique examen' },
  { category: 'Réforme', query: 'réforme éducation MENA Côte d\'Ivoire Sénégal' },
  { category: 'Numérique', query: 'numérique éducatif Afrique EdTech' },
  { category: 'Bourses', query: 'bourse étudiante Afrique francophone' },
];

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<[^>]+>/g, '')
    .trim();
}

function pick(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? decode(m[1]) : '';
}

async function fetchFeed(category: string, query: string): Promise<NewsItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fr&gl=CI&ceid=CI:fr`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 EvalScolBot/1.0' } });
  if (!res.ok) return [];
  const xml = await res.text();
  const items = xml.split('<item>').slice(1, 5);
  return items.map((raw, idx) => {
    const block = raw.split('</item>')[0];
    const title = pick(block, 'title');
    const link = pick(block, 'link');
    const pubDate = pick(block, 'pubDate');
    const source = pick(block, 'source') || 'Google News';
    const description = pick(block, 'description').slice(0, 200);
    return {
      id: `${category}-${idx}-${link.slice(-20)}`,
      category,
      title,
      summary: description || title,
      source,
      url: link,
      date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    };
  }).filter(i => i.title && i.url);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const all = await Promise.all(FEEDS.map(f => fetchFeed(f.category, f.query)));
    // Interleave to mix categories
    const merged: NewsItem[] = [];
    const max = Math.max(...all.map(a => a.length));
    for (let i = 0; i < max; i++) {
      for (const arr of all) if (arr[i]) merged.push(arr[i]);
    }
    const items = merged.slice(0, 12);

    return new Response(JSON.stringify({ items, updatedAt: new Date().toISOString() }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
      },
    });
  } catch (e) {
    console.error('education-news error', e);
    return new Response(JSON.stringify({ items: [] }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
