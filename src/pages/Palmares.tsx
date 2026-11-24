import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BookOpenCheck,
  CalendarCheck2,
  Crown,
  GraduationCap,
  Medal,
  Menu,
  ShieldCheck,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Seo from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  EXCELLENCE_TERMS,
  EXCELLENCE_WEIGHTS,
  PublicExcellenceEntry,
  getDefaultExcellenceTerm,
  getLaureateLabel,
} from "@/lib/excellence";

const navLinks = [
  { label: "Accueil", to: "/" },
  { label: "Fonctionnalités", to: "/#fonctionnalites" },
  { label: "Tarifs", to: "/pricing" },
  { label: "Palmarès", to: "/palmares" },
  { label: "Contact", to: "/about" },
];

function RankIcon({ rank, className = "h-5 w-5" }: { rank: number; className?: string }) {
  if (rank === 1) return <Crown className={className} aria-hidden="true" />;
  if (rank <= 3) return <Medal className={className} aria-hidden="true" />;
  return <Award className={className} aria-hidden="true" />;
}

export default function Palmares() {
  const [term, setTerm] = useState(getDefaultExcellenceTerm());
  const [country, setCountry] = useState("ALL");
  const [countries, setCountries] = useState<string[]>([]);
  const [entries, setEntries] = useState<PublicExcellenceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.rpc("get_public_excellence_countries").then(({ data }) => {
      if (active && data) setCountries(data.map((item) => item.country));
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    supabase.rpc("get_public_excellence_top10", {
      p_term_number: term,
      p_country: country === "ALL" ? undefined : country,
    }).then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) {
        setError(true);
        setEntries([]);
      } else {
        setEntries((data as PublicExcellenceEntry[] | null) ?? []);
      }
      setLoading(false);
    });

    return () => { active = false; };
  }, [term, country, reloadKey]);

  const academicYear = entries[0]?.academic_year_name;
  const isAnnual = term === 3;
  const updatedAt = entries[0]?.calculated_at
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(entries[0].calculated_at))
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Palmarès des écoles | EvalScol Africa"
        description="Découvrez le Top 10 des écoles EvalScol par trimestre et par pays : réussite pédagogique, ponctualité des bulletins et engagement des parents."
        path="/palmares"
      />

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img src="/logo.png" alt="EvalScol Africa" className="h-10 w-auto object-contain" />
            <span className="hidden text-lg font-bold sm:inline">EvalScol Africa</span>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigation principale">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={link.to === "/palmares"
                  ? "text-sm font-semibold text-primary"
                  : "text-sm font-medium text-muted-foreground transition-colors hover:text-primary"}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <Button asChild variant="outline"><Link to="/auth">Se connecter</Link></Button>
            <Button asChild><Link to="/auth">Inscrire mon école</Link></Button>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border lg:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-border px-4 py-4 lg:hidden">
            <nav className="grid gap-3" aria-label="Navigation mobile">
              {navLinks.map((link) => (
                <Link key={link.label} to={link.to} onClick={() => setMobileMenuOpen(false)} className="py-1 text-sm font-medium">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex items-center gap-2">
              <ThemeToggle />
              <Button asChild className="flex-1"><Link to="/auth">Se connecter</Link></Button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border bg-primary/5">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
          <div className="container relative mx-auto max-w-7xl px-4 py-14 text-center sm:py-20">
            <Badge variant="outline" className="mb-5 border-primary/30 bg-background px-4 py-1.5 text-primary">
              <Trophy className="mr-2 h-4 w-4" aria-hidden="true" />
              Palmarès des écoles{formatAcademicYear(academicYear)}
            </Badge>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              L’excellence scolaire se mesure. <span className="text-primary">Elle se célèbre.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Le classement EvalScol distingue les écoles qui font réussir leurs élèves, publient leurs bulletins à temps et impliquent les parents.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> Données réelles de la plateforme</span>
              <span className="inline-flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Top 10 public uniquement</span>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-7xl px-4 py-10 sm:py-14" aria-labelledby="classement-title">
          <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Choisir le trimestre">
              {EXCELLENCE_TERMS.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={term === item.value ? "default" : "outline"}
                  onClick={() => setTerm(item.value)}
                  aria-pressed={term === item.value}
                  className="px-2 sm:px-4"
                >
                  <span className="sm:hidden">{item.shortLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              ))}
            </div>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full lg:w-64" aria-label="Filtrer par pays">
                <SelectValue placeholder="Tous les pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les pays</SelectItem>
                {countries.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isAnnual && (
            <div className="mb-8 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <Crown className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">Palmarès officiel annuel</p>
                <p className="text-sm text-muted-foreground">Le Trimestre 3 synthétise les résultats de toute l’année scolaire, et pas seulement ceux de la dernière période.</p>
              </div>
            </div>
          )}

          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="classement-title" className="text-2xl font-bold sm:text-3xl">
                {country === "ALL" ? "Top 10 général" : `Top 10 — ${country}`}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {EXCELLENCE_TERMS.find((item) => item.value === term)?.label}
                {academicYear ? ` · Année ${academicYear}` : ""}
              </p>
            </div>
            {updatedAt && <p className="text-xs text-muted-foreground">Actualisé le {updatedAt}</p>}
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((item) => <Skeleton key={item} className="h-64 rounded-2xl" />)}
            </div>
          ) : error ? (
            <Card><CardContent className="p-10 text-center">
              <p className="font-semibold">Le classement ne peut pas être chargé pour le moment.</p>
              <Button className="mt-4" variant="outline" onClick={() => setReloadKey((key) => key + 1)}>Réessayer</Button>
            </CardContent></Card>
          ) : entries.length === 0 ? (
            <Card><CardContent className="p-10 text-center">
              <Trophy className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <p className="font-semibold">Aucun lauréat publié pour ce filtre.</p>
              <p className="mt-2 text-sm text-muted-foreground">Essayez un autre trimestre ou sélectionnez tous les pays.</p>
            </CardContent></Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {entries.slice(0, 3).map((entry) => (
                  <Card key={`${entry.rank}-${entry.school_name}`} className={entry.rank === 1 ? "border-primary/50 bg-primary/5 shadow-lg" : "border-border bg-card"}>
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="mb-5 flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <RankIcon rank={entry.rank} className="h-6 w-6" />
                        </div>
                        <span className="text-3xl font-bold text-muted-foreground">#{entry.rank}</span>
                      </div>
                      <h3 className="text-xl font-bold leading-snug">{entry.school_name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{[entry.city, entry.country].filter(Boolean).join(" · ")}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Badge variant="secondary"><ShieldCheck className="mr-1 h-3.5 w-3.5" /> Lauréat officiel</Badge>
                        <Badge variant="outline">{getLaureateLabel(entry.rank, entry.is_annual)}</Badge>
                      </div>
                      <div className="mt-auto pt-6">
                        <span className="text-4xl font-bold text-primary">{entry.score.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground"> / 100</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {entries.length > 3 && (
                <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
                  {entries.slice(3, 10).map((entry) => (
                    <article key={`${entry.rank}-${entry.school_name}`} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 border-b border-border p-4 last:border-0 sm:grid-cols-[4rem_1fr_14rem_auto] sm:px-6">
                      <span className="text-xl font-bold text-muted-foreground">#{entry.rank}</span>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{entry.school_name}</h3>
                        <p className="truncate text-xs text-muted-foreground sm:hidden">{entry.country}</p>
                      </div>
                      <div className="hidden sm:block">
                        <Badge variant="outline"><ShieldCheck className="mr-1 h-3 w-3" /> Lauréat officiel</Badge>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-primary">{entry.score.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground"> /100</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <section className="border-y border-border bg-muted/40 py-14">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="text-3xl font-bold">Un score transparent sur 100</h2>
              <p className="mt-3 text-muted-foreground">Aucun vote et aucune donnée déclarative : chaque point provient de l’activité scolaire enregistrée dans EvalScol.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: BookOpenCheck,
                  points: EXCELLENCE_WEIGHTS.pedagogical,
                  title: "Réussite pédagogique",
                  text: "Pourcentage de notes non absentes atteignant au moins la moitié du barème de l’évaluation.",
                },
                {
                  icon: CalendarCheck2,
                  points: EXCELLENCE_WEIGHTS.bulletins,
                  title: "Ponctualité des bulletins",
                  text: "Part des bulletins attendus générés au plus tard 7 jours après la fin de la période.",
                },
                {
                  icon: UsersRound,
                  points: EXCELLENCE_WEIGHTS.parents,
                  title: "Engagement des parents",
                  text: "Part des comptes parents ayant ouvert une session ou consulté le portail pendant la période.",
                },
              ].map((criterion) => (
                <Card key={criterion.title} className="bg-card">
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <criterion.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                      <span className="text-2xl font-bold">{criterion.points}<span className="text-sm font-normal text-muted-foreground"> pts</span></span>
                    </div>
                    <h3 className="text-lg font-semibold">{criterion.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{criterion.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-muted-foreground">
              Seuls les dix premiers sont publics. Chaque autre école conserve son score, son rang général, son rang national et ses conseils dans son espace Directeur.
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-7xl px-4 py-14">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-footer p-8 text-footer-foreground sm:flex-row sm:items-center">
            <div>
              <GraduationCap className="mb-4 h-8 w-8" aria-hidden="true" />
              <h2 className="text-2xl font-bold">Votre école peut entrer dans le prochain palmarès.</h2>
              <p className="mt-2 max-w-2xl text-sm opacity-80">Suivez vos trois indicateurs et recevez des conseils concrets depuis votre tableau de bord Directeur.</p>
            </div>
            <Button asChild variant="secondary" className="shrink-0"><Link to="/auth">Commencer gratuitement</Link></Button>
          </div>
        </section>
      </main>
    </div>
  );
}

function formatAcademicYear(academicYear?: string) {
  return academicYear ? ` · ${academicYear}` : "";
}
