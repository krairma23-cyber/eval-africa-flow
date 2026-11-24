import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Award, BookOpenCheck, CalendarCheck2, Crown, Lightbulb, Trophy, UsersRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/hooks/useRole";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EXCELLENCE_TERMS,
  EXCELLENCE_WEIGHTS,
  SchoolExcellenceScore,
  getDefaultExcellenceTerm,
  getExcellenceAdvice,
} from "@/lib/excellence";

interface SchoolExcellencePanelProps {
  compact?: boolean;
}

export function SchoolExcellencePanel({ compact = false }: SchoolExcellencePanelProps) {
  const { isAdmin, loading: roleLoading } = useRole();
  const [term, setTerm] = useState(getDefaultExcellenceTerm());
  const [score, setScore] = useState<SchoolExcellenceScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadScore = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    const { data, error: queryError } = await supabase.rpc("get_my_school_excellence", {
      p_term_number: term,
    });
    if (queryError) {
      setError(true);
      setScore(null);
    } else {
      setScore(((data as SchoolExcellenceScore[] | null) ?? [])[0] ?? null);
    }
    setLoading(false);
  }, [isAdmin, term]);

  useEffect(() => {
    if (!roleLoading) void loadScore();
  }, [loadScore, roleLoading]);

  if (roleLoading || (!isAdmin && !roleLoading)) return null;

  if (loading) {
    return <Card className="border-primary/20"><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>;
  }

  if (error) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-start gap-3 p-6">
          <p className="text-sm text-muted-foreground">Votre score d’excellence n’a pas pu être chargé.</p>
          <Button variant="outline" size="sm" onClick={() => void loadScore()}>Réessayer</Button>
        </CardContent>
      </Card>
    );
  }

  if (!score) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <Trophy className="mb-3 h-7 w-7 text-primary" />
          <p className="font-semibold">Votre palmarès est en préparation.</p>
          <p className="mt-1 text-sm text-muted-foreground">Créez les périodes scolaires pour obtenir votre premier classement.</p>
        </CardContent>
      </Card>
    );
  }

  const isLaureate = score.global_rank <= 10;
  const criteria = [
    {
      icon: BookOpenCheck,
      label: "Réussite pédagogique",
      points: score.pedagogical_score,
      maximum: EXCELLENCE_WEIGHTS.pedagogical,
      rate: score.success_rate,
      detail: `${score.result_count} notes évaluées`,
    },
    {
      icon: CalendarCheck2,
      label: "Ponctualité des bulletins",
      points: score.bulletin_score,
      maximum: EXCELLENCE_WEIGHTS.bulletins,
      rate: score.bulletin_rate,
      detail: `${score.on_time_reports} à temps sur ${score.expected_reports} attendus`,
    },
    {
      icon: UsersRound,
      label: "Engagement des parents",
      points: score.parent_score,
      maximum: EXCELLENCE_WEIGHTS.parents,
      rate: score.parent_rate,
      detail: `${score.active_parents} actifs sur ${score.parent_accounts} comptes`,
    },
  ];

  if (compact) {
    return (
      <Card className="overflow-hidden border-primary/25 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 p-4 pb-3 sm:p-6 sm:pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg"><Trophy className="h-5 w-5 text-primary" /> Excellence de votre école</CardTitle>
            <CardDescription className="mt-1">
              {EXCELLENCE_TERMS.find((item) => item.value === score.term_number)?.label} · {score.academic_year_name}
              {score.is_annual ? " · Palmarès annuel" : ""}
            </CardDescription>
          </div>
          <Badge variant={isLaureate ? "default" : "secondary"}>
            {isLaureate ? <Crown className="mr-1 h-3.5 w-3.5" /> : <Award className="mr-1 h-3.5 w-3.5" />}
            {isLaureate ? "Top 10 officiel" : `Rang #${score.global_rank}`}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-5 p-4 pt-2 sm:p-6 sm:pt-2 lg:grid-cols-[12rem_1fr_auto] lg:items-center">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">{score.total_score.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <span>Rang général : <strong className="text-foreground">#{score.global_rank}</strong> sur {score.total_schools}</span>
            <span>{score.country} : <strong className="text-foreground">#{score.country_rank}</strong> sur {score.country_schools}</span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/excellence">Mes conseils <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/25">
        <CardHeader className="border-b border-border bg-primary/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl"><Trophy className="h-6 w-6 text-primary" /> Module d’excellence</CardTitle>
              <CardDescription className="mt-2">
                {score.school_name} · Année {score.academic_year_name}
              </CardDescription>
            </div>
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Choisir le trimestre">
              {EXCELLENCE_TERMS.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  size="sm"
                  variant={term === item.value ? "default" : "outline"}
                  onClick={() => setTerm(item.value)}
                  aria-pressed={term === item.value}
                >
                  {item.shortLabel}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-8 p-6 lg:grid-cols-[16rem_1fr] lg:items-center">
          <div className="text-center lg:border-r lg:border-border lg:pr-8">
            <div
              className="mx-auto flex h-40 w-40 items-center justify-center rounded-full p-3"
              style={{ background: `conic-gradient(hsl(var(--primary)) ${score.total_score * 3.6}deg, hsl(var(--secondary)) 0)` }}
              role="img"
              aria-label={`Score de ${score.total_score.toFixed(1)} sur 100`}
            >
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-card">
                <span className="text-4xl font-bold text-primary">{score.total_score.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">sur 100</span>
              </div>
            </div>
            <Badge className="mt-5" variant={isLaureate ? "default" : "secondary"}>
              {isLaureate ? <Crown className="mr-1 h-4 w-4" /> : <Award className="mr-1 h-4 w-4" />}
              {isLaureate ? "Lauréat officiel du Top 10" : `Encore ${score.global_rank - 10} place(s) à gagner pour le Top 10`}
            </Badge>
          </div>
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Rang général privé</p>
                <p className="mt-1 text-2xl font-bold">#{score.global_rank}<span className="text-sm font-normal text-muted-foreground"> / {score.total_schools} écoles</span></p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Rang en {score.country}</p>
                <p className="mt-1 text-2xl font-bold">#{score.country_rank}<span className="text-sm font-normal text-muted-foreground"> / {score.country_schools} écoles</span></p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {score.is_annual
                ? "Le Trimestre 3 est le palmarès officiel annuel : il couvre toute l’année scolaire."
                : `Score du ${EXCELLENCE_TERMS.find((item) => item.value === score.term_number)?.label}.`}
              {" "}Actualisation automatique chaque nuit.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {criteria.map((criterion) => (
          <Card key={criterion.label}>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><criterion.icon className="h-5 w-5 text-primary" /> {criterion.label}</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="mb-2 flex items-end justify-between gap-2">
                <span className="text-2xl font-bold">{criterion.points.toFixed(1)}<span className="text-sm font-normal text-muted-foreground"> / {criterion.maximum}</span></span>
                <span className="text-sm font-medium text-primary">{criterion.rate.toFixed(0)} %</span>
              </div>
              <Progress value={criterion.rate} className="h-2" aria-label={`${criterion.label} : ${criterion.rate.toFixed(0)} %`} />
              <p className="mt-3 text-xs text-muted-foreground">{criterion.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-accent/25 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Lightbulb className="h-5 w-5 text-accent" /> Vos priorités pour progresser</CardTitle>
          <CardDescription>Des conseils calculés à partir des trois indicateurs de votre école.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {getExcellenceAdvice(score).map((advice, index) => (
              <li key={advice} className="flex gap-3 rounded-lg border border-border bg-card p-4 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">{index + 1}</span>
                <span>{advice}</span>
              </li>
            ))}
          </ol>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/palmares">Voir le Top 10 public <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
