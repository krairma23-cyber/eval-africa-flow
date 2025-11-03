import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlanLimits {
  maxStudents: number;
  currentStudents: number;
  planId: string;
  planName: string;
  isLimitReached: boolean;
  isLimitExceeded: boolean;
  remainingStudents: number;
}

export function usePlanLimits() {
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkPlanLimits();
  }, []);

  const checkPlanLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user plan features
      const { data: features, error: featuresError } = await supabase
        .from('user_plan_features')
        .select('plan_id, max_students')
        .eq('user_id', user.id)
        .single();

      if (featuresError) {
        console.error('Error fetching plan features:', featuresError);
        return;
      }

      // Get current student count
      const { count: studentCount, error: countError } = await supabase
        .from('students')
        .select('id', { count: 'exact', head: true });

      if (countError) {
        console.error('Error counting students:', countError);
        return;
      }

      const maxStudents = features?.max_students || 30;
      const currentStudents = studentCount || 0;
      const planId = features?.plan_id || 'starter';
      
      const planNames: Record<string, string> = {
        starter: 'Starter',
        professional: 'Professional',
        enterprise: 'Enterprise'
      };

      const isLimitReached = currentStudents >= maxStudents;
      const isLimitExceeded = currentStudents > maxStudents;
      const remainingStudents = Math.max(0, maxStudents - currentStudents);

      setPlanLimits({
        maxStudents,
        currentStudents,
        planId,
        planName: planNames[planId] || 'Starter',
        isLimitReached,
        isLimitExceeded,
        remainingStudents
      });

      // Show warning if limit is exceeded
      if (isLimitExceeded) {
        toast({
          title: "⚠️ Limite du plan dépassée",
          description: `Vous avez ${currentStudents} élèves mais votre plan ${planNames[planId]} permet seulement ${maxStudents} élèves. Veuillez mettre à niveau votre plan.`,
          variant: "destructive",
        });
      } else if (isLimitReached) {
        toast({
          title: "⚠️ Limite du plan atteinte",
          description: `Vous avez atteint la limite de ${maxStudents} élèves de votre plan ${planNames[planId]}. Mettez à niveau pour ajouter plus d'élèves.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error checking plan limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAddStudent = () => {
    if (!planLimits) return false;
    return !planLimits.isLimitReached;
  };

  return {
    planLimits,
    loading,
    canAddStudent,
    refreshLimits: checkPlanLimits
  };
}
