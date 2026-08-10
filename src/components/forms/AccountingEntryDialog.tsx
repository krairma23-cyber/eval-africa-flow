import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/lib/logger";

export interface AccountingCategory {
  id: string;
  name: string;
  kind: "income" | "expense";
  color: string;
  code: string | null;
}

export interface AccountingEntry {
  id: string;
  entry_date: string;
  label: string;
  kind: "income" | "expense";
  amount: number;
  payment_method: string | null;
  reference: string | null;
  notes: string | null;
  category_id: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: AccountingCategory[];
  entry?: AccountingEntry | null;
  schoolId: string | null;
  onSaved: () => void;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Espèces" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank_transfer", label: "Virement bancaire" },
  { value: "bank_card", label: "Carte bancaire" },
  { value: "check", label: "Chèque" },
  { value: "other", label: "Autre" },
];

export function AccountingEntryDialog({ open, onOpenChange, categories, entry, schoolId, onSaved }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<"income" | "expense">("income");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setKind(entry?.kind ?? "income");
    setEntryDate(entry?.entry_date ?? new Date().toISOString().slice(0, 10));
    setLabel(entry?.label ?? "");
    setAmount(entry ? String(entry.amount) : "");
    setCategoryId(entry?.category_id ?? "");
    setPaymentMethod(entry?.payment_method ?? "");
    setReference(entry?.reference ?? "");
    setNotes(entry?.notes ?? "");
  }, [open, entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!label.trim() || !Number.isFinite(amountNum) || amountNum < 0) {
      toast({ title: "Erreur", description: "Libellé et montant valides requis", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        entry_date: entryDate,
        label: label.trim(),
        kind,
        amount: amountNum,
        category_id: categoryId || null,
        payment_method: paymentMethod || null,
        reference: reference.trim() || null,
        notes: notes.trim() || null,
      };

      let error;
      if (entry) {
        ({ error } = await supabase.from("accounting_entries").update(payload).eq("id", entry.id));
      } else {
        if (!schoolId) {
          toast({ title: "Erreur", description: "Aucune école associée à votre compte", variant: "destructive" });
          setLoading(false);
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        ({ error } = await supabase.from("accounting_entries").insert({
          ...payload,
          school_id: schoolId,
          created_by: user?.id ?? null,
        }));
      }

      if (error) {
        await logError("Failed to save accounting entry", error, { component: "AccountingEntryDialog" });
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Succès", description: entry ? "Écriture modifiée" : "Écriture enregistrée" });
      onOpenChange(false);
      onSaved();
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = categories.filter((c) => c.kind === kind);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? "Modifier l'écriture" : "Nouvelle écriture"}</DialogTitle>
          <DialogDescription>Encaissement ou décaissement de l'établissement</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={kind === "income" ? "default" : "outline"}
              onClick={() => { setKind("income"); setCategoryId(""); }}
            >
              Recette
            </Button>
            <Button
              type="button"
              variant={kind === "expense" ? "destructive" : "outline"}
              onClick={() => { setKind("expense"); setCategoryId(""); }}
            >
              Dépense
            </Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="entryDate">Date</Label>
            <Input id="entryDate" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="label">Libellé</Label>
            <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex : Scolarité 3e trimestre" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Montant (FCFA)</Label>
            <Input id="amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>

          <div className="grid gap-2">
            <Label>Catégorie</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger>
              <SelectContent>
                {availableCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Mode de règlement</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reference">Référence / pièce justificative</Label>
            <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="N° reçu, facture…" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={loading}>{loading ? "Enregistrement…" : "Enregistrer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { PAYMENT_METHODS };
