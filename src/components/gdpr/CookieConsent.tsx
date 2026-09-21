import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Cookie } from "lucide-react";
import { Link } from "react-router-dom";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("gdpr-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("gdpr-consent", JSON.stringify({
      accepted: true,
      date: new Date().toISOString(),
      functional: true,
      analytics: true,
      marketing: false
    }));
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("gdpr-consent", JSON.stringify({
      accepted: false,
      date: new Date().toISOString(),
      functional: true,
      analytics: false,
      marketing: false
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-2 sm:p-4 animate-in slide-in-from-bottom-5">
      <Card className="max-w-4xl mx-auto p-4 sm:p-6 shadow-lg border-primary/20 max-h-[calc(100svh-1rem)] overflow-y-auto">
        <div className="relative flex items-start gap-3 sm:gap-4 pr-8 sm:pr-0">
          <Cookie className="hidden sm:block h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              Respect de votre vie privée
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies analytiques pour améliorer votre expérience. 
              Conformément au RGPD, vous avez le contrôle total sur vos données personnelles.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
              <Button onClick={handleAccept} size="sm" className="w-full sm:w-auto">
                Tout accepter
              </Button>
              <Button onClick={handleReject} variant="outline" size="sm" className="w-full sm:w-auto whitespace-normal h-auto min-h-9">
                Cookies essentiels uniquement
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto whitespace-normal h-auto min-h-9">
                <Link to="/privacy-policy">
                  Politique de confidentialité
                </Link>
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBanner(false)}
            className="absolute -right-2 -top-2 sm:static flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
