import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export const MarketSlide = () => {
  const marketData = [
    { country: "Sénégal", schools: 4200, value: 42 },
    { country: "Côte d'Ivoire", schools: 6800, value: 68 },
    { country: "Bénin", schools: 2100, value: 21 },
    { country: "Togo", schools: 1800, value: 18 },
    { country: "Mali", schools: 3500, value: 35 },
    { country: "Burkina Faso", schools: 2900, value: 29 },
  ];

  const segmentData = [
    { name: "Écoles Primaires", value: 45, color: "#2563eb" },
    { name: "Collèges", value: 30, color: "#7c3aed" },
    { name: "Lycées", value: 20, color: "#059669" },
    { name: "Groupes Scolaires", value: 5, color: "#dc2626" },
  ];

  return (
    <div className="h-full flex flex-col p-16 bg-background">
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-foreground mb-4">Opportunité de Marché</h2>
        <p className="text-xl text-muted-foreground">
          Un marché de 250M€ en forte croissance avec 21 500+ écoles privées
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {/* TAM/SAM/SOM */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-muted-foreground mb-4">Total Addressable Market</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">TAM (Afrique Francophone)</span>
                  <span className="text-3xl font-bold text-primary">250M€</span>
                </div>
                <div className="text-xs text-muted-foreground">21 500 écoles privées • Croissance 15%/an</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">SAM (4 pays pilotes)</span>
                  <span className="text-2xl font-bold text-foreground">98M€</span>
                </div>
                <div className="text-xs text-muted-foreground">8 900 écoles ciblées</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">SOM (3 ans)</span>
                  <span className="text-2xl font-bold text-foreground">12M€</span>
                </div>
                <div className="text-xs text-muted-foreground">1 000 écoles • 12% de pénétration SAM</div>
              </div>
            </div>
          </div>

          {/* Segments */}
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold mb-4">Segmentation Marché</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {segmentData.map((segment, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                  <span>{segment.name} ({segment.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market by Country */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-lg font-semibold mb-6">Écoles Privées par Pays (Phase 1)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={marketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="country" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="schools" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">15%</div>
          <div className="text-sm text-muted-foreground">Croissance annuelle</div>
        </div>
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">5.2M</div>
          <div className="text-sm text-muted-foreground">Élèves privés (4 pays)</div>
        </div>
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">0%</div>
          <div className="text-sm text-muted-foreground">Pénétration SaaS actuelle</div>
        </div>
      </div>
    </div>
  );
};
