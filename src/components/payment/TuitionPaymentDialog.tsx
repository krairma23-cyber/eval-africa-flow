import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TuitionPaymentDialogProps {
  studentId: string;
  studentName: string;
  tuitionFee: number;
  amountPaid: number;
  paymentStatus: string;
  onPaymentCompleted?: () => void;
  children?: React.ReactNode;
}

export function TuitionPaymentDialog({
  studentId,
  studentName,
  tuitionFee,
  amountPaid,
  paymentStatus,
  onPaymentCompleted,
  children,
}: TuitionPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { toast } = useToast();

  const remainingBalance = Math.max(0, tuitionFee - amountPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amountNum = parseFloat(amount);

      if (isNaN(amountNum) || amountNum <= 0) {
        toast({
          title: "Erreur",
          description: "Veuillez entrer un montant valide",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (amountNum > remainingBalance) {
        toast({
          title: "Erreur",
          description: `Le montant ne peut pas dépasser le solde restant (${remainingBalance.toLocaleString('fr-FR')} FCFA)`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Initialisation du paiement",
        description: "Veuillez patienter...",
      });

      const { data, error } = await supabase.functions.invoke('student-tuition-payment', {
        body: {
          student_id: studentId,
          amount: amountNum,
          parent_email: parentEmail,
          parent_name: parentName,
          phone_number: phoneNumber || undefined,
          callback_url: `${window.location.origin}/parent-portal?payment=success`
        }
      });

      if (error) throw error;

      if (data.authorization_url) {
        // Store payment info in localStorage for callback processing
        localStorage.setItem('pending_tuition_payment', JSON.stringify({
          reference: data.reference,
          student_id: studentId,
          student_name: studentName,
          amount: amountNum,
          parent_email: parentEmail,
          parent_name: parentName
        }));

        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser le paiement",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case 'paid':
        return <Badge className="bg-green-500">Payé</Badge>;
      case 'partial':
        return <Badge variant="secondary">Paiement partiel</Badge>;
      default:
        return <Badge variant="destructive">Non payé</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
            Payer maintenant
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payer les frais de scolarité</DialogTitle>
          <DialogDescription>
            Paiement pour {studentName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Payment Summary */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Frais de scolarité</span>
              <span className="font-semibold">{tuitionFee.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Déjà payé</span>
              <span className="font-semibold">{amountPaid.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Reste à payer</span>
              <span className="font-bold text-lg text-primary">
                {remainingBalance.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Statut</span>
              {getStatusBadge()}
            </div>
          </div>

          {remainingBalance > 0 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="parentName">Nom du parent/tuteur *</Label>
                <Input
                  id="parentName"
                  placeholder="Nom complet"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="parentEmail">Email *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  placeholder="email@exemple.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Numéro de téléphone (Mobile Money)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+221 XX XXX XX XX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Montant à payer (FCFA) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  max={remainingBalance}
                  placeholder="Entrez le montant"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Maximum: {remainingBalance.toLocaleString('fr-FR')} FCFA
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payer {amount ? parseFloat(amount).toLocaleString('fr-FR') : '0'} FCFA
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

          {remainingBalance === 0 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-green-600">Frais de scolarité entièrement payés !</p>
              <p className="text-sm text-muted-foreground mt-1">
                Merci pour votre paiement
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
