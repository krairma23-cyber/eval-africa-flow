// Public edge function: agrège plusieurs flux RSS d'actualités éducatives africaines.
// Aucune authentification requise, réponse mise en cache 30 min.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface NewsItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
}

interface Feed {
  category: string;
  source: string;
  url: string;
  /** Si défini, ne garder que les articles contenant un de ces mots-clés. */
  keywords?: string[];
}

const EDU_KEYWORDS = [
  'école', 'ecole', 'éducation', 'education', 'élève', 'eleve', 'enseign',
  'scolaire', 'université', 'universite', 'étudiant', 'etudiant', 'bac',
  'bepc', 'examen', 'classe', 'lycée', 'lycee', 'formation', 'bourse',
];

const FEEDS: Feed[] = [
  {
    category: 'Éducation',
    source: 'Google Actualités',
    url: 'https://news.google.com/rss/search?q=%C3%A9ducation+Afrique+francophone&hl=fr&gl=FR&ceid=FR:fr',
  },
  {
    category: 'Examens',
    source: 'Google Actualités',
    url: 'https://news.google.com/rss/search?q=BAC+BEPC+Afrique+examen&hl=fr&gl=FR&ceid=FR:fr',
  },
  {
    category: 'Numérique',
    source: 'Google Actualités',
    url: 'https://news.google.com/rss/search?q=num%C3%A9rique+%C3%A9ducatif+Afrique+EdTech&hl=fr&gl=FR&ceid=FR:fr',
  },
  {
    category: 'Éducation',
    source: 'allAfrica',
    url: 'https://fr.allafrica.com/tools/headlines/rdf/education/headlines.rdf',
  },
  {
    category: 'Afrique',
    source: 'RFI Afrique',
    url: 'https://www.rfi.fr/fr/afrique/rss',
    keywords: EDU_KEYWORDS,
  },
  {
    category: 'Afrique',
    source: 'Jeune Afrique',
    url: 'https://www.jeuneafrique.com/feed/',
    keywords: EDU_KEYWORDS,
  },
];

/** Corrige le mojibake UTF-8 lu en latin-1 (ex: "Ã©" -> "é"). */
function fixMojibake(s: string): string {
  if (!/[ÃÂ][\u0080-\u00BF]/.test(s)) return s;
  try {
    const bytes = Uint8Array.from([...s].map((c) => c.charCodeAt(0) & 0xff));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return s;
  }
}

function decode(s: string): string {
  const out = s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return fixMojibake(out);
}

function pick(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? decode(m[1]) : '';
}

async function fetchFeed(feed: Feed): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
      redirect: 'follow',
    });
    if (!res.ok) return [];
    const xml = await res.text();

    // Supporte <item> (RSS) et <item rdf:about="..."> (RDF)
    const blocks = xml.split(/<item(?:\s[^>]*)?>/i).slice(1);

    const items: NewsItem[] = [];
    for (const raw of blocks.slice(0, 8)) {
      const block = raw.split(/<\/item>/i)[0];
      const title = pick(block, 'title');
      const link = pick(block, 'link') || (block.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? '');
      if (!title || !link) continue;

      if (feed.keywords) {
        const hay = title.toLowerCase();
        if (!feed.keywords.some((k) => hay.includes(k))) continue;
      }

      const pubDate = pick(block, 'pubDate') || pick(block, 'dc:date');
      const parsed = pubDate ? new Date(pubDate) : new Date();
      const description = pick(block, 'description').slice(0, 220);

      items.push({
        id: `${feed.source}-${items.length}-${link.slice(-24)}`,
        category: feed.category,
        title,
        summary: description || title,
        source: pick(block, 'source') || feed.source,
        url: link,
        date: isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString(),
      });
      if (items.length >= 4) break;
    }
    return items;
  } catch (_e) {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const all = await Promise.all(FEEDS.map(fetchFeed));

    // Entrelace pour mélanger les catégories
    const merged: NewsItem[] = [];
    const max = Math.max(0, ...all.map((a) => a.length));
    const seen = new Set<string>();
    for (let i = 0; i < max; i++) {
      for (const arr of all) {
        const it = arr[i];
        if (!it) continue;
        const key = it.title.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(it);
      }
    }

    const items = merged.slice(0, 12);
    const ok = items.length > 0;

    return new Response(JSON.stringify({ items, updatedAt: new Date().toISOString() }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': ok
          ? 'public, max-age=1800, s-maxage=1800'
          : 'public, max-age=60, s-maxage=60',
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
