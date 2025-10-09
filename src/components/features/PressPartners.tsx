import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, Building2, Globe } from "lucide-react";

const PressPartners = () => {
  const partners = [
    {
      category: "Médias & Presse",
      icon: Newspaper,
      items: [
        { name: "Abidjan.net", url: "https://www.abidjan.net" },
        { name: "Fraternité Matin", url: "https://www.fratmat.info" },
        { name: "Sikafinance", url: "https://www.sikafinance.com" },
        { name: "CIO Mag Africa", url: "https://www.cio-mag.com" },
      ]
    },
    {
      category: "Institutions",
      icon: Building2,
      items: [
        { name: "Ministère de l'Éducation Nationale", url: "#" },
        { name: "ANPTIC Côte d'Ivoire", url: "#" },
        { name: "Orange Digital Center", url: "#" },
        { name: "Jokkolabs Abidjan", url: "#" },
      ]
    },
    {
      category: "Écosystème EdTech",
      icon: Globe,
      items: [
        { name: "Terangaweb", url: "#" },
        { name: "GoAfricaOnline", url: "#" },
        { name: "African EdTech Hub", url: "#" },
        { name: "Yam Pukri", url: "#" },
      ]
    }
  ];

  return (
    <section className="mt-16 lg:mt-24 max-w-7xl mx-auto" aria-labelledby="press-partners-title">
      <div className="text-center mb-12">
        <h2 id="press-partners-title" className="text-3xl lg:text-4xl font-bold mb-4">
          Presse & Partenaires
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          EvalScol Africa Flow est soutenu par des médias éducatifs, institutions et incubateurs tech en Côte d'Ivoire et Afrique francophone
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {partners.map((partner) => {
          const Icon = partner.icon;
          return (
            <Card key={partner.category} className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold text-lg">{partner.category}</h3>
                </div>
                <ul className="space-y-2">
                  {partner.items.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.url}
                        target={item.url !== "#" ? "_blank" : undefined}
                        rel={item.url !== "#" ? "noopener noreferrer" : undefined}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                      >
                        {item.name}
                        {item.url !== "#" && (
                          <span className="text-xs" aria-hidden="true">↗</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Card className="bg-accent/5 border-accent/30 inline-block">
          <CardContent className="pt-4 pb-4 px-6">
            <p className="text-sm text-muted-foreground">
              <strong className="text-accent">Vous êtes média ou institution ?</strong> 
              <br />
              Contactez-nous pour un partenariat ou une publication : 
              <a href="mailto:contact@evalscolafrica.com" className="text-primary hover:underline ml-1">
                contact@evalscolafrica.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export { PressPartners };
