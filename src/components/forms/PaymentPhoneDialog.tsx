import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone } from "lucide-react";
import { z } from "zod";

const phoneSchema = z.string()
  .trim()
  .min(8, "Le numéro doit contenir au moins 8 chiffres")
  .max(15, "Le numéro ne peut pas dépasser 15 chiffres")
  .regex(/^[0-9+\s()-]+$/, "Format de numéro invalide");

interface PaymentPhoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (phone: string) => void;
  planName: string;
  amount: number;
}

export function PaymentPhoneDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  planName, 
  amount 
}: PaymentPhoneDialogProps) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    try {
      const validPhone = phoneSchema.parse(phone);
      // Remove spaces and special characters, keep only digits and + at the start
      const cleanedPhone = validPhone.replace(/\s+/g, '').replace(/[()-]/g, '');
      console.log("📱 Phone confirmed:", cleanedPhone);
      onConfirm(cleanedPhone);
      setPhone("");
      setError("");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Numéro de paiement Mobile Money
          </DialogTitle>
          <DialogDescription>
            Entrez votre numéro de téléphone Mobile Money pour le paiement de <strong>{amount.toLocaleString('fr-FR')} FCFA</strong> pour le plan <strong>{planName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription className="text-sm">
              🔒 Votre numéro n'est pas stocké. Il est utilisé uniquement pour cette transaction.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <Input
              id="phone"
              placeholder="+221 77 123 45 67"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
              }}
              maxLength={15}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!phone.trim()}
              className="flex-1"
            >
              Continuer le paiement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
