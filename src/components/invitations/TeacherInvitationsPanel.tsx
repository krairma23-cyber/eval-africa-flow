import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Copy, MailPlus, RefreshCw, Send, XCircle, Link2 } from "lucide-react";

interface Invitation {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
}

const STATUS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "En attente", variant: "secondary" },
  accepted: { label: "Acceptée", variant: "default" },
  expired: { label: "Expirée", variant: "outline" },
  revoked: { label: "Annulée", variant: "destructive" },
};

async function callInvite(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("teacher-invite", { body });
  if (error) {
    let msg = error.message;
    try { msg = (await (error as any).context?.json())?.error ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data as { link?: string; email_sent?: boolean };
}

function copy(link: string, toast: ReturnType<typeof useToast>["toast"]) {
  navigator.clipboard.writeText(link);
  toast({ title: "Lien copié", description: "Collez-le dans WhatsApp ou un SMS." });
}

export function TeacherInvitationsPanel() {
  const { toast } = useToast();
  const [items, setItems] = useState<Invitation[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "" });
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("teacher_invitations" as any)
      .select("id,email,first_name,last_name,status,expires_at,created_at,accepted_at")
      .order("created_at", { ascending: false })
      .limit(200);
    setItems(((data as unknown as Invitation[]) ?? []).map((i) =>
      i.status === "pending" && new Date(i.expires_at) < new Date() ? { ...i, status: "expired" } : i));
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await callInvite({ action: "create", ...form, origin: window.location.origin });
      setLastLink(res.link ?? null);
      toast({
        title: "Invitation créée",
        description: res.email_sent ? `Email envoyé à ${form.email}.` : "L'email n'a pas pu partir : copiez le lien ci-dessous.",
        variant: res.email_sent ? "default" : "destructive",
      });
      load();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const resend = async (id: string) => {
    try {
      const res = await callInvite({ action: "resend", invitation_id: id, origin: window.location.origin });
      if (res.link) setLinks((l) => ({ ...l, [id]: res.link! }));
      toast({ title: "Invitation renvoyée", description: res.email_sent ? "Nouvel email envoyé (l'ancien lien ne marche plus)." : "Email non envoyé : copiez le nouveau lien." });
      load();
    } catch (err: any) { toast({ title: "Erreur", description: err.message, variant: "destructive" }); }
  };

  const revoke = async (id: string) => {
    try { await callInvite({ action: "revoke", invitation_id: id }); load(); toast({ title: "Invitation annulée" }); }
    catch (err: any) { toast({ title: "Erreur", description: err.message, variant: "destructive" }); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2"><MailPlus className="h-5 w-5" /> Invitations enseignants</CardTitle>
          <CardDescription>Invitez un enseignant par email ou partagez son lien personnel (valable 7 jours).</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setLastLink(null); setForm({ email: "", first_name: "", last_name: "" }); } }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto"><MailPlus className="h-4 w-4 mr-2" /> Inviter un enseignant</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Inviter un enseignant</DialogTitle>
              <DialogDescription>Il recevra un email avec un lien pour rejoindre votre école.</DialogDescription>
            </DialogHeader>
            {lastLink ? (
              <div className="space-y-3">
                <Label>Lien d'invitation</Label>
                <div className="flex gap-2">
                  <Input readOnly value={lastLink} className="text-xs" />
                  <Button type="button" variant="outline" size="icon" onClick={() => copy(lastLink, toast)} aria-label="Copier le lien">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Ce lien n'est affiché qu'une fois. Envoyez-le par WhatsApp ou SMS si besoin.</p>
                <Button className="w-full" onClick={() => { setLastLink(null); setForm({ email: "", first_name: "", last_name: "" }); }}>Inviter un autre enseignant</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label htmlFor="inv-fn">Prénom *</Label><Input id="inv-fn" required maxLength={100} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
                  <div><Label htmlFor="inv-ln">Nom *</Label><Input id="inv-ln" required maxLength={100} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
                </div>
                <div><Label htmlFor="inv-em">Email *</Label><Input id="inv-em" type="email" required maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <Button type="submit" className="w-full" disabled={busy}><Send className="h-4 w-4 mr-2" />{busy ? "Envoi..." : "Envoyer l'invitation"}</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucune invitation pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {items.map((i) => {
              const s = STATUS[i.status] ?? STATUS.pending;
              return (
                <div key={i.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{i.first_name} {i.last_name}</span>
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground break-all">{i.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Envoyée le {new Date(i.created_at).toLocaleDateString("fr-FR")}
                      {i.status === "accepted" && i.accepted_at ? ` · acceptée le ${new Date(i.accepted_at).toLocaleDateString("fr-FR")}` : ""}
                      {i.status === "pending" ? ` · expire le ${new Date(i.expires_at).toLocaleDateString("fr-FR")}` : ""}
                    </p>
                  </div>
                  {(i.status === "pending" || i.status === "expired") && (
                    <div className="flex flex-wrap gap-2">
                      {links[i.id] && (
                        <Button size="sm" variant="outline" onClick={() => copy(links[i.id], toast)}><Link2 className="h-4 w-4 mr-1" />Copier le lien</Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => resend(i.id)}><RefreshCw className="h-4 w-4 mr-1" />{links[i.id] ? "Renvoyer" : "Renvoyer / nouveau lien"}</Button>
                      {i.status === "pending" && (
                        <Button size="sm" variant="ghost" onClick={() => revoke(i.id)}><XCircle className="h-4 w-4 mr-1" />Annuler</Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
