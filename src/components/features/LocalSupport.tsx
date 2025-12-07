import { Card, CardContent } from "@/components/ui/card";
import { Globe, Clock, MessageCircle, Headphones } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const LocalSupport = () => {
  const { t } = useLanguage();
  
  const supportFeatures = [
    {
      icon: Globe,
      title: t('support.multilingual'),
      description: t('support.multilingual.desc'),
      details: t('support.multilingual.details')
    },
    {
      icon: Clock,
      title: t('support.timezone'),
      description: t('support.timezone.desc'),
      details: t('support.timezone.details')
    },
    {
      icon: MessageCircle,
      title: t('support.realtime'),
      description: t('support.realtime.desc'),
      details: t('support.realtime.details')
    },
    {
      icon: Headphones,
      title: t('support.cultural'),
      description: t('support.cultural.desc'),
      details: t('support.cultural.details')
    }
  ];

  return (
    <section className="py-12 lg:py-16 border-t border-border/50">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          {t('support.local.title')}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('support.local.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {supportFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={index}
              className="border-accent/20 hover:border-accent/40 transition-all duration-300 bg-card/50 backdrop-blur-sm group"
            >
              <CardContent className="pt-6 text-center">
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Icon className="h-8 w-8 text-accent" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {feature.description}
                </p>

                <p className="text-xs text-accent font-medium">
                  {feature.details}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 border-accent/30">
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Globe className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">
                {t('support.regional')}
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-foreground">{t('countries.sn')} 🇸🇳</p>
                <p className="text-xs text-muted-foreground">{t('support.regional.office')} Dakar</p>
              </div>
              <div>
                <p className="font-medium text-foreground">{t('countries.ci')} 🇨🇮</p>
                <p className="text-xs text-muted-foreground">{t('support.regional.office')} Abidjan</p>
              </div>
              <div>
                <p className="font-medium text-foreground">{t('countries.bj')} 🇧🇯</p>
                <p className="text-xs text-muted-foreground">{t('support.regional.partner')} Cotonou</p>
              </div>
              <div>
                <p className="font-medium text-foreground">{t('countries.tg')} 🇹🇬</p>
                <p className="text-xs text-muted-foreground">{t('support.regional.partner')} Lomé</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              {t('support.regional.footer')}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
