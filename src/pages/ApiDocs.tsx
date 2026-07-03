import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Key, Shield, Zap, Code2, Webhook, AlertTriangle } from "lucide-react";
import Seo from "@/components/Seo";

const BASE_URL = "https://xckeensgwzwrweloaeoy.supabase.co/rest/v1";
const FN_URL = "https://xckeensgwzwrweloaeoy.supabase.co/functions/v1";

const CodeBlock = ({ children, lang = "bash" }: { children: string; lang?: string }) => (
  <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-xs md:text-sm border border-border">
    <code className={`language-${lang} text-foreground`}>{children}</code>
  </pre>
);

const Endpoint = ({
  method,
  path,
  desc,
}: {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  desc: string;
}) => {
  const colors: Record<string, string> = {
    GET: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    POST: "bg-green-500/10 text-green-600 border-green-500/30",
    PATCH: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    DELETE: "bg-red-500/10 text-red-600 border-red-500/30",
  };
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <Badge variant="outline" className={`${colors[method]} font-mono text-xs shrink-0`}>
        {method}
      </Badge>
      <div className="flex-1 min-w-0">
        <code className="text-sm font-mono break-all">{path}</code>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
    </div>
  );
};

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Documentation API | EvalScol Africa"
        description="Documentation officielle de l'API REST EvalScol Africa : authentification, endpoints, webhooks, exemples cURL et JavaScript."
        path="/api-docs"
      />



      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <Badge variant="outline" className="gap-1">
            <BookOpen className="h-3 w-3" /> v1.0
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Hero */}
        <section className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Documentation API EvalScol Africa
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Intégrez EvalScol à vos systèmes internes, applications mobiles ou tableaux de bord.
            Notre API REST vous donne un accès sécurisé aux élèves, notes, bulletins, paiements et bien plus.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button asChild className="bg-[#10B981] hover:bg-[#0ea472] text-white">
              <Link to="/dashboard/api">Générer une clé API</Link>
            </Button>
            <Button asChild variant="outline">
              <a href="#quickstart">Démarrage rapide</a>
            </Button>
          </div>
        </section>

        {/* Overview cards */}
        <section className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Shield, title: "Sécurisé", desc: "Authentification par clé API + JWT, HTTPS obligatoire, RLS multi-tenant." },
            { icon: Zap, title: "Temps réel", desc: "Webhooks pour être notifié dès qu'un événement survient dans votre école." },
            { icon: Code2, title: "REST standard", desc: "JSON, verbes HTTP, codes d'erreur classiques. Compatible avec tout langage." },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        {/* Quickstart */}
        <section id="quickstart" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" /> Démarrage rapide
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Obtenir votre clé API</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Rendez-vous dans <Link to="/dashboard/api" className="text-primary underline">Tableau de bord → API</Link> et cliquez sur « Créer une clé API ». Copiez-la immédiatement — elle ne sera plus jamais affichée en clair.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. Faire votre premier appel</h3>
                <CodeBlock>{`curl "${BASE_URL}/students?select=*&limit=10" \\
  -H "apikey: VOTRE_CLE_API" \\
  -H "Authorization: Bearer VOTRE_CLE_API"`}</CodeBlock>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. Réponse type</h3>
                <CodeBlock lang="json">{`[
  {
    "id": "8f3d...",
    "first_name": "Aminata",
    "last_name": "Diallo",
    "classroom_id": "c1a2...",
    "created_at": "2026-01-15T09:23:11Z"
  }
]`}</CodeBlock>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Auth */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Key className="h-6 w-6 text-primary" /> Authentification
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm">
                Toutes les requêtes doivent inclure deux en-têtes HTTP :
              </p>
              <CodeBlock>{`apikey: VOTRE_CLE_API
Authorization: Bearer VOTRE_CLE_API`}</CodeBlock>
              <div className="flex gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Ne jamais exposer votre clé API dans le code front-end public.
                  Utilisez-la uniquement côté serveur ou dans des environnements sécurisés.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" /> Endpoints principaux
          </h2>
          <Tabs defaultValue="students">
            <TabsList className="flex flex-wrap h-auto">
              <TabsTrigger value="students">Élèves</TabsTrigger>
              <TabsTrigger value="teachers">Enseignants</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="grades">Notes</TabsTrigger>
              <TabsTrigger value="reports">Bulletins</TabsTrigger>
              <TabsTrigger value="payments">Paiements</TabsTrigger>
            </TabsList>

            <TabsContent value="students">
              <Card>
                <CardContent className="pt-6">
                  <Endpoint method="GET" path="/students" desc="Lister tous les élèves de votre école." />
                  <Endpoint method="GET" path="/students?id=eq.{id}" desc="Récupérer un élève par son identifiant." />
                  <Endpoint method="POST" path="/students" desc="Créer un nouvel élève." />
                  <Endpoint method="PATCH" path="/students?id=eq.{id}" desc="Modifier les informations d'un élève." />
                  <Endpoint method="DELETE" path="/students?id=eq.{id}" desc="Supprimer un élève (archivage recommandé)." />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teachers">
              <Card>
                <CardContent className="pt-6">
                  <Endpoint method="GET" path="/teachers" desc="Lister les enseignants." />
                  <Endpoint method="POST" path="/teachers" desc="Créer un profil enseignant." />
                  <Endpoint method="PATCH" path="/teachers?id=eq.{id}" desc="Mettre à jour un enseignant." />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classes">
              <Card>
                <CardContent className="pt-6">
                  <Endpoint method="GET" path="/classrooms" desc="Lister les classes." />
                  <Endpoint method="POST" path="/classrooms" desc="Créer une classe." />
                  <Endpoint method="GET" path="/subjects" desc="Lister les matières." />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grades">
              <Card>
                <CardContent className="pt-6">
                  <Endpoint method="GET" path="/assessments" desc="Lister les évaluations." />
                  <Endpoint method="POST" path="/assessments" desc="Créer une évaluation." />
                  <Endpoint method="GET" path="/grades?student_id=eq.{id}" desc="Récupérer les notes d'un élève." />
                  <Endpoint method="POST" path="/grades" desc="Saisir une note." />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardContent className="pt-6">
                  <Endpoint method="GET" path="/reports?student_id=eq.{id}" desc="Récupérer les bulletins d'un élève." />
                  <Endpoint method="POST" path={`${FN_URL}/generate-reports`} desc="Générer les bulletins d'une classe." />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardContent className="pt-6">
                  <Endpoint method="GET" path="/payments" desc="Lister les paiements." />
                  <Endpoint method="POST" path={`${FN_URL}/paystack-payment`} desc="Initier un paiement Mobile Money via Paystack." />
                  <Endpoint method="GET" path={`${FN_URL}/paystack-verify?reference={ref}`} desc="Vérifier le statut d'un paiement." />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Exemples de code</h2>
          <Tabs defaultValue="curl">
            <TabsList>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="js">JavaScript</TabsTrigger>
              <TabsTrigger value="py">Python</TabsTrigger>
            </TabsList>
            <TabsContent value="curl">
              <CodeBlock>{`# Créer un élève
curl -X POST "${BASE_URL}/students" \\
  -H "apikey: VOTRE_CLE_API" \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json" \\
  -d '{
    "first_name": "Kouadio",
    "last_name": "Yao",
    "classroom_id": "c1a2...",
    "date_of_birth": "2012-05-10"
  }'`}</CodeBlock>
            </TabsContent>
            <TabsContent value="js">
              <CodeBlock lang="javascript">{`const res = await fetch("${BASE_URL}/students", {
  method: "POST",
  headers: {
    "apikey": process.env.EVALSCOL_API_KEY,
    "Authorization": \`Bearer \${process.env.EVALSCOL_API_KEY}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    first_name: "Kouadio",
    last_name: "Yao",
    classroom_id: "c1a2..."
  })
});
const data = await res.json();`}</CodeBlock>
            </TabsContent>
            <TabsContent value="py">
              <CodeBlock lang="python">{`import os, requests

headers = {
    "apikey": os.environ["EVALSCOL_API_KEY"],
    "Authorization": f"Bearer {os.environ['EVALSCOL_API_KEY']}",
    "Content-Type": "application/json",
}

r = requests.post(
    "${BASE_URL}/students",
    headers=headers,
    json={"first_name": "Kouadio", "last_name": "Yao", "classroom_id": "c1a2..."},
)
print(r.json())`}</CodeBlock>
            </TabsContent>
          </Tabs>
        </section>

        {/* Webhooks */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Webhook className="h-6 w-6 text-primary" /> Webhooks
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                Recevez des notifications HTTP en temps réel lorsqu'un événement se produit.
                Configurez-les depuis <Link to="/dashboard/api" className="text-primary underline">Tableau de bord → API → Webhooks</Link>.
              </p>
              <ul className="text-sm space-y-2">
                <li><code className="text-xs bg-muted px-2 py-1 rounded">student.created</code> — Nouvel élève inscrit</li>
                <li><code className="text-xs bg-muted px-2 py-1 rounded">grade.recorded</code> — Nouvelle note saisie</li>
                <li><code className="text-xs bg-muted px-2 py-1 rounded">report.generated</code> — Bulletin généré</li>
                <li><code className="text-xs bg-muted px-2 py-1 rounded">payment.success</code> — Paiement de scolarité réussi</li>
                <li><code className="text-xs bg-muted px-2 py-1 rounded">payment.failed</code> — Échec de paiement</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Errors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Codes d'erreur</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                {[
                  ["200", "OK — Requête réussie"],
                  ["201", "Created — Ressource créée"],
                  ["400", "Bad Request — Paramètres invalides"],
                  ["401", "Unauthorized — Clé API manquante ou invalide"],
                  ["403", "Forbidden — Accès refusé par les règles RLS"],
                  ["404", "Not Found — Ressource introuvable"],
                  ["429", "Too Many Requests — Limite de débit atteinte"],
                  ["500", "Server Error — Erreur interne, contactez le support"],
                ].map(([code, desc]) => (
                  <div key={code} className="flex gap-3 py-2 border-b border-border last:border-0">
                    <Badge variant="outline" className="font-mono">{code}</Badge>
                    <span className="text-muted-foreground">{desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Limits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Limites & tarification</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { plan: "Standard", rate: "60 req/min", quota: "10 000 req/mois" },
              { plan: "Professional", rate: "300 req/min", quota: "100 000 req/mois" },
              { plan: "Enterprise", rate: "Illimité", quota: "Sur devis" },
            ].map((p) => (
              <Card key={p.plan}>
                <CardHeader>
                  <CardTitle className="text-lg">{p.plan}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1 text-muted-foreground">
                  <p><strong className="text-foreground">Débit :</strong> {p.rate}</p>
                  <p><strong className="text-foreground">Quota :</strong> {p.quota}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Support */}
        <section className="mb-12">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">Besoin d'aide ?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Notre équipe technique est disponible du lundi au vendredi de 8h à 18h (GMT).
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <a href="mailto:support@evalscol.com">support@evalscol.com</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="https://wa.me/2250707041904" target="_blank" rel="noreferrer">WhatsApp</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EvalScol Africa · API v1.0
      </footer>
    </div>
  );
}
