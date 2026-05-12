import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Star, Crown, Sparkles, Users, Zap, Shield, TrendingUp, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export default function Pricing() {
  const navigate = useNavigate();
  const [parentCount, setParentCount] = useState(500);
  const [adoption, setAdoption] = useState(70);

  const plans = [
    {
      id: "decouverte",
      name: "Découverte",
      description: "Testez EvalScol pendant 30 jours",
      icon: Sparkles,
      iconColor: "text-blue-500",
      price: 0,
      priceLabel: "Gratuit 30 jours",
      badge: "Essai sans CB",
      badgeVariant: "secondary" as const,
      features: [
        "Jusqu'à 100 élèves",
        "Gestion élèves, classes, notes",
        "Bulletins PDF automatiques",
        "1 portail parent offert",
        "Support communautaire",
      ],
      ideal: "Idéal pour : tester avant de basculer",
      cta: "Démarrer l'essai",
    },
    {
      id: "essentiel",
      name: "Essentiel École",
      description: "Le tarif école le plus compétitif d'Afrique francophone",
      icon: Check,
      iconColor: "text-green-500",
      price: 50000,
      priceLabel: "50 000 FCFA / an",
      badge: "vs concurrent 55 000 FCFA",
      badgeVariant: "outline" as const,
      features: [
        "Élèves illimités côté école",
        "Notes, bulletins, classements automatiques",
        "Gestion enseignants & emploi du temps",
        "Paiements Paystack (Orange, MTN, Moov, Wave)",
        "Détection IA des élèves à risque (inclus)",
        "Support email + WhatsApp",
      ],
      ideal: "Idéal pour : écoles primaires & collèges",
      cta: "Choisir Essentiel",
    },
    {
      id: "pro",
      name: "Pro IA",
      description: "Toute la puissance de l'IA pédagogique",
      icon: Star,
      iconColor: "text-yellow-500",
      price: 120000,
      priceLabel: "120 000 FCFA / an",
      badge: "Le plus populaire",
      badgeVariant: "default" as const,
      popular: true,
      features: [
        "Tout l'Essentiel École",
        "AI Assistant (génération exercices, sujets, corrigés)",
        "Analytics avancés & prédictions de réussite",
        "Bulletins personnalisés au logo de l'école",
        "API REST & Webhooks",
        "Support prioritaire 12h",
      ],
      ideal: "Idéal pour : collèges & lycées modernes",
      cta: "Passer au Pro IA",
    },
    {
      id: "secondaire",
      name: "Secondaire Premium IA",
      description: "Pensé pour collèges & lycées avec besoins avancés",
      icon: GraduationCap,
      iconColor: "text-indigo-500",
      price: 120000,
      priceLabel: "120 000 FCFA / an",
      badge: "Spécial Secondaire · 3 000 FCFA/parent",
      badgeVariant: "default" as const,
      features: [
        "Élèves illimités · multi-niveaux (6e → Tle)",
        "Coefficients & moyennes pondérées (BEPC / BAC)",
        "AI Assistant : sujets, corrigés, exercices auto",
        "Détection IA des élèves à risque + remédiation",
        "Analytics prédictifs de réussite aux examens",
        "Bulletins officiels personnalisés au logo",
        "Portail parent premium : 3 000 FCFA / parent / an",
        "API REST, Webhooks & Support prioritaire 12h",
      ],
      ideal: "Idéal pour : collèges, lycées & complexes scolaires",
      cta: "Choisir Secondaire IA",
    },
    {
      id: "groupe",
      name: "Groupe Scolaire",
      description: "Multi-établissements & SLA dédié",
      icon: Crown,
      iconColor: "text-purple-500",
      price: null,
      priceLabel: "Sur devis",
      badge: "À partir de 250 000 FCFA/an",
      badgeVariant: "secondary" as const,
      features: [
        "Tout le Pro IA",
        "Multi-écoles & multi-campus",
        "Tableau de bord groupe (Command Center)",
        "Formation sur site incluse",
        "SLA 99,9% & support 24/7",
        "Développements sur mesure",
      ],
      ideal: "Idéal pour : réseaux & fondations éducatives",
      cta: "Demander un devis",
    },
  ];

  const parentPrice = 2500;
  const totalParents = Math.round((parentCount * adoption) / 100);
  const revenueParents = totalParents * parentPrice;
  const competitor = totalParents * 2000 + 55000;
  const evalscolTotal = revenueParents + 50000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <header className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour
            </Button>
            <LanguageSwitcher />
          </div>

          <div className="text-center">
            <img src="/logo.png" alt="EvalScol Logo" className="h-28 w-auto mx-auto mb-4" />
            <Badge variant="default" className="mb-4">Nouveau modèle 2026 — pensé pour l'Afrique</Badge>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              École accessible. Portail parent premium.
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              50 000 FCFA / an pour l'école · 2 500 FCFA / an par parent. Plus simple, plus juste, plus rentable
              pour vous comme pour nous.
            </p>
          </div>
        </header>

        {/* Parent Portal Highlight */}
        <Card className="mb-12 border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="pt-8 pb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-3"><Users className="h-3 w-3 mr-1" /> Portail Parent Premium</Badge>
                <h2 className="text-3xl font-bold mb-3">2 500 FCFA / parent / an</h2>
                <p className="text-muted-foreground mb-4">
                  Notes en temps réel, bulletins PDF, paiement Mobile Money des frais de scolarité,
                  notifications instantanées, suivi multi-enfants. Payé par le parent ou collecté avec
                  les frais d'inscription.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /> Accès 24/7 depuis mobile</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /> Paiement Orange, MTN, Moov, Wave</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /> Bulletins PDF téléchargeables</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /> 100% des frais reversés à l'école si collecte directe</li>
                </ul>
              </div>

              <Card className="bg-background">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" /> Simulateur de revenus
                  </CardTitle>
                  <CardDescription>Combien votre école peut générer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nombre d'élèves : {parentCount}</label>
                    <input type="range" min="50" max="3000" step="50" value={parentCount}
                      onChange={(e) => setParentCount(Number(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Taux d'adoption parents : {adoption}%</label>
                    <input type="range" min="20" max="100" step="5" value={adoption}
                      onChange={(e) => setAdoption(Number(e.target.value))} className="w-full" />
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="text-sm text-muted-foreground">Revenu portails parents</div>
                    <div className="text-2xl font-bold text-primary">{revenueParents.toLocaleString("fr-FR")} FCFA / an</div>
                    <div className="text-xs text-muted-foreground mt-1">{totalParents} parents × 2 500 FCFA</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Coût total école + portails : <strong>{evalscolTotal.toLocaleString("fr-FR")} FCFA</strong>
                    <br />
                    <span className="text-muted-foreground/80">vs concurrent (55k + 2k/parent) : {competitor.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Plans */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card key={plan.id} className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary"><Star className="h-3 w-3 mr-1" /> Populaire</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-background border">
                      <Icon className={`h-6 w-6 ${plan.iconColor}`} />
                    </div>
                    {plan.badge && <Badge variant={plan.badgeVariant}>{plan.badge}</Badge>}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">{plan.priceLabel}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 bg-accent/10 rounded-lg mb-4">
                    <p className="text-xs text-muted-foreground">{plan.ideal}</p>
                  </div>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate(plan.id === "groupe" ? "/support" : "/auth")}>
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Comparison */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Pourquoi EvalScol vs les autres ?</h2>
          <Card>
            <CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Fonctionnalité</th>
                    <th className="text-center p-3">EvalScol Essentiel</th>
                    <th className="text-center p-3 text-muted-foreground">Concurrent type</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    ["Tarif école / an", "50 000 FCFA", "55 000 FCFA"],
                    ["Tarif parent / an", "2 500 FCFA", "2 000 FCFA"],
                    ["IA détection élèves à risque", "✅ Inclus", "❌"],
                    ["Mobile Money natif (Orange, MTN, Moov, Wave)", "✅ Paystack", "Partiel"],
                    ["Bulletins PDF personnalisés", "✅", "✅"],
                    ["Multi-tenant sécurisé (RLS)", "✅", "❌"],
                    ["API & Webhooks", "✅ (Pro IA)", "❌"],
                    ["Support WhatsApp francophone", "✅", "Variable"],
                  ].map(([k, a, b], i) => (
                    <tr key={i}>
                      <td className="p-3 font-medium">{k}</td>
                      <td className="p-3 text-center text-primary font-semibold">{a}</td>
                      <td className="p-3 text-center text-muted-foreground">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        {/* Trust badges */}
        <section className="mb-16 grid md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: "Données souveraines", text: "Hébergement Afrique, conformité RGPD, RLS multi-tenant." },
            { icon: Zap, title: "Activé en 24h", text: "Onboarding accompagné, import élèves Excel inclus." },
            { icon: Users, title: "+ de 50 écoles partenaires", text: "Côte d'Ivoire, Sénégal, Bénin, Togo." },
          ].map((t, i) => (
            <Card key={i}>
              <CardContent className="pt-6 text-center">
                <t.icon className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.text}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Questions fréquentes</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              ["Qui paie les 2 500 FCFA du portail parent ?",
                "Au choix de l'école : soit le parent paie directement via Mobile Money, soit l'école collecte avec les frais d'inscription et nous reverse via Paystack."],
              ["Pourquoi un tarif école si bas ?",
                "Nous voulons rendre EvalScol accessible à toutes les écoles d'Afrique francophone. Notre modèle est volontairement aligné sur le marché local."],
              ["L'IA est-elle vraiment incluse dans l'Essentiel ?",
                "Oui, la détection des élèves à risque est incluse. Pour la génération de contenu pédagogique (sujets, exercices), il faut le plan Pro IA."],
              ["Puis-je changer de plan plus tard ?",
                "Oui, à tout moment. Aucun engagement. Vous ne payez que la différence au prorata."],
            ].map(([q, a], i) => (
              <Card key={i}>
                <CardHeader><CardTitle className="text-lg">{q}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{a}</p></CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à digitaliser votre école pour 50 000 FCFA / an ?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Démarrez votre essai gratuit 30 jours. Aucune carte bancaire requise.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/auth")}>Démarrer l'essai gratuit</Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/support")}>Parler à un conseiller</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
