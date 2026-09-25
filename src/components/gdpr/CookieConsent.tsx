import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Cookie } from "lucide-react";
import { Link } from "react-router-dom";
import { applyConsent, readConsent, saveConsent } from "@/lib/consent";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const c = readConsent();
    if (!c) setShowBanner(true);
    else applyConsent();
    const open = () => {
      const cur = readConsent();
      setAnalytics(!!cur?.analytics);
      setMarketing(!!cur?.marketing);
      setCustom(true);
      setShowBanner(true);
    };
    window.addEventListener("evalscol-open-consent", open);
    return () => window.removeEventListener("evalscol-open-consent", open);
  }, []);

  const choose = (a: boolean, m: boolean) => {
    saveConsent(a, m);
    setShowBanner(false);
    setCustom(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-2 sm:p-4 animate-in slide-in-from-bottom-5" role="dialog" aria-label="Préférences cookies">
      <Card className="max-w-4xl mx-auto p-4 sm:p-6 shadow-lg border-primary/20 max-h-[calc(100svh-1rem)] overflow-y-auto">
        <div className="flex items-start gap-3 sm:gap-4">
          <Cookie className="hidden sm:block h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Respect de votre vie privée</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Nous utilisons des cookies essentiels au fonctionnement du site (connexion, sécurité).
              Avec votre accord, nous mesurons aussi l'audience via Google Analytics (Google LLC).
              Aucun traceur n'est déposé avant votre choix, modifiable à tout moment via « Gérer les cookies » en bas de page.
            </p>

            {custom && (
              <div className="space-y-3 mb-4 rounded-md border border-border p-3">
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span><strong>Nécessaires</strong> — connexion, sécurité, préférences (toujours actifs)</span>
                  <Switch checked disabled aria-label="Nécessaires" />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span><strong>Mesure d'audience</strong> — Google Analytics</span>
                  <Switch checked={analytics} onCheckedChange={setAnalytics} aria-label="Mesure d'audience" />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span><strong>Marketing et publicité</strong> — aucun outil utilisé actuellement</span>
                  <Switch checked={marketing} onCheckedChange={setMarketing} aria-label="Marketing et publicité" />
                </label>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
              <Button onClick={() => choose(true, true)} size="sm" className="w-full sm:w-auto">Tout accepter</Button>
              <Button onClick={() => choose(false, false)} size="sm" className="w-full sm:w-auto">Tout refuser</Button>
              {custom ? (
                <Button onClick={() => choose(analytics, marketing)} variant="outline" size="sm" className="w-full sm:w-auto">
                  Enregistrer mes choix
                </Button>
              ) : (
                <Button onClick={() => setCustom(true)} variant="outline" size="sm" className="w-full sm:w-auto">
                  Personnaliser
                </Button>
              )}
              <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto">
                <Link to="/cookies">En savoir plus</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
