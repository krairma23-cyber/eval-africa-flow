import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, ClipboardCheck, Shield, Lock, School, TrendingUp, Award, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { SchoolTestimonials } from "@/components/testimonials/SchoolTestimonials";
import { LocalSupport } from "@/components/features/LocalSupport";
import { EvaluationFeatures } from "@/components/features/EvaluationFeatures";
import { PremiumKPIs } from "@/components/features/PremiumKPIs";
import { ParentReports } from "@/components/features/ParentReports";
import { PressPartners } from "@/components/features/PressPartners";
import { AboutEvalScol } from "@/components/features/AboutEvalScol";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { EducationNewsBanner } from "@/components/news/EducationNewsBanner";
import heroBg from "@/assets/hero-classroom-bg.jpg";
import Seo from "@/components/Seo";
import { MotionReveal } from "@/components/motion/MotionReveal";
import { motion, useReducedMotion } from "framer-motion";

const featureCardMotion = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01 },
};

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  
  return (
    <>
    <Seo
      title="EvalScol Africa | Logiciel Gestion Scolaire Côte d'Ivoire"
      description="Plateforme SaaS de gestion scolaire avec IA pour l'Afrique : notes, bulletins PDF, portail parent et paiements mobile money."
      path="/"
    />
    <div
      className="min-h-screen relative bg-background"
      style={{
        backgroundImage: `linear-gradient(to bottom, hsl(var(--background) / 0.35), hsl(var(--background) / 0.55)), url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 lg:py-16 relative">
        {/* Language Switcher */}
        <motion.div
          className="flex justify-end mb-4 gap-2"
          initial={reduceMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ThemeToggle />
          <LanguageSwitcher />
        </motion.div>

        {/* Education news banner */}
        <motion.div
          className="max-w-5xl mx-auto mb-8"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <EducationNewsBanner />
        </motion.div>
        
        {/* Hero Section */}
        <header className="text-center mb-12 lg:mb-16">
          <motion.div
            className="inline-flex items-center justify-center gap-3 mb-2 sm:mb-4"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            <img src="/logo.png" alt="EvalScol Logo" className="h-28 sm:h-36 lg:h-44 w-auto object-contain" width={322} height={176} loading="eager" fetchPriority="high" />
          </motion.div>
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4 leading-tight"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            {t('hero.title')}
          </motion.h1>
          <motion.p
            className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-6"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
          >
            {t('hero.subtitle')}
          </motion.p>
          <motion.ul
            className="max-w-2xl mx-auto mb-6 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-left text-sm sm:text-base text-foreground"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.07, delayChildren: 0.32 } } }}
          >
            {[
              "Réduction de 80% du temps administratif",
              "Réduction de 95% des erreurs de calcul",
              "Paiements scolaires en 2 minutes via Mobile Money",
              "Portail parent en temps réel",
            ].map((benefit) => (
              <motion.li
                key={benefit}
                className="flex items-start gap-2"
                variants={{ hidden: { opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : -10 }, visible: { opacity: 1, x: 0 } }}
              >
                <span className="text-accent font-bold">✅</span><span>{benefit}</span>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.58 }}
          >
            <motion.div className="w-full sm:w-auto" whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 sm:px-8 shadow-lg hover:shadow-xl transition-all whitespace-normal h-auto min-h-11"
                onClick={() => navigate('/support')}
              >
                Réserver une démonstration
              </Button>
            </motion.div>
            <motion.div className="w-full sm:w-auto" whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-semibold px-5 sm:px-8 whitespace-normal h-auto min-h-11"
                onClick={() => navigate('/auth')}
              >
                Essayer gratuitement pendant 14 jours
              </Button>
            </motion.div>
          </motion.div>
          <p className="text-sm text-muted-foreground mb-6">Aucune carte bancaire requise.</p>
          <div className="flex flex-col xs:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-muted-foreground">
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
            <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 sm:px-8 shadow-lg hover:shadow-xl transition-all whitespace-normal h-auto min-h-11" onClick={() => navigate('/parent-portal')}>
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
                <motion.div variants={featureCardMotion} initial="rest" whileHover={reduceMotion ? "rest" : "hover"} transition={{ duration: 0.2 }}>
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
                </motion.div>

                <motion.div variants={featureCardMotion} initial="rest" whileHover={reduceMotion ? "rest" : "hover"} transition={{ duration: 0.2 }}>
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
                </motion.div>

                <motion.div variants={featureCardMotion} initial="rest" whileHover={reduceMotion ? "rest" : "hover"} transition={{ duration: 0.2 }}>
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
                </motion.div>

                <motion.div variants={featureCardMotion} initial="rest" whileHover={reduceMotion ? "rest" : "hover"} transition={{ duration: 0.2 }}>
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
                </motion.div>
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
          <motion.aside
            className="order-1 lg:order-2 lg:sticky lg:top-8"
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
          >
            <LoginForm embedded />
          </motion.aside>
        </main>

        {/* Premium KPIs */}
        <MotionReveal>
        <PremiumKPIs />
        </MotionReveal>

        {/* Evaluation and Analytics Features */}
        <MotionReveal>
        <EvaluationFeatures />
        </MotionReveal>

        {/* Parent Reports Section */}
        <MotionReveal>
        <ParentReports />
        </MotionReveal>

        {/* Testimonials Section */}
        <MotionReveal>
        <SchoolTestimonials />
        </MotionReveal>

        {/* Press & Partners Section */}
        <MotionReveal>
        <PressPartners />
        </MotionReveal>

        {/* Local Support Section */}
        <MotionReveal>
        <LocalSupport />
        </MotionReveal>

        {/* Emotional Closing Section */}
        <MotionReveal>
        <section className="max-w-4xl mx-auto mt-16 mb-8 text-center px-4">
           <div className="rounded-lg bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 p-5 sm:p-8 lg:p-12 shadow-lg">
            <h2 className="text-2xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
              Les écoles africaines méritent mieux que les fichiers Excel et les calculs manuels.
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              EvalScol Africa rend aux directeurs le temps, la visibilité et la sérénité nécessaires pour se concentrer sur l'éducation plutôt que sur l'administration.
            </p>
            <Button
              size="lg"
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 sm:px-8 shadow-lg hover:shadow-xl transition-all whitespace-normal h-auto min-h-11"
              onClick={() => navigate('/support')}
            >
              Demander une démonstration
            </Button>
          </div>
        </section>
        </MotionReveal>
      </div>
    </div>
    </>
  );
};
export default Index;
