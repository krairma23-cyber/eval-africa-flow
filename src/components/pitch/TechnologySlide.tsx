export const TechnologySlide = () => {
  return (
    <div className="h-full flex flex-col p-16 bg-background">
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-foreground mb-4">Stack Technologique</h2>
        <p className="text-xl text-muted-foreground">
          Architecture moderne, scalable et sécurisée
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {/* Architecture Diagram */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-xl font-bold mb-6 text-foreground">Architecture Cloud-Native</h3>
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-lg">
              <div className="font-bold text-primary mb-2">Frontend (Client-Side)</div>
              <div className="text-sm text-muted-foreground">
                React 18 • TypeScript • Tailwind CSS • Vite
              </div>
            </div>
            
            <div className="flex items-center justify-center py-2">
              <div className="text-2xl text-muted-foreground">⬍</div>
            </div>
            
            <div className="p-4 bg-secondary/10 border-2 border-secondary/30 rounded-lg">
              <div className="font-bold text-secondary mb-2">Backend (Supabase)</div>
              <div className="text-sm text-muted-foreground">
                PostgreSQL • Edge Functions • Auth • Storage • RLS
              </div>
            </div>
            
            <div className="flex items-center justify-center py-2">
              <div className="text-2xl text-muted-foreground">⬍</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-card border border-border rounded-lg">
                <div className="font-semibold text-sm mb-1">IA (Lovable AI)</div>
                <div className="text-xs text-muted-foreground">GPT-4 • Claude</div>
              </div>
              <div className="p-3 bg-card border border-border rounded-lg">
                <div className="font-semibold text-sm mb-1">Paiements</div>
                <div className="text-xs text-muted-foreground">Paystack API</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Highlights */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-xl border border-primary/30">
            <h3 className="text-lg font-bold mb-4 text-primary">🤖 Intelligence Artificielle</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Génération contenu :</strong> GPT-4 pour évaluations, rapports, analyses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>ML prédictif :</strong> Détection early warning élèves à risque</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>NLP :</strong> Analyse sentiments, extraction insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Voice AI :</strong> Assistant vocal enseignants (11Labs)</span>
              </li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-bold mb-4 text-foreground">🔒 Sécurité & Conformité</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Encryption :</strong> SSL/TLS end-to-end, data at rest AES-256</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>RLS :</strong> Row-Level Security multi-tenant isolation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Audit :</strong> Logs complets toutes actions sensibles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>RGPD :</strong> Conforme GDPR, data residency Afrique/EU</span>
              </li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-bold mb-4 text-foreground">⚡ Performance & Scale</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Edge Computing :</strong> CDN global, <2s page load</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Auto-scaling :</strong> Serverless architecture élastique</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Caching :</strong> Redis multi-layer, optimisé mobile</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>SLA :</strong> 99.9% uptime garanti (Enterprise)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className="text-2xl font-bold text-foreground">10K+</div>
          <div className="text-xs text-muted-foreground">Req/sec capacity</div>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className="text-2xl font-bold text-foreground">50ms</div>
          <div className="text-xs text-muted-foreground">API latency P95</div>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className="text-2xl font-bold text-foreground">3</div>
          <div className="text-xs text-muted-foreground">Geo-redundancy zones</div>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className="text-2xl font-bold text-foreground">Daily</div>
          <div className="text-xs text-muted-foreground">Automated backups</div>
        </div>
      </div>
    </div>
  );
};
