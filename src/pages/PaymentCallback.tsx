import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      if (!reference) {
        toast.error("Référence de paiement manquante");
        navigate('/billing');
        return;
      }

      try {
        // Get pending payment info from localStorage
        const pendingPaymentStr = localStorage.getItem('pending_payment');
        if (!pendingPaymentStr) {
          toast.error("Informations de paiement manquantes");
          navigate('/billing');
          return;
        }

        const pendingPayment = JSON.parse(pendingPaymentStr);
        
        // Verify payment with Paystack
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('paystack-verify', {
          body: { reference }
        });

        if (verifyError || !verifyData?.status) {
          console.error('Payment verification error:', verifyError || verifyData);
          toast.error("Échec de la vérification du paiement");
          navigate('/billing');
          return;
        }

        // Activate subscription via secure edge function
        const { data: activateData, error: activateError } = await supabase.functions.invoke('activate-subscription', {
          body: {
            user_id: pendingPayment.user_id,
            plan_id: pendingPayment.plan_id,
            billing_period: pendingPayment.billing_period,
            payment_reference: reference
          }
        });

        if (activateError || !activateData?.success) {
          console.error('Subscription activation error:', activateError || activateData);
          toast.error("Erreur lors de l'activation de l'abonnement");
          navigate('/billing');
          return;
        }

        // Clear pending payment
        localStorage.removeItem('pending_payment');

        toast.success("Paiement vérifié et abonnement activé avec succès!");
        navigate('/billing');

      } catch (error) {
        console.error('Payment callback error:', error);
        toast.error("Une erreur est survenue lors du traitement du paiement");
        navigate('/billing');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">Vérification du paiement en cours...</p>
      </div>
    </div>
  );
}
