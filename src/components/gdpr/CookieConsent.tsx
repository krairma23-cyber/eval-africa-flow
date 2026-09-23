import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie } from "lucide-react";
import { Link } from "react-router-dom";
import { applyConsent, readConsent, saveConsent } from "@/lib/consent";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!readConsent()) setShowBanner(true);
    else applyConsent();
    const open = () => setShowBanner(true);
    window.addEventListener("evalscol-open-consent", open);
    return () => window.removeEventListener("evalscol-open-consent", open);
  }, []);

  const choose = (analytics: boolean) => {
    saveConsent(analytics);
    setShowBanner(false);
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
              Aucun traceur n'est déposé avant votre choix, et vous pouvez le modifier à tout moment
              via le lien « Gérer les cookies » en bas de page.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
              <Button onClick={() => choose(true)} size="sm" className="w-full sm:w-auto">
                Accepter
              </Button>
              <Button onClick={() => choose(false)} size="sm" className="w-full sm:w-auto">
                Refuser
              </Button>
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
