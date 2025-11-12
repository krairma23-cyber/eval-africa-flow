import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export const FinancialsSlide = () => {
  const projections = [
    { year: "2025", revenue: 10.2, costs: 8.5, profit: 1.7, schools: 120 },
    { year: "2026", revenue: 45.8, costs: 22.4, profit: 23.4, schools: 520 },
    { year: "2027", revenue: 142.5, costs: 48.9, profit: 93.6, schools: 1650 },
  ];

  const breakdown2027 = [
    { category: "Subscriptions", value: 125.5, percent: 88 },
    { category: "Services", value: 12.8, percent: 9 },
    { category: "Autres", value: 4.2, percent: 3 },
  ];

  return (
    <div className="h-full flex flex-col p-16 bg-background">
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-foreground mb-4">Projections Financières</h2>
        <p className="text-xl text-muted-foreground">
          Croissance 3 ans : 10M → 142M FCFA • Rentabilité Année 3
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {/* Revenue & Profit Chart */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-xl font-bold mb-6 text-foreground">Revenus & Profitabilité (M FCFA)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenus" radius={[8, 8, 0, 0]} />
              <Bar dataKey="costs" fill="hsl(var(--destructive))" name="Coûts" radius={[8, 8, 0, 0]} />
              <Bar dataKey="profit" fill="hsl(var(--secondary))" name="Profit" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Schools Growth */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-xl font-bold mb-6 text-foreground">Croissance Clients</h3>
          <ResponsiveContainer width="100%" height="50%">
            <LineChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
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
                dataKey="schools"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 6 }}
                name="Écoles"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Revenue Breakdown 2027 */}
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">Répartition Revenus 2027</h4>
            {breakdown2027.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{item.category}</span>
                  <span className="font-bold text-primary">{item.value}M FCFA</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-5 gap-4">
        <div className="p-4 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg text-center">
          <div className="text-3xl font-bold mb-1">142M</div>
          <div className="text-xs opacity-90">ARR 2027 (FCFA)</div>
        </div>
        <div className="p-4 bg-card border border-border rounded-lg text-center">
          <div className="text-2xl font-bold text-foreground mb-1">66%</div>
          <div className="text-xs text-muted-foreground">Marge nette Y3</div>
        </div>
        <div className="p-4 bg-card border border-border rounded-lg text-center">
          <div className="text-2xl font-bold text-foreground mb-1">1650</div>
          <div className="text-xs text-muted-foreground">Écoles 2027</div>
        </div>
        <div className="p-4 bg-card border border-border rounded-lg text-center">
          <div className="text-2xl font-bold text-primary mb-1">18%</div>
          <div className="text-xs text-muted-foreground">Pénétration SAM</div>
        </div>
        <div className="p-4 bg-card border border-border rounded-lg text-center">
          <div className="text-2xl font-bold text-foreground mb-1">4.8x</div>
          <div className="text-xs text-muted-foreground">CAGR 3 ans</div>
        </div>
      </div>
    </div>
  );
};
