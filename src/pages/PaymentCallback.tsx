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
        // Check for tuition payment first
        const pendingTuitionStr = localStorage.getItem('pending_tuition_payment');
        const pendingSubscriptionStr = localStorage.getItem('pending_payment');

        // Verify payment with Paystack
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('paystack-verify', {
          body: { reference }
        });

        if (verifyError || !verifyData?.status) {
          console.error('Payment verification error:', verifyError || verifyData);
          toast.error("Échec de la vérification du paiement");
          navigate(pendingTuitionStr ? '/parent-portal' : '/billing');
          return;
        }

        // Handle tuition payment
        if (pendingTuitionStr) {
          const pendingTuition = JSON.parse(pendingTuitionStr);

          const { data: processData, error: processError } = await supabase.functions.invoke('process-tuition-payment', {
            body: { reference }
          });

          if (processError || !processData?.success) {
            console.error('Tuition payment processing error:', processError || processData);
            toast.error("Erreur lors du traitement du paiement des frais de scolarité");
            navigate('/parent-portal');
            return;
          }

          localStorage.removeItem('pending_tuition_payment');
          toast.success(`Paiement des frais de scolarité réussi! Montant: ${processData.amount_paid.toLocaleString('fr-FR')} FCFA`);
          navigate('/parent-portal?payment=success');
          return;
        }

        // Handle subscription payment
        if (pendingSubscriptionStr) {
          const pendingPayment = JSON.parse(pendingSubscriptionStr);

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

          localStorage.removeItem('pending_payment');
          toast.success("Paiement vérifié et abonnement activé avec succès!");
          navigate('/billing');
          return;
        }

        // No pending payment found
        toast.error("Informations de paiement manquantes");
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">Vérification du paiement en cours...</p>
        <button
          onClick={() => navigate('/billing')}
          className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
        >
          J'ai terminé la transaction
        </button>
      </div>
    </div>
  );
}
