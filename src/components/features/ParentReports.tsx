import { Card } from "@/components/ui/card";
import { FileText, TrendingUp, Bell, Shield, Smartphone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import parentsImg from "@/assets/feature-parents.jpg";
export const ParentReports = () => {
  const navigate = useNavigate();
  const features = [{
    icon: FileText,
    title: "Bulletins Détaillés",
    description: "Accès complet aux bulletins scolaires avec notes, appréciations et commentaires des enseignants"
  }, {
    icon: TrendingUp,
    title: "Suivi de Progrès",
    description: "Graphiques et statistiques montrant l'évolution des performances de l'élève au fil du temps"
  }, {
    icon: Bell,
    title: "Alertes Automatiques",
    description: "Notifications instantanées pour les nouveaux bulletins, absences ou événements importants"
  }, {
    icon: Shield,
    title: "Accès Sécurisé",
    description: "Connexion sécurisée avec authentification pour protéger les données de votre enfant"
  }, {
    icon: Smartphone,
    title: "Multi-Plateforme",
    description: "Accessible depuis ordinateur, tablette ou smartphone pour consulter les rapports n'importe où"
  }, {
    icon: Clock,
    title: "Historique Complet",
    description: "Archives de tous les bulletins et rapports depuis le début de l'année scolaire"
  }];
  return <section className="py-16 px-4 bg-secondary">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/20 rounded-full border border-primary/30">
            <span className="text-sm font-semibold text-primary">Espace Parents</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-[hsl(280,100%,70%)] to-primary bg-clip-text text-transparent">
            Rapports Accessibles aux Parents
          </h2>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            Tenez-vous informés du progrès de votre enfant avec un accès direct et sécurisé à tous
            les bulletins et rapports scolaires
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => <Card key={index} className="p-6 bg-card border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-foreground/60 text-sm">{feature.description}</p>
                </div>
              </div>
            </Card>)}
        </div>

        <Card className="overflow-hidden bg-card border-primary/20">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-64 md:h-auto min-h-[280px]">
              <img
                src={parentsImg}
                alt="Parent et enfant consultant le portail parent"
                width={1280}
                height={896}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-accent/20" />
            </div>
            <div className="p-8 flex flex-col justify-center">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3 text-foreground">
                Interface Parent Intuitive
              </h3>
              <p className="text-foreground/70 mb-4">
                Une interface spécialement conçue pour les parents, simple à utiliser et disponible 
                en plusieurs langues locales. Consultez les résultats, téléchargez les bulletins 
                et communiquez avec les enseignants en quelques clics.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-foreground/80">Vue d'ensemble du parcours scolaire</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-foreground/80">Téléchargement PDF des bulletins</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-foreground/80">Comparaison avec les moyennes de classe</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-foreground/80">Recommandations personnalisées</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3 min-w-[200px]">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate("/parent-portal")}
              >
                Accéder au Portail Parent
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-foreground/30 text-foreground hover:bg-foreground/10" 
                onClick={() => navigate("/parent-guide")}
              >
                Guide Parents
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>;
};