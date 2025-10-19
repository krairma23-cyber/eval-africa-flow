import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ArrowRight, ArrowLeft, School, Building2, BookOpen, ClipboardCheck } from "lucide-react";
import { SchoolInfoStep } from "@/components/onboarding/SchoolInfoStep";
import { CampusSetupStep } from "@/components/onboarding/CampusSetupStep";
import { ProgramSetupStep } from "@/components/onboarding/ProgramSetupStep";
import { AssessmentTypesStep } from "@/components/onboarding/AssessmentTypesStep";
import { CompletionStep } from "@/components/onboarding/CompletionStep";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 1, title: "École", icon: School },
  { id: 2, title: "Campus", icon: Building2 },
  { id: 3, title: "Programmes", icon: BookOpen },
  { id: 4, title: "Évaluations", icon: ClipboardCheck },
  { id: 5, title: "Terminé", icon: CheckCircle2 },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [campusData, setCampusData] = useState<any>(null);
  const [programData, setProgramData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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
        title: "Configuration terminée !",
        description: "Votre école est prête à utiliser EvalScol",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/evalscol-logo.png" 
            alt="EvalScol Logo" 
            className="h-16 w-16 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue sur EvalScol
          </h1>
          <p className="text-muted-foreground">
            Configurons votre établissement en quelques étapes simples
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex flex-col items-center gap-2 ${index < currentStep ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all
                      ${index < currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : index === currentStep - 1 
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                        : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">{step.title}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`h-0.5 w-12 mx-2 transition-all ${
                      index < currentStep - 1 ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                {currentStep === 1 && (
                  <SchoolInfoStep 
                    onNext={handleNext}
                    onDataChange={setSchoolData}
                    initialData={schoolData}
                  />
                )}
                {currentStep === 2 && (
                  <CampusSetupStep 
                    onNext={handleNext}
                    onBack={handleBack}
                    onDataChange={setCampusData}
                    initialData={campusData}
                    schoolData={schoolData}
                  />
                )}
                {currentStep === 3 && (
                  <ProgramSetupStep 
                    onNext={handleNext}
                    onBack={handleBack}
                    onDataChange={setProgramData}
                    initialData={programData}
                    schoolData={schoolData}
                  />
                )}
                {currentStep === 4 && (
                  <AssessmentTypesStep 
                    onNext={handleNext}
                    onBack={handleBack}
                    schoolData={schoolData}
                  />
                )}
                {currentStep === 5 && (
                  <CompletionStep 
                    onComplete={handleComplete}
                    loading={loading}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Vous pourrez modifier ces paramètres plus tard dans les réglages</p>
        </div>
      </div>
    </div>
  );
}