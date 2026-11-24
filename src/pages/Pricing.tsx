import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Star, Crown, Sparkles, Users, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import Seo from "@/components/Seo";

import { PUBLIC_PLANS, fcfa } from "@/lib/publicPricing";

const productJsonLd = PUBLIC_PLANS.filter((p) => p.monthly > 0).map((p) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: `EvalScol ${p.name}`,
  description: `Plan ${p.name} EvalScol Africa — ${p.students}.`,
  brand: { "@type": "Brand", name: "EvalScol Africa" },
  offers: [
    { "@type": "Offer", price: String(p.monthly), priceCurrency: "XOF", availability: "https://schema.org/InStock", url: "https://evalscolafrica.siteteck.com/pricing",
      priceSpecification: { "@type": "UnitPriceSpecification", price: String(p.monthly), priceCurrency: "XOF", unitCode: "MON" } },
    { "@type": "Offer", price: String(p.yearly), priceCurrency: "XOF", availability: "https://schema.org/InStock", url: "https://evalscolafrica.siteteck.com/pricing",
      priceSpecification: { "@type": "UnitPriceSpecification", price: String(p.yearly), priceCurrency: "XOF", unitCode: "ANN" } },
  ],
}));

const ICONS: Record<string, { icon: typeof Star; color: string }> = {
  "free-trial": { icon: Sparkles, color: "text-primary" },
  standard: { icon: Check, color: "text-primary" },
  professional: { icon: Star, color: "text-primary" },
  enterprise: { icon: Crown, color: "text-primary" },
};

export default function Pricing() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <Seo
        title="Tarifs EvalScol Africa | Plans gestion scolaire"
        description="Découvrez les tarifs EvalScol Africa : essai gratuit 14 jours, Standard 29 990 FCFA/mois, Professional 59 990 FCFA/mois, Enterprise dès 149 990 FCFA/mois. Annuel : 1 mois offert. Offre de lancement pour les 5 premières écoles."
        path="/pricing"
        jsonLd={productJsonLd}
      />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-7xl">
        <header className="mb-12">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour
            </Button>
            <LanguageSwitcher />
          </div>

          <div className="text-center">
            <img src="/logo.png" alt="EvalScol Logo" className="h-28 w-auto mx-auto mb-4" />
            <Badge variant="default" className="mb-4 whitespace-normal text-center">Tarifs 2026 — pensés pour l'Afrique</Badge>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              Des tarifs simples pour chaque école
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Essai gratuit 14 jours, puis à partir de 29 990 FCFA / mois. Sans engagement, payez au mois ou à l'année.
            </p>
          </div>
        </header>

        <div role="note" className="mb-8 rounded-2xl border-2 border-primary bg-primary text-primary-foreground px-4 py-5 text-center shadow-lg">
          <p className="text-lg sm:text-2xl font-bold flex items-center justify-center gap-2 flex-wrap">
            <Sparkles className="h-6 w-6" /> Offre de lancement : 1 mois offert pour les 5 premières écoles abonnées !
          </p>
          <p className="text-sm sm:text-base opacity-90 mt-1">Places limitées — abonnez-vous dès maintenant pour en profiter.</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={!isYearly ? "font-semibold" : "text-muted-foreground"}>Mensuel</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} aria-label="Facturation annuelle" />
          <span className={isYearly ? "font-semibold" : "text-muted-foreground"}>
            Annuel <Badge variant="secondary" className="ml-2">1 mois offert</Badge>
          </span>
        </div>

        {/* Plans */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PUBLIC_PLANS.map((plan) => {
            const { icon: Icon, color } = ICONS[plan.id];
            const price = isYearly ? plan.yearly : plan.monthly;
            return (
              <Card key={plan.id} className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary"><Star className="h-3 w-3 mr-1" /> Populaire</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-background border"><Icon className={`h-6 w-6 ${color}`} /></div>
                    <Badge variant="outline">{plan.students}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">
                      {plan.id === "enterprise" && <span className="text-base font-normal text-muted-foreground">à partir de </span>}
                      {fcfa(price)} <span className="text-base font-normal text-muted-foreground">FCFA</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{price === 0 ? "Gratuit pendant 14 jours" : `par ${isYearly ? "an" : "mois"}`}</p>
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
                  <div className="p-3 bg-accent/10 rounded-lg mb-4"><p className="text-xs text-muted-foreground">{plan.ideal}</p></div>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate(plan.id === "enterprise" ? "/support" : "/auth")}>
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
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
              ["Le portail parent est-il inclus ?",
                "Oui, le portail parent est inclus dans tous les plans, y compris l'essai gratuit."],
              ["Que se passe-t-il si je dépasse ma limite d'élèves ?",
                "Vous êtes invité à passer au plan supérieur ; l'inscription de nouveaux élèves est bloquée au-delà de la limite."],
              ["L'IA est-elle incluse ?",
                "L'AI Assistant et la détection des élèves à risque sont inclus à partir du plan Professional."],
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
            <h2 className="text-3xl font-bold mb-4">Prêt à digitaliser votre école ?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Démarrez votre essai gratuit de 14 jours. Aucune carte bancaire requise.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button className="w-full sm:w-auto whitespace-normal h-auto min-h-11" size="lg" onClick={() => navigate("/auth")}>Démarrer l'essai gratuit</Button>
              <Button className="w-full sm:w-auto whitespace-normal h-auto min-h-11" size="lg" variant="outline" onClick={() => navigate("/support")}>Parler à un conseiller</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
