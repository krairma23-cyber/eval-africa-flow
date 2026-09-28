import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Loader2 } from "lucide-react";

interface Preview { school_name: string; email: string; first_name: string; last_name: string; has_account: boolean }

async function call(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("teacher-invite-accept", { body });
  if (error) {
    let payload: any = null;
    try { payload = await (error as any).context?.json(); } catch { /* ignore */ }
    throw Object.assign(new Error(payload?.error ?? error.message), { payload });
  }
  return data;
}

export default function AcceptInvitation() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    call({ action: "preview", token })
      .then((p: Preview) => { setPreview(p); setMode(p.has_account ? "login" : "signup"); })
      .catch((e) => setErr(e.message));
    supabase.auth.getUser().then(({ data }) => setSessionEmail(data.user?.email?.toLowerCase() ?? null));
  }, [token]);

  const join = async () => {
    await call({ action: "join", token });
    toast({ title: "École rattachée", description: `Vous avez rejoint ${preview?.school_name}.` });
    navigate("/dashboard");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast({ title: "Mot de passe trop court", description: "8 caractères minimum.", variant: "destructive" });
    if (password !== confirm) return toast({ title: "Les mots de passe ne correspondent pas", variant: "destructive" });
    setBusy(true);
    try {
      await call({ action: "signup", token, password });
      const { error } = await supabase.auth.signInWithPassword({ email: preview!.email, password });
      if (error) throw error;
      toast({ title: "Bienvenue !", description: `Votre compte enseignant chez ${preview!.school_name} est prêt.` });
      navigate("/dashboard");
    } catch (e: any) {
      if (e.payload?.has_account) setMode("login");
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (sessionEmail !== preview!.email) {
        const { error } = await supabase.auth.signInWithPassword({ email: preview!.email, password });
        if (error) throw new Error("Mot de passe incorrect");
      }
      await join();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <GraduationCap className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle>Invitation enseignant</CardTitle>
          {preview && <CardDescription>Rejoindre <strong className="text-foreground">{preview.school_name}</strong> sur EvalScol Africa</CardDescription>}
        </CardHeader>
        <CardContent>
          {err ? (
            <div className="text-center space-y-4">
              <p className="text-destructive">{err}</p>
              <p className="text-sm text-muted-foreground">Demandez à l'administrateur de votre école de vous renvoyer une invitation.</p>
              <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
            </div>
          ) : !preview ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : mode === "signup" ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <p className="text-sm text-muted-foreground">Bonjour {preview.first_name}, choisissez votre mot de passe pour finaliser votre inscription.</p>
              <div><Label>Email</Label><Input value={preview.email} readOnly /></div>
              <div><Label htmlFor="pw">Mot de passe (8 caractères min.)</Label><Input id="pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              <div><Label htmlFor="pw2">Confirmer le mot de passe</Label><Input id="pw2" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Création..." : "Créer mon compte enseignant"}</Button>
              <button type="button" className="text-sm text-primary underline w-full" onClick={() => setMode("login")}>J'ai déjà un compte EvalScol Africa</button>
            </form>
          ) : sessionEmail === preview.email ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">Vous êtes connecté avec {preview.email}.</p>
              <Button className="w-full" disabled={busy} onClick={async () => { setBusy(true); try { await join(); } catch (e: any) { toast({ title: "Erreur", description: e.message, variant: "destructive" }); } finally { setBusy(false); } }}>
                Rejoindre cette école
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <p className="text-sm text-muted-foreground">Vous avez déjà un compte. Connectez-vous pour ajouter {preview.school_name} à votre profil — vos autres écoles sont conservées.</p>
              <div><Label>Email</Label><Input value={preview.email} readOnly /></div>
              <div><Label htmlFor="lpw">Mot de passe</Label><Input id="lpw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Connexion..." : "Se connecter et rejoindre l'école"}</Button>
              {!preview.has_account && (
                <button type="button" className="text-sm text-primary underline w-full" onClick={() => setMode("signup")}>Je n'ai pas encore de compte</button>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
