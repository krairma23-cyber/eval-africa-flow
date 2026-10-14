import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Loader2 } from "lucide-react";

export default function SetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setTimeout(() => setReady((r) => r ?? false), 2500);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast({ title: "Mot de passe trop court", description: "8 caractères minimum.", variant: "destructive" });
    if (password !== confirm) return toast({ title: "Les mots de passe ne correspondent pas", variant: "destructive" });
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: "Mot de passe enregistré", description: "Vous êtes connecté." });
    const { data } = await supabase.auth.getUser();
    navigate(data.user?.user_metadata?.user_type === "parent" ? "/parent-portal" : "/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <KeyRound className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle>Choisir votre mot de passe</CardTitle>
          <CardDescription>Ce lien ne fonctionne qu'une seule fois.</CardDescription>
        </CardHeader>
        <CardContent>
          {ready === null ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !ready ? (
            <div className="text-center space-y-4">
              <p className="text-destructive">Lien invalide ou expiré.</p>
              <p className="text-sm text-muted-foreground">Utilisez « Mot de passe oublié » sur la page de connexion pour recevoir un nouveau lien.</p>
              <Button variant="outline" onClick={() => navigate("/auth")}>Aller à la connexion</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div><Label htmlFor="np">Nouveau mot de passe (8 caractères min.)</Label><Input id="np" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              <div><Label htmlFor="np2">Confirmer le mot de passe</Label><Input id="np2" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Enregistrement..." : "Enregistrer et me connecter"}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
