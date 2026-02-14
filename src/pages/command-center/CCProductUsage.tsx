import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area,
} from "recharts";

const pageUsage = [
  { page: "Dashboard", visits: 4520, avgTime: 185, bounceRate: 12 },
  { page: "Notes / Évaluations", visits: 3800, avgTime: 320, bounceRate: 8 },
  { page: "Bulletins", visits: 2900, avgTime: 240, bounceRate: 15 },
  { page: "Paiements", visits: 1800, avgTime: 140, bounceRate: 22 },
  { page: "IA Assistant", visits: 1200, avgTime: 420, bounceRate: 10 },
  { page: "Portail Parents", visits: 2100, avgTime: 180, bounceRate: 18 },
];

const dailyActivity = [
  { day: "Lun", sessions: 320 }, { day: "Mar", sessions: 410 },
  { day: "Mer", sessions: 380 }, { day: "Jeu", sessions: 450 },
  { day: "Ven", sessions: 520 }, { day: "Sam", sessions: 180 },
  { day: "Dim", sessions: 90 },
];

const heatmapData = [
  { hour: "6h", lun: 5, mar: 8, mer: 6, jeu: 7, ven: 9, sam: 2, dim: 1 },
  { hour: "8h", lun: 35, mar: 42, mer: 38, jeu: 45, ven: 50, sam: 12, dim: 5 },
  { hour: "10h", lun: 65, mar: 72, mer: 68, jeu: 75, ven: 80, sam: 20, dim: 8 },
  { hour: "12h", lun: 45, mar: 50, mer: 48, jeu: 55, ven: 58, sam: 15, dim: 6 },
  { hour: "14h", lun: 70, mar: 78, mer: 72, jeu: 80, ven: 85, sam: 18, dim: 7 },
  { hour: "16h", lun: 55, mar: 60, mer: 58, jeu: 65, ven: 68, sam: 10, dim: 4 },
  { hour: "18h", lun: 30, mar: 35, mer: 32, jeu: 38, ven: 40, sam: 8, dim: 3 },
  { hour: "20h", lun: 15, mar: 18, mer: 16, jeu: 20, ven: 22, sam: 5, dim: 2 },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function getBounceColor(rate: number) {
  if (rate <= 10) return "text-emerald-400";
  if (rate <= 20) return "text-amber-400";
  return "text-red-400";
}

function getHeatColor(value: number) {
  if (value >= 70) return "bg-emerald-500/80";
  if (value >= 40) return "bg-emerald-500/40";
  if (value >= 20) return "bg-emerald-500/20";
  return "bg-gray-800/50";
}

export default function CCProductUsage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Product Usage</h1>
        <p className="text-sm text-gray-500">Analyse d'utilisation par module</p>
      </div>

      {/* Page Usage Table */}
      <Card className="bg-[#12121a] border-gray-800/50 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Pages les plus utilisées</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 text-gray-500 font-medium">Page</th>
                <th className="text-right py-2 text-gray-500 font-medium">Visites</th>
                <th className="text-right py-2 text-gray-500 font-medium">Temps moyen</th>
                <th className="text-right py-2 text-gray-500 font-medium">Taux abandon</th>
              </tr>
            </thead>
            <tbody>
              {pageUsage.map((p) => (
                <tr key={p.page} className="border-b border-gray-800/50">
                  <td className="py-3 text-gray-200">{p.page}</td>
                  <td className="py-3 text-right font-mono text-gray-300">{p.visits.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono text-gray-300">{formatTime(p.avgTime)}</td>
                  <td className={`py-3 text-right font-mono ${getBounceColor(p.bounceRate)}`}>
                    {p.bounceRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Heatmap */}
        <Card className="bg-[#12121a] border-gray-800/50 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Heatmap d'utilisation</h3>
          <div className="space-y-1">
            <div className="grid grid-cols-8 gap-1 text-[10px] text-gray-500 mb-1">
              <div />
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
                <div key={d} className="text-center">{d}</div>
              ))}
            </div>
            {heatmapData.map((row) => (
              <div key={row.hour} className="grid grid-cols-8 gap-1">
                <div className="text-[10px] text-gray-500 flex items-center">{row.hour}</div>
                {[row.lun, row.mar, row.mer, row.jeu, row.ven, row.sam, row.dim].map((v, i) => (
                  <div
                    key={i}
                    className={`h-6 rounded ${getHeatColor(v)} flex items-center justify-center text-[9px] text-white/60`}
                  >
                    {v}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>

        {/* Daily Activity */}
        <Card className="bg-[#12121a] border-gray-800/50 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Activité journalière</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" />
              <XAxis dataKey="day" stroke="#4b5563" fontSize={12} />
              <YAxis stroke="#4b5563" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 8 }} />
              <Bar dataKey="sessions" fill="#10b981" radius={[4, 4, 0, 0]} name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
