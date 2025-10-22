import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Users, BookOpen, ClipboardCheck, Settings, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Onboarding() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      // Mark onboarding as complete
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Bienvenue sur EvalScol !",
        description: "Vous pouvez maintenant commencer à utiliser la plateforme",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      icon: Settings,
      title: "1. Configurez votre école",
      description: "Dans Réglages, ajoutez les informations de votre établissement",
    },
    {
      icon: Users,
      title: "2. Ajoutez vos enseignants et élèves",
      description: "Créez les profils de votre équipe et de vos étudiants",
    },
    {
      icon: BookOpen,
      title: "3. Organisez vos classes",
      description: "Créez vos classes, matières et programmes",
    },
    {
      icon: ClipboardCheck,
      title: "4. Commencez les évaluations",
      description: "Créez vos premières évaluations et suivez les résultats",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <Card className="border-primary/20">
          <CardContent className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-6 relative">
                <Sparkles className="h-10 w-10 text-primary-foreground" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse opacity-50" />
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Bienvenue sur EvalScol !
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                La plateforme intelligente de gestion des évaluations scolaires
              </p>
            </div>

            {/* Quick Start Guide */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Pour bien démarrer :
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border bg-card/50 hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <StepIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Features Highlight */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 mb-8">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Fonctionnalités principales
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>✨ Assistant IA intégré</div>
                <div>📊 Analytics prédictifs</div>
                <div>🎙️ Commandes vocales</div>
                <div>📱 Portail parent</div>
                <div>📈 Rapports automatiques</div>
                <div>🔒 Sécurité maximale</div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button 
                size="lg" 
                onClick={handleComplete} 
                disabled={loading}
                className="px-8"
              >
                {loading ? "Chargement..." : "Commencer à utiliser EvalScol"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Toutes les configurations sont disponibles dans les paramètres du tableau de bord
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}