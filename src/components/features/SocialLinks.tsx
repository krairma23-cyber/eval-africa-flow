import { Facebook, MessageCircle, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61585093164850";
export const WHATSAPP_URL = "https://chat.whatsapp.com/DMzKKigmion9jTcsWJtDvK";

const COPY = {
  fr: { title: "Suivez-nous", facebook: "Facebook", whatsapp: "WhatsApp", email: "Email" },
  en: { title: "Follow us", facebook: "Facebook", whatsapp: "WhatsApp", email: "Email" },
};

interface SocialLinksProps {
  className?: string;
  compact?: boolean;
  showTitle?: boolean;
  withEmail?: boolean;
}

export const SocialLinks = ({
  className = "",
  compact = false,
  showTitle = false,
  withEmail = true,
}: SocialLinksProps) => {
  const { language } = useLanguage();
  const c = language === "fr" ? COPY.fr : COPY.en;

  const links = [
    { href: FACEBOOK_URL, label: c.facebook, icon: Facebook, title: "EvalScol Africa sur Facebook" },
    { href: WHATSAPP_URL, label: c.whatsapp, icon: MessageCircle, title: "WhatsApp EvalScol Africa" },
    ...(withEmail
      ? [{ href: "mailto:support@siteteck.com", label: c.email, icon: Mail, title: "support@siteteck.com" }]
      : []),
  ];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      {showTitle && (
        <span className="text-sm font-medium text-foreground mr-1">{c.title}</span>
      )}
      {links.map(({ href, label, icon: Icon, title }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("mailto:") ? undefined : "_blank"}
          rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
          title={title}
          aria-label={title}
          className={
            compact
              ? "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              : "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          }
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {!compact && <span>{label}</span>}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
