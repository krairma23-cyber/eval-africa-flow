import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, ClipboardCheck, Shield, Lock, School, TrendingUp, Award, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { SchoolTestimonials } from "@/components/testimonials/SchoolTestimonials";
import { LocalSupport } from "@/components/features/LocalSupport";
import { EvaluationFeatures } from "@/components/features/EvaluationFeatures";
import { ParentReports } from "@/components/features/ParentReports";
import { PressPartners } from "@/components/features/PressPartners";
import { AboutEvalScol } from "@/components/features/AboutEvalScol";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4 gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        
        {/* Hero Section */}
        <header className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <img src="/logo.png" alt="EvalScol Logo" className="h-44 w-auto object-contain" width={322} height={176} loading="eager" fetchPriority="high" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            {t('hero.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              <span>{t('hero.secureData')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-accent" />
              <span>{t('hero.secureAuth')}</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <AboutEvalScol />
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 shadow-lg hover:shadow-xl transition-all" onClick={() => navigate('/parent-portal')}>
              <Users className="h-5 w-5 mr-2" />
              {t('hero.parentPortal')}
            </Button>
          </div>
        </header>

        {/* Two Column Layout */}
        <main className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-7xl mx-auto">
          {/* Left Column - Features */}
          <section className="space-y-6 order-2 lg:order-1">
            <article>
              <h2 className="text-2xl lg:text-3xl font-bold mb-6">{t('index.featuresTitle')}</h2>
              <div className="grid gap-4">
                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Users className="h-8 w-8 text-primary shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <CardTitle className="text-lg">{t('index.students.title')}</CardTitle>
                        <CardDescription className="mt-1">
                          {t('index.students.desc')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-accent/20 hover:border-accent/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-8 w-8 text-accent shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <CardTitle className="text-lg">{t('index.teachers.title')}</CardTitle>
                        <CardDescription className="mt-1">
                          {t('index.teachers.desc')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <ClipboardCheck className="h-8 w-8 text-primary shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <CardTitle className="text-lg">{t('index.evaluations.title')}</CardTitle>
                        <CardDescription className="mt-1">
                          {t('index.evaluations.desc')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-accent/20 hover:border-accent/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-8 w-8 text-accent shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <CardTitle className="text-lg">{t('index.reports.title')}</CardTitle>
                        <CardDescription className="mt-1">
                          {t('index.reports.desc')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </article>

            {/* Security Notice */}
            <Card className="bg-accent/5 border-accent/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-accent shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-accent mb-2">{t('index.security.title')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('index.security.desc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Right Column - Authentication Form */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-8">
            <LoginForm />
          </aside>
        </main>

        {/* Evaluation and Analytics Features */}
        <EvaluationFeatures />

        {/* Parent Reports Section */}
        <ParentReports />

        {/* Testimonials Section */}
        <SchoolTestimonials />

        {/* Press & Partners Section */}
        <PressPartners />

        {/* Local Support Section */}
        <LocalSupport />
      </div>
    </div>
  );
};
export default Index;
