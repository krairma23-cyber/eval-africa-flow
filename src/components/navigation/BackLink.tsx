import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type BackLinkProps = {
  /** Where to send visitors who arrived directly (email link, bookmark, typed URL): no page to go back to. */
  to?: string;
  /** Label when there IS a previous page in the app. Defaults to "Retour" / "Back". */
  label?: string;
  /** Label when there is NOTHING to go back to. Defaults to "Retour à l'accueil" / "Back to home". */
  fallbackLabel?: string;
  /** "button" = ghost button, "link" = plain text link for header bars. */
  variant?: "button" | "link";
  className?: string;
};

/**
 * True only when the visitor reached this page from another page of the app
 * (react-router keeps the entry position in history.state.idx, 0 = direct arrival).
 */
function canGoBack() {
  const idx = (window.history.state as { idx?: number } | null)?.idx;
  return typeof idx === "number" && idx > 0;
}

export default function BackLink({
  to = "/",
  label,
  fallbackLabel,
  variant = "button",
  className,
}: BackLinkProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const en = language === "en";

  const backLabel = label ?? (en ? "Back" : "Retour");
  const homeLabel =
    fallbackLabel ??
    (to === "/"
      ? en
        ? "Back to home"
        : "Retour à l'accueil"
      : en
        ? "Back"
        : "Retour");

  const goBack = canGoBack();

  if (variant === "link") {
    const linkClass = `inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition ${className ?? ""}`;
    return goBack ? (
      <button type="button" onClick={() => navigate(-1)} className={linkClass}>
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </button>
    ) : (
      <Link to={to} className={linkClass}>
        <ArrowLeft className="h-4 w-4" /> {homeLabel}
      </Link>
    );
  }

  return goBack ? (
    <Button type="button" variant="ghost" onClick={() => navigate(-1)} className={className}>
      <ArrowLeft className="h-4 w-4 mr-2" /> {backLabel}
    </Button>
  ) : (
    <Button asChild variant="ghost" className={className}>
      <Link to={to}>
        <ArrowLeft className="h-4 w-4 mr-2" /> {homeLabel}
      </Link>
    </Button>
  );
}
