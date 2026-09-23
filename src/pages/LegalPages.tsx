import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { openConsentSettings } from "@/lib/consent";

const Layout = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Retour à l'accueil</Link>
      </Button>
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-foreground">{title}</h1>
      <div className="space-y-6 text-sm text-foreground">{children}</div>
    </div>
  </div>
);

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Card>
    <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
    <CardContent className="space-y-2">{children}</CardContent>
  </Card>
);

export const LegalNotice = () => (
  <Layout title="Mentions légales">
    <Section title="Éditeur du site">
      <p><strong>EvalScol Africa</strong> — Plateau, Abidjan, Côte d'Ivoire</p>
      <p>Forme juridique, RCCM et capital : [à compléter]</p>
      <p>Directeur de la publication : [à compléter]</p>
      <p>Téléphone : +225 07 07 04 19 04 — Email : evalscolafrica@siteteck.com</p>
    </Section>
    <Section title="Hébergement">
      <p>Site : Lovable (Lovable Labs Incorporated) — https://lovable.dev</p>
      <p>Données applicatives : Supabase Inc. — https://supabase.com</p>
    </Section>
    <Section title="Propriété intellectuelle">
      <p>Les contenus, marques et logos d'EvalScol Africa sont protégés. Toute reproduction sans autorisation est interdite.</p>
    </Section>
    <Section title="Données personnelles">
      <p>Voir la <Link to="/privacy-policy" className="text-primary underline">politique de confidentialité</Link> et la <Link to="/cookies" className="text-primary underline">politique cookies</Link>.</p>
    </Section>
  </Layout>
);

export const TermsOfUse = () => (
  <Layout title="Conditions générales d'utilisation">
    <Section title="1. Objet">
      <p>Les présentes conditions encadrent l'utilisation de la plateforme EvalScol Africa, service en ligne de gestion scolaire destiné aux établissements, enseignants et parents.</p>
    </Section>
    <Section title="2. Comptes">
      <p>L'utilisateur fournit des informations exactes et garde ses identifiants confidentiels. L'établissement est responsable des comptes créés pour son personnel et les parents.</p>
    </Section>
    <Section title="3. Données saisies par l'établissement">
      <p>L'établissement reste responsable des données des élèves qu'il saisit. EvalScol Africa les traite pour son compte, uniquement pour fournir le service.</p>
    </Section>
    <Section title="4. Abonnements et paiements">
      <p>Les tarifs sont indiqués sur la page Tarifs. Les paiements sont traités par Paystack. L'abonnement peut être modifié ou résilié depuis l'espace Facturation.</p>
    </Section>
    <Section title="5. Usage interdit">
      <p>Il est interdit de tenter d'accéder aux données d'un autre établissement, de perturber le service ou de l'utiliser à des fins illicites.</p>
    </Section>
    <Section title="6. Responsabilité et disponibilité">
      <p>Nous faisons nos meilleurs efforts pour assurer la disponibilité du service, sans garantie d'absence d'interruption.</p>
    </Section>
    <Section title="7. Droit applicable">
      <p>Droit ivoirien. Contact : evalscolafrica@siteteck.com.</p>
    </Section>
  </Layout>
);

export const CookiePolicy = () => (
  <Layout title="Politique cookies">
    <Section title="Cookies essentiels (toujours actifs)">
      <p>Stockage local nécessaire à la connexion (session sécurisée), au thème d'affichage et à la mémorisation de votre choix cookies. Ils ne nécessitent pas de consentement.</p>
    </Section>
    <Section title="Mesure d'audience (avec votre accord)">
      <p>Google Tag Manager et Google Analytics (Google LLC, États-Unis) : pages vues et statistiques de visite. Ils ne sont chargés <strong>qu'après</strong> votre clic sur « Accepter ». Durée : jusqu'à 13 mois.</p>
    </Section>
    <Section title="Publicité">
      <p>Aucun cookie publicitaire n'est utilisé.</p>
    </Section>
    <Section title="Modifier votre choix">
      <p>Votre choix (date et version du texte affiché) est conservé sur votre appareil. Vous pouvez le retirer à tout moment :</p>
      <Button onClick={openConsentSettings} size="sm">Gérer les cookies</Button>
    </Section>
  </Layout>
);
