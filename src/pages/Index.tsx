import { Button } from "@/components/ui/button";
import {
  GraduationCap, Users, ClipboardCheck, CreditCard, Brain, TrendingUp,
  Calculator, Clock, Wallet, MessageSquareWarning, CalendarX2,
  Smartphone, Sparkles, Headset, ShieldCheck, Menu, X, Phone, Mail, MapPin,
  CheckCircle2, AlertTriangle, Bell, FileText, ChevronRight, Facebook, MessageCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { FACEBOOK_URL, WHATSAPP_URL } from "@/components/features/SocialLinks";
import logo2kk from "@/assets/2kk-technologie-logo-phoenix.png.asset.json";
import Seo from "@/components/Seo";
import { MotionReveal } from "@/components/motion/MotionReveal";
import { motion, useReducedMotion } from "framer-motion";

const COPY = {
  fr: {
    nav: {
      home: "Accueil", features: "Fonctionnalités", pricing: "Tarifs",
      demo: "Démonstration", testimonials: "Témoignages", contact: "Contact",
      login: "Se connecter", start: "Commencer gratuitement",
    },
    hero: {
      badge: "La solution scolaire n°1 en Afrique francophone",
      titleA: "La plateforme qui transforme la gestion scolaire en",
      titleHighlight: "Afrique.",
      subtitle: "Automatisez les notes, les bulletins, les paiements et la communication avec les parents depuis une seule plateforme conçue pour les écoles africaines.",
      ctaDemo: "Demander une démonstration",
      ctaTrial: "Essayer gratuitement",
      noCard: "Aucune carte bancaire requise.",
      trust: ["Mobile Money intégré", "IA éducative", "Support local", "Sécurisé & fiable"],
      preview: {
        greeting: "Bonjour, Directeur 👋",
        caption: "Voici ce qui se passe dans votre école aujourd'hui.",
        students: "Élèves", teachers: "Enseignants", recovery: "Taux de recouvrement", revenue: "Revenus du mois",
        chart: "Évolution des revenus (FCFA)",
        aiAlert: "Alertes IA", aiAlertText: "5 élèves à risque détectés", aiAlertAction: "Intervention recommandée",
        bulletins: "Bulletins générés ce mois", absences: "Absences aujourd'hui",
      },
    },
    pains: {
      titleA: "Les écoles africaines méritent",
      titleHighlight: "mieux que les fichiers Excel et les cahiers.",
      items: [
        { title: "Erreurs de calcul", desc: "Notes incorrectes et moyennes faussées" },
        { title: "Retards de bulletins", desc: "Bulletins générés trop tard et impression manuelle" },
        { title: "Impayés difficiles", desc: "Suivi des paiements compliqué et inefficace" },
        { title: "Communication compliquée", desc: "Parents mal informés et insatisfaits" },
        { title: "Surcharge administrative", desc: "Trop de tâches manuelles et perte de temps" },
      ],
    },
    features: {
      titleA: "Une seule plateforme pour gérer",
      titleHighlight: "toute votre école.",
      items: [
        { title: "Gestion des élèves", desc: "Profils complets, inscriptions, classes et suivi académique." },
        { title: "Notes et bulletins", desc: "Calcul automatique des moyennes et génération PDF en un clic." },
        { title: "Paiements Mobile Money", desc: "Orange Money, MTN Money et Moov Money intégrés." },
        { title: "Portail parents", desc: "Consultation des résultats, paiements et absences en temps réel." },
        { title: "Intelligence artificielle", desc: "Détection des élèves à risque et recommandations personnalisées." },
        { title: "Analytics avancés", desc: "Indicateurs clés pour piloter la performance de votre établissement." },
      ],
    },
    stats: {
      title: "Ils nous font déjà confiance",
      subtitle: "Des écoles utilisent EvalScol Africa au quotidien.",
      items: [
        { value: "800+", label: "Écoles partenaires" },
        { value: "60 000+", label: "Élèves utilisateurs" },
        { value: "92%", label: "Taux de satisfaction" },
        { value: "15+", label: "Pays en Afrique" },
      ],
      partnersTitle: "Nos écoles partenaires",
      partners: ["Groupe Scolaire La Pépinière", "Collège Moderne d'Abidjan", "Institut Excellence Dakar", "Lycée Victoire Cotonou", "Groupe Scolaire El Hadj Malick", "Collège Les Champions"],
    },
    footer: {
      tagline: "La plateforme qui simplifie la gestion scolaire et améliore les performances des écoles africaines.",
      product: "Produit", resources: "Ressources", support: "Support", company: "Entreprise", contact: "Contactez-nous",
      productLinks: [{ label: "Fonctionnalités", to: "/#fonctionnalites" }, { label: "Tarifs", to: "/pricing" }, { label: "Sécurité", to: "/privacy-policy" }, { label: "Intégrations", to: "/api-docs" }],
      resourceLinks: [{ label: "Blog", to: "/about" }, { label: "Guides", to: "/guide" }, { label: "Centre d'aide", to: "/user-manual" }, { label: "Webinaires", to: "/getting-started" }],
      supportLinks: [{ label: "Contact", to: "/dashboard/support" }, { label: "FAQ", to: "/parent-guide" }, { label: "Assistance", to: "/dashboard/support" }, { label: "Devenir partenaire", to: "/about" }],
      companyLinks: [{ label: "À propos", to: "/about" }, { label: "Carrières", to: "/about" }, { label: "Presse", to: "/about" }, { label: "Mentions légales", to: "/mentions-legales" }, { label: "CGU", to: "/cgu" }],
      rights: "© 2026 EvalScol Africa. Tous droits réservés.",
      madeFor: "Conçu avec ❤️ pour l'éducation en Afrique.",
    },
  },
  en: {
    nav: {
      home: "Home", features: "Features", pricing: "Pricing",
      demo: "Demo", testimonials: "Testimonials", contact: "Contact",
      login: "Sign in", start: "Start for free",
    },
    hero: {
      badge: "The #1 school solution in French-speaking Africa",
      titleA: "The platform that transforms school management in",
      titleHighlight: "Africa.",
      subtitle: "Automate grades, report cards, payments and parent communication from a single platform built for African schools.",
      ctaDemo: "Request a demo",
      ctaTrial: "Try for free",
      noCard: "No credit card required.",
      trust: ["Mobile Money built in", "Educational AI", "Local support", "Secure & reliable"],
      preview: {
        greeting: "Hello, Principal 👋",
        caption: "Here's what's happening in your school today.",
        students: "Students", teachers: "Teachers", recovery: "Collection rate", revenue: "Monthly revenue",
        chart: "Revenue trend (FCFA)",
        aiAlert: "AI alerts", aiAlertText: "5 at-risk students detected", aiAlertAction: "Intervention recommended",
        bulletins: "Report cards this month", absences: "Absences today",
      },
    },
    pains: {
      titleA: "African schools deserve",
      titleHighlight: "better than Excel files and notebooks.",
      items: [
        { title: "Calculation errors", desc: "Incorrect grades and skewed averages" },
        { title: "Late report cards", desc: "Reports generated too late, printed by hand" },
        { title: "Hard-to-track unpaid fees", desc: "Complicated and inefficient payment tracking" },
        { title: "Difficult communication", desc: "Poorly informed, dissatisfied parents" },
        { title: "Administrative overload", desc: "Too many manual tasks and wasted time" },
      ],
    },
    features: {
      titleA: "One platform to manage",
      titleHighlight: "your entire school.",
      items: [
        { title: "Student management", desc: "Full profiles, enrolment, classes and academic tracking." },
        { title: "Grades & report cards", desc: "Automatic averages and one-click PDF generation." },
        { title: "Mobile Money payments", desc: "Orange Money, MTN Money and Moov Money built in." },
        { title: "Parent portal", desc: "Real-time access to results, payments and absences." },
        { title: "Artificial intelligence", desc: "At-risk student detection and personalized recommendations." },
        { title: "Advanced analytics", desc: "Key indicators to drive your school's performance." },
      ],
    },
    stats: {
      title: "They already trust us",
      subtitle: "Schools use EvalScol Africa every day.",
      items: [
        { value: "800+", label: "Partner schools" },
        { value: "60,000+", label: "Student users" },
        { value: "92%", label: "Satisfaction rate" },
        { value: "15+", label: "African countries" },
      ],
      partnersTitle: "Our partner schools",
      partners: ["Groupe Scolaire La Pépinière", "Collège Moderne d'Abidjan", "Institut Excellence Dakar", "Lycée Victoire Cotonou", "Groupe Scolaire El Hadj Malick", "Collège Les Champions"],
    },
    footer: {
      tagline: "The platform that simplifies school management and improves the performance of African schools.",
      product: "Product", resources: "Resources", support: "Support", company: "Company", contact: "Contact us",
      productLinks: [{ label: "Features", to: "/#fonctionnalites" }, { label: "Pricing", to: "/pricing" }, { label: "Security", to: "/privacy-policy" }, { label: "Integrations", to: "/api-docs" }],
      resourceLinks: [{ label: "Blog", to: "/about" }, { label: "Guides", to: "/guide" }, { label: "Help center", to: "/user-manual" }, { label: "Webinars", to: "/getting-started" }],
      supportLinks: [{ label: "Contact", to: "/dashboard/support" }, { label: "FAQ", to: "/parent-guide" }, { label: "Assistance", to: "/dashboard/support" }, { label: "Become a partner", to: "/about" }],
      companyLinks: [{ label: "About", to: "/about" }, { label: "Careers", to: "/about" }, { label: "Press", to: "/about" }, { label: "Legal notice", to: "/mentions-legales" }, { label: "Terms (CGU)", to: "/cgu" }],
      rights: "© 2026 EvalScol Africa. All rights reserved.",
      madeFor: "Built with ❤️ for education in Africa.",
    },
  },
};

const painIcons = [Calculator, Clock, Wallet, MessageSquareWarning, CalendarX2];
const featureIcons = [Users, ClipboardCheck, CreditCard, GraduationCap, Brain, TrendingUp];
const trustIcons = [Smartphone, Sparkles, Headset, ShieldCheck];

const Index = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (!id) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 50);
    return () => window.clearTimeout(t);
  }, [location.hash, location.key]);
  const c = language === "fr" ? COPY.fr : COPY.en;

  const navLinks = [
    { label: c.nav.home, to: "/" },
    { label: c.nav.features, to: "/#fonctionnalites" },
    { label: c.nav.pricing, to: "/pricing" },
    { label: c.nav.demo, to: "/dashboard/support" },
    { label: c.nav.testimonials, to: "/#confiance" },
    { label: c.nav.contact, to: "/about" },
  ];

  return (
    <>
      <Seo
        title="EvalScol Africa | Logiciel Gestion Scolaire Côte d'Ivoire"
        description="Plateforme SaaS de gestion scolaire avec IA pour l'Afrique : notes, bulletins PDF, portail parent et paiements mobile money."
        path="/"
      />
      <div className="min-h-screen bg-background">
        {/* ===== Navigation bar ===== */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="EvalScol Africa" className="h-10 w-auto object-contain" width={73} height={40} />
              <span className="text-lg font-bold text-foreground">EvalScol Africa</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6" aria-label="Navigation principale">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
              <Button variant="outline" onClick={() => navigate('/auth')}>
                {c.nav.login}
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => navigate('/auth')}>
                {c.nav.start}
              </Button>
            </div>

            <button
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-border bg-background px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 pt-2">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" onClick={() => navigate('/auth')}>{c.nav.login}</Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => navigate('/auth')}>
                  {c.nav.start}
                </Button>
              </div>
            </div>
          )}
        </header>

        {/* ===== Hero ===== */}
        <section className="container mx-auto px-4 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center max-w-7xl mx-auto">
            <div>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {c.hero.badge}
              </motion.div>

              <motion.h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-5"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
              >
                {c.hero.titleA}{" "}
                <span className="text-primary">{c.hero.titleHighlight}</span>
              </motion.h1>

              <motion.p
                className="text-base lg:text-lg text-muted-foreground mb-8 max-w-xl"
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
              >
                {c.hero.subtitle}
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-3 mb-4"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.24 }}
              >
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate('/dashboard/support')}
                >
                  {c.hero.ctaDemo}
                  <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary/10 font-semibold px-6"
                  onClick={() => navigate('/auth')}
                >
                  {c.hero.ctaTrial}
                  <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                </Button>
              </motion.div>
              <p className="text-sm text-muted-foreground mb-8">{c.hero.noCard}</p>

              <motion.ul
                className="flex flex-wrap gap-x-6 gap-y-2"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.07, delayChildren: 0.3 } } }}
              >
                {c.hero.trust.map((item, i) => {
                  const Icon = trustIcons[i];
                  return (
                    <motion.li
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                      variants={{ hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 8 }, visible: { opacity: 1, y: 0 } }}
                    >
                      <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                      <span>{item}</span>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </div>

            {/* Dashboard preview card */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="rounded-2xl border border-border bg-card shadow-2xl p-5 sm:p-6"
              aria-label={c.hero.preview.greeting}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-foreground">{c.hero.preview.greeting}</p>
                  <p className="text-xs text-muted-foreground">{c.hero.preview.caption}</p>
                </div>
                <Bell className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: c.hero.preview.students, value: "1 250", trend: "+12", icon: Users, tone: "text-primary" },
                  { label: c.hero.preview.teachers, value: "98", trend: "+3", icon: GraduationCap, tone: "text-accent" },
                  { label: c.hero.preview.recovery, value: "95%", trend: "+8%", icon: CheckCircle2, tone: "text-accent" },
                  { label: c.hero.preview.revenue, value: "12,5M", trend: "+18%", icon: TrendingUp, tone: "text-primary" },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-lg border border-border bg-background p-3">
                    <kpi.icon className={`h-4 w-4 mb-1 ${kpi.tone}`} aria-hidden="true" />
                    <p className="text-lg font-bold text-foreground leading-none">{kpi.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{kpi.label}</p>
                    <p className="text-[11px] font-medium text-accent">{kpi.trend}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border bg-background p-3 mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">{c.hero.preview.chart}</p>
                <svg viewBox="0 0 300 80" className="w-full h-20" role="img" aria-label={c.hero.preview.chart}>
                  <polyline
                    points="0,60 40,55 80,58 120,40 160,35 200,42 240,25 300,15"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="0,60 40,55 80,58 120,40 160,35 200,42 240,25 300,15 300,80 0,80"
                    fill="hsl(var(--primary) / 0.08)"
                    stroke="none"
                  />
                </svg>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
                    <p className="text-xs font-semibold text-destructive">{c.hero.preview.aiAlert}</p>
                  </div>
                  <p className="text-xs text-foreground">{c.hero.preview.aiAlertText}</p>
                  <p className="text-[11px] text-muted-foreground">{c.hero.preview.aiAlertAction}</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                    <p className="text-xs font-semibold text-foreground">{c.hero.preview.bulletins}</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">320 <span className="text-[11px] font-medium text-accent">+45%</span></p>
                  <p className="text-[11px] text-muted-foreground">{c.hero.preview.absences} : 12</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== Pain points ===== */}
        <MotionReveal>
          <section className="border-y border-border bg-muted/40 py-14 lg:py-20">
            <div className="container mx-auto px-4 max-w-7xl">
              <h2 className="text-2xl lg:text-4xl font-bold text-center text-foreground mb-10 leading-tight">
                {c.pains.titleA}{" "}
                <span className="text-accent">{c.pains.titleHighlight}</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {c.pains.items.map((pain, i) => {
                  const Icon = painIcons[i];
                  return (
                    <motion.div
                      key={pain.title}
                      whileHover={reduceMotion ? undefined : { y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl border border-border bg-card p-5 text-center shadow-sm"
                    >
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                        <Icon className="h-6 w-6 text-destructive" aria-hidden="true" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm mb-1">{pain.title}</h3>
                      <p className="text-xs text-muted-foreground">{pain.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </MotionReveal>

        {/* ===== Features ===== */}
        <MotionReveal>
          <section id="fonctionnalites" className="py-14 lg:py-20">
            <div className="container mx-auto px-4 max-w-7xl">
              <h2 className="text-2xl lg:text-4xl font-bold text-center text-foreground mb-10 leading-tight">
                {c.features.titleA}{" "}
                <span className="text-primary">{c.features.titleHighlight}</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {c.features.items.map((feature, i) => {
                  const Icon = featureIcons[i];
                  return (
                    <motion.div
                      key={feature.title}
                      whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 transition-colors"
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </MotionReveal>

        {/* ===== Stats & partners ===== */}
        <MotionReveal>
          <section id="confiance" className="border-y border-border bg-muted/40 py-14 lg:py-20">
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="grid lg:grid-cols-4 gap-8 items-center mb-12">
                <div className="rounded-xl bg-footer p-6 text-footer-foreground lg:col-span-1">
                  <h2 className="text-xl font-bold mb-2">{c.stats.title}</h2>
                  <p className="text-sm opacity-90">{c.stats.subtitle}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:col-span-3">
                  {c.stats.items.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-2xl lg:text-3xl font-bold text-primary">{stat.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-6">
                {c.stats.partnersTitle}
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {c.stats.partners.map((partner) => (
                  <div
                    key={partner}
                    className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
                  >
                    <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
                    {partner}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </MotionReveal>

        {/* ===== Footer ===== */}
        <footer className="bg-footer text-footer-foreground">
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <img src="/logo.png" alt="EvalScol Africa" className="h-10 w-auto object-contain" width={73} height={40} />
                  <span className="text-lg font-bold">EvalScol Africa</span>
                </div>
                <p className="text-sm opacity-80 mb-6 max-w-xs">{c.footer.tagline}</p>
                <div className="flex items-center gap-2">
                  {[
                    { href: FACEBOOK_URL, label: "EvalScol Africa sur Facebook", icon: Facebook },
                    { href: WHATSAPP_URL, label: "WhatsApp EvalScol Africa", icon: MessageCircle },
                    { href: "mailto:support@siteteck.com", label: "support@siteteck.com", icon: Mail },
                  ].map(({ href, label, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                      title={label}
                      aria-label={label}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-footer-foreground/25 text-footer-foreground/80 transition-colors hover:border-footer-foreground/60 hover:text-footer-foreground"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>

              {[
                { title: c.footer.product, links: c.footer.productLinks },
                { title: c.footer.resources, links: c.footer.resourceLinks },
                { title: c.footer.support, links: c.footer.supportLinks },
                { title: c.footer.company, links: c.footer.companyLinks },
              ].map((col) => (
                <div key={col.title}>
                  <h3 className="font-semibold mb-4">{col.title}</h3>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link to={link.to} className="text-sm opacity-80 transition-opacity hover:opacity-100 hover:underline">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-xl border border-footer-foreground/20 bg-footer-foreground/5 p-5">
              <h3 className="font-semibold mb-4">{c.footer.contact}</h3>
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 opacity-80 hover:opacity-100 hover:underline">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  +225 01 01 82 13 29
                </a>
                <a href="mailto:support@siteteck.com" className="flex items-center gap-2 opacity-80 hover:opacity-100 hover:underline">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  support@siteteck.com
                </a>
                <span className="flex items-center gap-2 opacity-80">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Abidjan, Côte d'Ivoire
                </span>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-3 border-t border-footer-foreground/20 pt-6 text-center">
              <p className="text-sm opacity-80">{c.footer.rights}</p>
              <p className="text-sm opacity-80">{c.footer.madeFor}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <img src={logo2kk.url} alt="Logo 2KK Technologie" className="h-16 w-auto object-contain" loading="lazy" />
                <span className="text-xs opacity-80">
                  {language === "fr" ? "Plateforme conçue par" : "Platform designed by"}{" "}
                  <span className="font-semibold opacity-100">2KK Technologie</span>
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
