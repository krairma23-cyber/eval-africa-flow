import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const TractionSlide = () => {
  const growthData = [
    { month: "Jan", mrr: 0, schools: 0 },
    { month: "Fév", mrr: 1.2, schools: 3 },
    { month: "Mar", mrr: 3.5, schools: 8 },
    { month: "Avr", mrr: 6.8, schools: 15 },
    { month: "Mai", mrr: 12.4, schools: 28 },
    { month: "Juin", mrr: 21.5, schools: 45 },
  ];

  const testimonials = [
    {
      school: "Groupe Scolaire Excellence",
      location: "Dakar, Sénégal",
      quote: "Temps de gestion divisé par 5, parents ravis du portail temps réel",
      students: "850 élèves"
    },
    {
      school: "Collège Les Palmiers",
      location: "Abidjan, Côte d'Ivoire",
      quote: "Impayés réduits de 60% grâce à l'intégration Mobile Money",
      students: "420 élèves"
    }
  ];

  return (
    <div className="h-full flex flex-col p-16 bg-background">
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-foreground mb-4">Traction & Validation</h2>
        <p className="text-xl text-muted-foreground">
          Programme pilote 2024-2025 : Croissance 280% MoM
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {/* Growth Chart */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-xl font-bold mb-6 text-foreground">Croissance MRR (M FCFA)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="mrr"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-xl text-primary-foreground">
              <div className="text-4xl font-bold mb-2">45</div>
              <div className="text-sm opacity-90">Écoles Pilotes</div>
              <div className="text-xs opacity-75 mt-2">+280% MoM</div>
            </div>
            <div className="bg-gradient-to-br from-secondary to-secondary/80 p-6 rounded-xl text-secondary-foreground">
              <div className="text-4xl font-bold mb-2">21.5M</div>
              <div className="text-sm opacity-90">MRR (FCFA)</div>
              <div className="text-xs opacity-75 mt-2">Juin 2025</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="text-3xl font-bold mb-2 text-primary">28 500</div>
              <div className="text-sm text-muted-foreground">Élèves actifs</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="text-3xl font-bold mb-2 text-primary">4.2%</div>
              <div className="text-sm text-muted-foreground">Churn mensuel</div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="space-y-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card p-5 rounded-xl border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-foreground">{testimonial.school}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {testimonial.students}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">92%</div>
          <div className="text-xs text-muted-foreground">NPS Score</div>
        </div>
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">850K</div>
          <div className="text-xs text-muted-foreground">ARR (FCFA)</div>
        </div>
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">6 mois</div>
          <div className="text-xs text-muted-foreground">Depuis lancement</div>
        </div>
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">280%</div>
          <div className="text-xs text-muted-foreground">Croissance MoM</div>
        </div>
      </div>
    </div>
  );
};
