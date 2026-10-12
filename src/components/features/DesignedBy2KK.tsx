import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import logo2kk from "@/assets/2kk-technologie-logo.png.asset.json";

const COPY = {
  fr: {
    inline: "Plateforme conçue par",
    title: "Conçu par l'entreprise 2KK Technologie",
    desc: "EvalScol Africa est imaginé, conçu et développé par 2KK Technologie, une entreprise technologique ivoirienne qui crée des solutions logicielles pensées pour les réalités africaines : innovation, puissance et technologie au service de l'éducation.",
  },
  en: {
    inline: "Platform designed by",
    title: "Designed by 2KK Technologie",
    desc: "EvalScol Africa is imagined, designed and developed by 2KK Technologie, an Ivorian technology company building software made for African realities: innovation, power and technology in the service of education.",
  },
};

interface DesignedBy2KKProps {
  variant?: "inline" | "card";
  className?: string;
}

export const DesignedBy2KK = ({ variant = "inline", className = "" }: DesignedBy2KKProps) => {
  const { language } = useLanguage();
  const c = language === "fr" ? COPY.fr : COPY.en;

  if (variant === "card") {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-5">
          <img
            src={logo2kk.url}
            alt="Logo 2KK Technologie"
            className="h-28 w-auto object-contain"
            loading="lazy"
          />
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">{c.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{c.desc}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      <img
        src={logo2kk.url}
        alt="Logo 2KK Technologie"
        className="h-7 w-auto object-contain"
        loading="lazy"
      />
      <span className="text-xs text-muted-foreground">
        {c.inline} <span className="font-semibold text-foreground">2KK Technologie</span>
      </span>
    </div>
  );
};

export default DesignedBy2KK;
