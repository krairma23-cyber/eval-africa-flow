import { Link, useLocation } from "react-router-dom";
import { openConsentSettings } from "@/lib/consent";
import { DesignedBy2KK } from "@/components/features/DesignedBy2KK";
import { SocialLinks } from "@/components/features/SocialLinks";

export const LegalFooter = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/command-center") || pathname === "/pitch-deck") return null;
  return (
    <footer className="border-t border-border bg-background py-4 px-4 text-xs text-muted-foreground">
      <nav className="max-w-6xl mx-auto flex flex-wrap gap-x-5 gap-y-2 justify-center">
        <Link to="/mentions-legales" className="hover:text-foreground">Mentions légales</Link>
        <Link to="/cgu" className="hover:text-foreground">Conditions d'utilisation</Link>
        <Link to="/privacy-policy" className="hover:text-foreground">Confidentialité</Link>
        <Link to="/cookies" className="hover:text-foreground">Cookies</Link>
        <button type="button" onClick={openConsentSettings} className="hover:text-foreground underline-offset-2 hover:underline">
          Gérer les cookies
        </button>
      </nav>
      <SocialLinks compact className="mt-4" withEmail={false} />
      <DesignedBy2KK className="mt-3" />
    </footer>
  );
};
