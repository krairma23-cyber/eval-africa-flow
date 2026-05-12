import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NewsItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
}

// Actualités éducatives Afrique francophone — éditorialisées
const NEWS: NewsItem[] = [
  {
    id: "1",
    category: "Réforme",
    title: "Nouveau calendrier scolaire 2025-2026 en Côte d'Ivoire",
    summary:
      "Le Ministère de l'Éducation Nationale annonce les dates officielles de la rentrée et des congés.",
    source: "MENA Côte d'Ivoire",
    url: "https://www.education.gouv.ci",
    date: "2025-09-15",
  },
  {
    id: "2",
    category: "Examens",
    title: "BEPC et BAC : nouvelles modalités d'évaluation",
    summary:
      "Les coefficients et la structure des épreuves évoluent pour mieux refléter les compétences acquises.",
    source: "DECO",
    url: "https://www.deco.education.ci",
    date: "2025-10-02",
  },
  {
    id: "3",
    category: "Bourses",
    title: "Bourses d'excellence pour élèves méritants",
    summary:
      "Plusieurs programmes de bourses sont ouverts aux meilleurs élèves du secondaire en Afrique de l'Ouest.",
    source: "AUF",
    url: "https://www.auf.org",
    date: "2025-10-20",
  },
  {
    id: "4",
    category: "Numérique",
    title: "L'IA au service de la pédagogie : guide pour enseignants",
    summary:
      "Comment utiliser les outils d'IA pour personnaliser l'apprentissage et détecter les élèves en difficulté.",
    source: "UNESCO",
    url: "https://www.unesco.org/fr/digital-education",
    date: "2025-11-05",
  },
  {
    id: "5",
    category: "Formation",
    title: "Formation continue des enseignants : nouveaux modules en ligne",
    summary:
      "Des parcours certifiants gratuits pour renforcer les pratiques pédagogiques.",
    source: "IFADEM",
    url: "https://www.ifadem.org",
    date: "2025-11-10",
  },
];

const STORAGE_KEY = "evalscol_news_banner_dismissed_v1";

export function EducationNewsBanner() {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "1") setDismissed(true);
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % NEWS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [dismissed]);

  if (dismissed) return null;

  const current = NEWS[index];

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
