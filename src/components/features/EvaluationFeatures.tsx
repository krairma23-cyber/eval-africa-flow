import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, TrendingUp, BarChart3, FileCheck, PieChart, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import evaluationsImg from "@/assets/feature-evaluations.jpg";

export function EvaluationFeatures() {
  const { t } = useLanguage();
  
  return (
    <div className="mt-16 lg:mt-24">
      <div className="relative max-w-7xl mx-auto mb-12 rounded-3xl overflow-hidden shadow-2xl">
        <img
          src={evaluationsImg}
          alt="Évaluations et suivi pédagogique"
          width={1280}
          height={896}
          loading="lazy"
          className="w-full h-56 sm:h-72 lg:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-6 lg:p-10">
          <h2 className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('eval.title')}
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-3xl">
            {t('eval.subtitle')}
          </p>
        </div>
      </div>


      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('eval.tests.title')}</CardTitle>
            </div>
            <CardDescription className="text-base">
              {t('eval.tests.desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('eval.tests.types')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('eval.tests.coefficients')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('eval.tests.grades')}
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-accent/20 hover:border-accent/40 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-xl">{t('eval.progress.title')}</CardTitle>
            </div>
            <CardDescription className="text-base">
              {t('eval.progress.desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t('eval.progress.trimester')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t('eval.progress.comparison')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t('eval.progress.alerts')}
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('eval.analytics.title')}</CardTitle>
            </div>
            <CardDescription className="text-base">
              {t('eval.analytics.desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('eval.analytics.charts')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('eval.analytics.stats')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('eval.analytics.exports')}
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-accent/20 hover:border-accent/40 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <FileCheck className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-xl">{t('eval.bulletins.title')}</CardTitle>
            </div>
            <CardDescription className="text-base">
              {t('eval.bulletins.desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t('eval.bulletins.calc')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t('eval.bulletins.templates')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t('eval.bulletins.pdf')}
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <PieChart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('eval.statistics.title')}</CardTitle>
            </div>
            <CardDescription className="text-base">
              {t('eval.statistics.desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('eval.statistics.averages')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('eval.statistics.success')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('eval.statistics.rankings')}
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-accent/20 hover:border-accent/40 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-xl">{t('eval.objectives.title')}</CardTitle>
            </div>
            <CardDescription className="text-base">
              {t('eval.objectives.desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t('eval.objectives.skills')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t('eval.objectives.continuous')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t('eval.objectives.reports')}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="mt-12 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-primary/30">
        <CardContent className="pt-8 pb-8">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-3">
              {t('eval.cta.title')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('eval.cta.desc')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                <span>{t('eval.cta.quick')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50">
                <BarChart3 className="h-4 w-4 text-accent" />
                <span>{t('eval.cta.realtime')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>{t('eval.cta.personal')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
