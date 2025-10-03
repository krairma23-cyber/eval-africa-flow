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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
      <Card className="max-w-4xl mx-auto p-6 shadow-lg border-primary/20">
        <div className="flex items-start gap-4">
          <Cookie className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              Respect de votre vie privée
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies analytiques pour améliorer votre expérience. 
              Conformément au RGPD, vous avez le contrôle total sur vos données personnelles.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleAccept} size="sm">
                Tout accepter
              </Button>
              <Button onClick={handleReject} variant="outline" size="sm">
                Cookies essentiels uniquement
              </Button>
              <Button asChild variant="ghost" size="sm">
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
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
