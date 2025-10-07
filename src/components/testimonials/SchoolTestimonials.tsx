import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    school: "Lycée Saint-Michel",
    location: "Dakar, Sénégal",
    quote: "EvalScol a transformé notre gestion des évaluations. Nous avons réduit de 60% le temps consacré à la création des bulletins.",
    author: "Mme Fatou Diop",
    role: "Directrice Académique",
    stats: "450 élèves • 3 campus",
    rating: 5
  },
  {
    school: "Complexe Scolaire La Réussite",
    location: "Abidjan, Côte d'Ivoire",
    quote: "La sécurité des données et la facilité d'utilisation ont convaincu toute notre équipe pédagogique. Un outil indispensable.",
    author: "M. Kouadio N'Guessan",
    role: "Proviseur",
    stats: "820 élèves • 5 campus",
    rating: 5
  },
  {
    school: "École Internationale Horizon",
    location: "Cotonou, Bénin",
    quote: "Grâce à EvalScol, nos enseignants peuvent se concentrer sur la pédagogie plutôt que sur l'administratif. Les parents apprécient la transparence.",
    author: "Dr. Aïcha Touré",
    role: "Coordinatrice Pédagogique",
    stats: "320 élèves • 2 campus",
    rating: 5
  }
];

export const SchoolTestimonials = () => {
  return (
    <section className="py-12 lg:py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Écoles Pilotes
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvrez comment des établissements d'excellence ont transformé leur gestion académique avec EvalScol
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <Card 
            key={index}
            className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-card/50 backdrop-blur-sm"
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <Quote className="h-8 w-8 text-accent/40" />
                <div className="flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-foreground/90 mb-6 leading-relaxed italic">
                "{testimonial.quote}"
              </p>

              <div className="space-y-3 pt-4 border-t border-border/50">
                <div>
                  <p className="font-semibold text-primary text-base">
                    {testimonial.school}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-medium text-accent">
                    {testimonial.stats}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30 inline-block">
          <CardContent className="pt-6 px-8">
            <p className="text-sm font-medium text-foreground mb-2">
              Programme Pilote 2024-2025
            </p>
            <p className="text-xs text-muted-foreground">
              +15 établissements • +12,000 élèves • 4 pays
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
