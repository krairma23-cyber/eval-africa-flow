import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info, Target, CheckCircle2, TrendingUp, Users, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const AboutEvalScol = () => {
  const [open, setOpen] = useState(false);

  const problems = [
    {
      icon: Target,
      title: "Gestion manuelle inefficace",
      description: "Fin des registres papier et des calculs de moyennes à la main"
    },
    {
      icon: Users,
      title: "Manque de visibilité",
      description: "Les parents accèdent enfin aux résultats de leurs enfants en temps réel"
    },
    {
      icon: TrendingUp,
      title: "Absence d'analyse",
      description: "Identification automatique des élèves en difficulté et suivi des performances"
    },
    {
      icon: Globe,
      title: "Communication limitée",
      description: "Communication fluide entre administration, enseignants et parents"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <Info className="h-5 w-5" />
          À propos d'EvalScol
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            EvalScol Africa Flow
          </DialogTitle>
          <DialogDescription className="text-base lg:text-lg mt-4">
            La plateforme éducative moderne pour la gestion scolaire en Afrique
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* What is EvalScol */}
          <section>
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              Qu'est-ce qu'EvalScol ?
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              EvalScol Africa Flow est une plateforme SaaS (Software as a Service) complète de gestion scolaire spécialement conçue pour les établissements éducatifs en Afrique francophone. 
              Notre solution digitale transforme la gestion administrative et pédagogique des écoles en automatisant les processus d'évaluation, de suivi des élèves, et de communication avec les parents.
            </p>
          </section>

          {/* Problems it solves */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-accent" />
              Les problèmes que nous résolvons
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {problems.map((problem, index) => (
                <Card key={index} className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <problem.icon className="h-6 w-6 text-primary shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-2">{problem.title}</h4>
                        <p className="text-sm text-muted-foreground">{problem.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Key Benefits */}
          <section className="bg-accent/5 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Pourquoi choisir EvalScol ?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span><strong>100% Cloud :</strong> Accessible partout, sur tous les appareils, sans installation</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Adapté à l'Afrique :</strong> Conçu pour les réalités des établissements africains</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Support local :</strong> Équipe disponible en français, formée aux contextes locaux</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Économique :</strong> Plus besoin d'infrastructure coûteuse, paiement mensuel flexible</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Sécurisé :</strong> Données protégées, conformité RGPD, sauvegardes automatiques</span>
              </li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
