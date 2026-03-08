import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line, AreaChart, Area
} from "recharts";

const COLORS = ["hsl(142, 76%, 36%)", "hsl(217, 91%, 60%)", "hsl(262, 83%, 58%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

interface TractionChartsProps {
  roleBreakdown: { role: string; count: number }[];
  subscriptionBreakdown: { plan: string; count: number }[];
  userGrowth: { month: string; count: number }[];
}

export function TractionCharts({ roleBreakdown, subscriptionBreakdown, userGrowth }: TractionChartsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Répartition par rôle</CardTitle>
        </CardHeader>
        <CardContent>
          {roleBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleBreakdown}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ role, count }) => `${role}: ${count}`}
                >
                  {roleBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucune donnée</p>
          )}
        </CardContent>
      </Card>

      {/* Subscription Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Abonnements actifs par plan</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subscriptionBreakdown}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="plan" fontSize={12} className="fill-muted-foreground" />
                <YAxis fontSize={12} className="fill-muted-foreground" allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Abonnés" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucun abonnement actif</p>
          )}
        </CardContent>
      </Card>

      {/* User Growth */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Croissance des utilisateurs (6 derniers mois)</CardTitle>
        </CardHeader>
        <CardContent>
          {userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" fontSize={12} className="fill-muted-foreground" />
                <YAxis fontSize={12} className="fill-muted-foreground" allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Nouveaux utilisateurs"
                  stroke="hsl(217, 91%, 60%)"
                  fill="hsl(217, 91%, 40%)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucune donnée de croissance</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
