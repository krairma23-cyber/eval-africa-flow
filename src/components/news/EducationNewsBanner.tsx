import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, ChevronLeft, ChevronRight, ExternalLink, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
}

// Fallback affiché tant que le flux Google News n'a pas répondu.
const FALLBACK_NEWS: NewsItem[] = [
  {
    id: "fb-1",
    category: "Éducation",
    title: "Actualités éducatives Afrique francophone",
    summary:
      "Chargement du flux d'actualités en temps réel depuis Google News…",
    source: "EvalScol",
    url: "https://news.google.com/search?q=%C3%A9ducation+Afrique+francophone&hl=fr",
    date: new Date().toISOString(),
  },
];

const STORAGE_KEY = "evalscol_news_banner_dismissed_v1";
const CACHE_KEY = "evalscol_news_cache_v1";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

export function EducationNewsBanner() {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "1") setDismissed(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Cache local pour réactivité immédiate
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as { ts: number; items: NewsItem[] };
        if (cached.items?.length) {
          setNews(cached.items);
          setLoading(false);
          if (Date.now() - cached.ts < CACHE_TTL_MS) return; // frais
        }
      }
    } catch { /* ignore */ }

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("education-news");
        if (cancelled) return;
        if (error) throw error;
        const items: NewsItem[] = data?.items ?? [];
        if (items.length) {
          setNews(items);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
        }
      } catch (e) {
        console.warn("[EducationNewsBanner] flux indisponible", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const NEWS = news.length > 0 ? news : FALLBACK_NEWS;

  useEffect(() => {
    setIndex(0);
  }, [news]);

  useEffect(() => {
    if (dismissed) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % NEWS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [dismissed, NEWS.length]);

  if (dismissed) return null;

  const current = NEWS[index % NEWS.length];
  if (!current) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  const prev = () => setIndex((i) => (i - 1 + NEWS.length) % NEWS.length);
  const next = () => setIndex((i) => (i + 1) % NEWS.length);

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
      <div className="flex items-stretch">
        <div className="hidden sm:flex items-center justify-center px-4 bg-primary/10 border-r border-primary/20">
          <Newspaper className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0 px-3 sm:px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="h-4 w-4 text-primary sm:hidden flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary">
              Actualité éducative
            </span>
            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-primary/15 text-primary font-medium">
              {current.category}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="min-w-0"
            >
              <a
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-start gap-1.5 text-sm sm:text-base font-semibold text-foreground hover:text-primary transition-colors"
              >
                <span className="line-clamp-1">{current.title}</span>
                <ExternalLink className="h-3.5 w-3.5 mt-0.5 opacity-60 group-hover:opacity-100 flex-shrink-0" />
              </a>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 mt-0.5">
                {current.summary}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-1">
                {current.source} · {new Date(current.date).toLocaleDateString("fr-FR")}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-0.5 px-1 sm:px-2 border-l border-primary/10">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={prev}
            aria-label="Actualité précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="hidden sm:flex items-center gap-1 px-1">
            {NEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-primary" : "w-1.5 bg-primary/30"
                }`}
                aria-label={`Actualité ${i + 1}`}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={next}
            aria-label="Actualité suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={handleDismiss}
            aria-label="Masquer le bandeau"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
