import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/lib/logger";

interface ManagePaymentDialogProps {
  studentId: string;
  studentName: string;
  currentTuitionFee?: number;
  currentAmountPaid?: number;
  currentPaymentStatus?: string;
  currentPaymentMethod?: string;
  currentDueDate?: string;
  currentNotes?: string;
  onPaymentUpdated: () => void;
  children: React.ReactNode;
}

export function ManagePaymentDialog({
  studentId,
  studentName,
  currentTuitionFee = 0,
  currentAmountPaid = 0,
  currentPaymentStatus = 'unpaid',
  currentPaymentMethod,
  currentDueDate,
  currentNotes,
  onPaymentUpdated,
  children,
}: ManagePaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tuitionFee, setTuitionFee] = useState(currentTuitionFee.toString());
  const [amountPaid, setAmountPaid] = useState(currentAmountPaid.toString());
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [paymentMethod, setPaymentMethod] = useState(currentPaymentMethod || '');
  const [dueDate, setDueDate] = useState(currentDueDate || '');
  const [notes, setNotes] = useState(currentNotes || '');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tuitionFeeNum = parseFloat(tuitionFee) || 0;
      const amountPaidNum = parseFloat(amountPaid) || 0;

      // Calculer automatiquement le statut de paiement
      let finalStatus = paymentStatus;
      if (amountPaidNum === 0) {
        finalStatus = 'unpaid';
      } else if (amountPaidNum >= tuitionFeeNum && tuitionFeeNum > 0) {
        finalStatus = 'paid';
      } else if (amountPaidNum > 0 && amountPaidNum < tuitionFeeNum) {
        finalStatus = 'partial';
      }

      const { error } = await supabase
        .from('students')
        .update({
          tuition_fee: tuitionFeeNum,
          amount_paid: amountPaidNum,
          payment_status: finalStatus,
          payment_method: paymentMethod || null,
          payment_due_date: dueDate || null,
          payment_notes: notes || null,
        })
        .eq('id', studentId);

      if (error) {
        await logError('Failed to update payment', error, {
          component: 'ManagePaymentDialog',
          action: 'UPDATE_PAYMENT',
          metadata: { studentId },
        });
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le paiement",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Paiement mis à jour avec succès",
      });

      setOpen(false);
      onPaymentUpdated();
    } catch (error) {
      await logError('Unexpected error updating payment', error, {
        component: 'ManagePaymentDialog',
        action: 'UPDATE_PAYMENT',
      });
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const remainingAmount = (parseFloat(tuitionFee) || 0) - (parseFloat(amountPaid) || 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gérer le paiement</DialogTitle>
          <DialogDescription>
            Gérer la scolarité de {studentName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tuitionFee">Frais de scolarité (FCFA)</Label>
              <Input
                id="tuitionFee"
                type="number"
                step="0.01"
                min="0"
                value={tuitionFee}
                onChange={(e) => setTuitionFee(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amountPaid">Montant payé (FCFA)</Label>
              <Input
                id="amountPaid"
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                required
              />
            </div>

            {remainingAmount > 0 && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">
                  Reste à payer: {remainingAmount.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="paymentStatus">Statut de paiement</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Non payé</SelectItem>
                  <SelectItem value="partial">Paiement partiel</SelectItem>
                  <SelectItem value="paid">Payé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Moyen de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un moyen de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="orange_money">Orange Money</SelectItem>
                  <SelectItem value="mtn_money">MTN Mobile Money</SelectItem>
                  <SelectItem value="moov_money">Moov Money</SelectItem>
                  <SelectItem value="bank_card">Carte bancaire</SelectItem>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Date limite de paiement</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes sur le paiement..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
