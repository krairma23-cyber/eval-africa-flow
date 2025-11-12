import { Code, Briefcase, Users, TrendingUp } from "lucide-react";

export const TeamSlide = () => {
  const team = [
    {
      name: "Fondateur & CEO",
      icon: Briefcase,
      background: "10+ ans EdTech Afrique • Ex-Director École Internationale",
      expertise: "Vision produit • Ops • Fundraising"
    },
    {
      name: "CTO",
      icon: Code,
      background: "15+ ans Engineering • Ex-Lead Dev Fintech",
      expertise: "Architecture • IA • Sécurité"
    },
    {
      name: "Head of Growth",
      icon: TrendingUp,
      background: "8+ ans Growth SaaS • Ex-Marketing Manager",
      expertise: "Acquisition • Retention • Analytics"
    },
    {
      name: "Head of Customer Success",
      icon: Users,
      background: "12+ ans Support & Formation",
      expertise: "Onboarding • Training • Support"
    }
  ];

  const advisors = [
    { name: "Expert EdTech", role: "Ancien ministre Éducation Sénégal" },
    { name: "Expert FinTech", role: "Co-founder Paystack" },
    { name: "Expert IA", role: "ML Researcher, Stanford" }
  ];

  return (
    <div className="h-full flex flex-col p-16 bg-background">
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-foreground mb-4">L'Équipe</h2>
        <p className="text-xl text-muted-foreground">
          Expertise combinée de 45+ ans en EdTech, FinTech et IA
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* Core Team */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-foreground mb-4">Équipe Fondatrice</h3>
          {team.map((member, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-xl border border-border hover:border-primary/50 transition-all animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <member.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-foreground mb-2">{member.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{member.background}</p>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.split(" • ").map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Advisors */}
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-6">Advisors</h3>
            <div className="space-y-4">
              {advisors.map((advisor, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-muted rounded-lg"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-foreground">{advisor.name}</h4>
                    <p className="text-sm text-muted-foreground">{advisor.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Plan */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-xl border border-primary/30">
            <h3 className="text-xl font-bold text-primary mb-4">🚀 Plan de Recrutement 12 mois</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-foreground">+3</div>
                <div className="text-xs text-muted-foreground">Engineers</div>
              </div>
              <div className="bg-background/50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-foreground">+2</div>
                <div className="text-xs text-muted-foreground">Sales Reps</div>
              </div>
              <div className="bg-background/50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-foreground">+2</div>
                <div className="text-xs text-muted-foreground">Customer Success</div>
              </div>
              <div className="bg-background/50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-foreground">+1</div>
                <div className="text-xs text-muted-foreground">Product Manager</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Total équipe Année 1 :</span>
                <span className="text-2xl font-bold text-primary">12 personnes</span>
              </div>
            </div>
          </div>

          {/* Culture */}
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold text-foreground mb-4">💡 Culture & Valeurs</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Customer-centric :</strong> Obsédés par la réussite clients</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Data-driven :</strong> Décisions basées données, pas intuitions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Remote-first :</strong> Talents partout en Afrique francophone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Impact-driven :</strong> Mission transformatrice éducation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
