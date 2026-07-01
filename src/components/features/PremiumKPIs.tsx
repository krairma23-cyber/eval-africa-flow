import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, Smartphone, Cloud } from "lucide-react";

interface KPI {
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const kpis: KPI[] = [
  { value: 80, suffix: "%", label: "Temps administratif économisé", icon: Clock, color: "text-emerald-500" },
  { value: 95, suffix: "%", label: "Réduction des erreurs de calcul", icon: CheckCircle2, color: "text-primary" },
  { value: 2, suffix: " min", label: "Temps moyen pour un paiement Mobile Money", icon: Smartphone, color: "text-accent" },
  { value: 99.9, suffix: "%", decimals: 1, label: "Disponibilité cloud", icon: Cloud, color: "text-sky-500" },
];

function AnimatedCounter({ target, decimals = 0, suffix, active }: { target: number; decimals?: number; suffix: string; active: boolean }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const duration = 1600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return <>{value.toFixed(decimals)}{suffix}</>;
}

export function PremiumKPIs() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="max-w-6xl mx-auto mt-16 mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">Des résultats mesurables</h2>
        <p className="text-muted-foreground">Ce que les écoles gagnent avec EvalScol Africa</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className="bg-card/90 backdrop-blur-sm border-primary/10 hover:border-primary/30 hover:shadow-xl transition-all"
          >
            <CardContent className="p-6 text-center">
              <div className={`inline-flex p-3 rounded-full bg-muted mb-3 ${kpi.color}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
              <div className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                <AnimatedCounter target={kpi.value} decimals={kpi.decimals} suffix={kpi.suffix} active={active} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
