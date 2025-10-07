import { Card, CardContent } from "@/components/ui/card";
import { Globe, Clock, MessageCircle, Headphones } from "lucide-react";

const supportFeatures = [
  {
    icon: Globe,
    title: "Multilingue",
    description: "Interface en français, anglais et langues locales",
    details: "Wolof, Bambara, Ewe, Yoruba"
  },
  {
    icon: Clock,
    title: "Fuseau Horaire Local",
    description: "GMT/UTC adapté à l'Afrique de l'Ouest",
    details: "Dakar, Abidjan, Cotonou, Lomé"
  },
  {
    icon: MessageCircle,
    title: "Support en Temps Réel",
    description: "Équipe locale disponible pendant les heures de bureau",
    details: "Lun-Ven: 8h-18h (heure locale)"
  },
  {
    icon: Headphones,
    title: "Accompagnement Culturel",
    description: "Formation adaptée aux contextes éducatifs africains",
    details: "Programmes, calendriers, évaluations"
  }
];

export const LocalSupport = () => {
  return (
    <section className="py-12 lg:py-16 border-t border-border/50">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          Support Local, Expertise Globale
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Une plateforme conçue pour les écoles africaines, avec un accompagnement en français et dans vos langues locales
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {supportFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={index}
              className="border-accent/20 hover:border-accent/40 transition-all duration-300 bg-card/50 backdrop-blur-sm group"
            >
              <CardContent className="pt-6 text-center">
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Icon className="h-8 w-8 text-accent" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {feature.description}
                </p>

                <p className="text-xs text-accent font-medium">
                  {feature.details}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 border-accent/30">
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Globe className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">
                Présence Régionale
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-foreground">Sénégal 🇸🇳</p>
                <p className="text-xs text-muted-foreground">Bureau Dakar</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Côte d'Ivoire 🇨🇮</p>
                <p className="text-xs text-muted-foreground">Bureau Abidjan</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Bénin 🇧🇯</p>
                <p className="text-xs text-muted-foreground">Partenaire Cotonou</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Togo 🇹🇬</p>
                <p className="text-xs text-muted-foreground">Partenaire Lomé</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Support technique disponible en français • Horaires d'ouverture: GMT/UTC+0
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
