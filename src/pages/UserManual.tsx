import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowLeft,
  BookOpen,
  School,
  Users,
  GraduationCap,
  ClipboardList,
  FileText,
  CreditCard,
  Bell,
  Shield,
  Settings as SettingsIcon,
  Brain,
} from "lucide-react";
import Seo from "@/components/Seo";

const sections = [
  {
    id: "compte",
    icon: Shield,
    title: "Compte et authentification",
    items: [
      {
        q: "Comment créer un compte administrateur ?",
        a: "Depuis la page d'inscription, choisissez « Créer une école ». Vous devenez automatiquement administrateur de votre établissement et recevez un code d'invitation (join_code) à partager avec votre équipe.",
      },
      {
        q: "Comment un enseignant rejoint-il l'école ?",
        a: "L'enseignant s'inscrit sur EvalScol puis saisit le code d'invitation de l'école dans son onboarding. Il est ensuite associé automatiquement à votre établissement.",
      },
      {
        q: "Comment les parents accèdent-ils au portail ?",
        a: "Un compte parent est créé automatiquement à l'inscription de l'élève. Vous pouvez leur renvoyer un lien de connexion via « Envoyer le lien du portail parent » dans la fiche élève.",
      },
      {
        q: "J'ai oublié mon mot de passe",
        a: "Cliquez sur « Mot de passe oublié » sur la page de connexion. Un email de réinitialisation vous sera envoyé.",
      },
    ],
  },
  {
    id: "ecole",
    icon: School,
    title: "Configuration de l'école",
    items: [
      {
        q: "Comment personnaliser le logo et les informations de l'école ?",
        a: "Rendez-vous dans Paramètres → École. Vous pouvez uploader votre logo (utilisé sur les bulletins), modifier le nom, l'adresse, le téléphone et l'email officiel.",
      },
      {
        q: "Comment créer les périodes scolaires (trimestres) ?",
        a: "Menu Paramètres → Périodes. Ajoutez chaque trimestre avec une date de début et de fin. Les bulletins sont générés par période.",
      },
      {
        q: "Comment créer les types d'évaluation ?",
        a: "Menu Types d'évaluation. Créez par exemple : Interrogation (coef. 1), Devoir (coef. 2), Examen (coef. 4). Ces coefficients sont utilisés dans le calcul des moyennes.",
      },
    ],
  },
  {
    id: "structure",
    icon: GraduationCap,
    title: "Classes, matières et emplois du temps",
    items: [
      {
        q: "Comment créer une classe ?",
        a: "Menu Classes → « Ajouter une classe ». Indiquez le nom (ex. CM2 A), le niveau et la capacité maximale.",
      },
      {
        q: "Comment ajouter une matière ?",
        a: "Menu Matières → « Ajouter ». Chaque matière a un nom, un code court et un coefficient par défaut modifiable par classe.",
      },
      {
        q: "Comment affecter un enseignant à une matière et une classe ?",
        a: "Menu Enseignants → cliquez sur l'enseignant → « Assigner ». Choisissez la classe et la matière. Un enseignant peut avoir plusieurs affectations.",
      },
      {
        q: "Comment créer l'emploi du temps ?",
        a: "Menu Emploi du temps → « Ajouter un créneau ». Sélectionnez la classe, la matière, l'enseignant, le jour et l'heure.",
      },
    ],
  },
  {
    id: "eleves",
    icon: Users,
    title: "Élèves et enseignants",
    items: [
      {
        q: "Comment inscrire un nouvel élève ?",
        a: "Menu Élèves → « Ajouter un élève ». Renseignez ses informations, ses parents (compte créé automatiquement) et sa classe. Vous pouvez aussi importer un fichier Excel.",
      },
      {
        q: "Comment modifier ou supprimer un élève ?",
        a: "Depuis la liste, cliquez sur l'élève. Le bouton Éditer ouvre la fiche, le bouton Supprimer archive l'élève et ses données liées (notes, paiements). La suppression demande confirmation.",
      },
      {
        q: "Comment ajouter un enseignant ?",
        a: "Menu Enseignants → « Ajouter ». Alternative : envoyez le code d'invitation à l'enseignant pour qu'il s'inscrive lui-même.",
      },
    ],
  },
  {
    id: "notes",
    icon: ClipboardList,
    title: "Évaluations et notes",
    items: [
      {
        q: "Comment créer une évaluation ?",
        a: "Menu Évaluations → « Nouvelle évaluation ». Choisissez la classe, la matière, le type (interrogation, devoir...), la date et le barème.",
      },
      {
        q: "Comment saisir les notes ?",
        a: "Sur une évaluation, cliquez sur « Saisir les notes ». Une grille affiche tous les élèves de la classe : entrez chaque note (0 à 20 par défaut).",
      },
      {
        q: "Puis-je modifier une note déjà saisie ?",
        a: "Oui, tant que le bulletin n'a pas été publié. Les moyennes se recalculent automatiquement.",
      },
    ],
  },
  {
    id: "bulletins",
    icon: FileText,
    title: "Bulletins et rapports",
    items: [
      {
        q: "Comment générer les bulletins d'une classe ?",
        a: "Menu Bulletins → sélectionnez la classe et la période → « Générer ». Un PDF par élève est créé avec les notes, moyennes, classement et appréciations.",
      },
      {
        q: "Puis-je ajouter des appréciations personnalisées ?",
        a: "Oui, avant génération vous pouvez saisir une appréciation par matière et une appréciation générale du chef d'établissement.",
      },
      {
        q: "Comment supprimer un bulletin ou des notes ?",
        a: "Depuis Bulletins → cliquez sur Supprimer pour retirer les notes d'un élève sur la période concernée. Confirmation requise.",
      },
    ],
  },
  {
    id: "paiements",
    icon: CreditCard,
    title: "Paiements Mobile Money",
    items: [
      {
        q: "Comment configurer Paystack ?",
        a: "Menu Paramètres → Paiements. Renseignez vos clés Paystack (obtenues sur dashboard.paystack.com). Le mode test est activé par défaut.",
      },
      {
        q: "Comment un parent paie-t-il les frais de scolarité ?",
        a: "Depuis le portail parent → « Payer les frais ». Le parent choisit le montant, entre son numéro Mobile Money et valide sur son téléphone. Le solde est mis à jour automatiquement.",
      },
      {
        q: "Où consulter l'historique des paiements ?",
        a: "Menu Facturation → onglet Paiements reçus. Filtres par élève, par classe, par période. Export Excel disponible.",
      },
    ],
  },
  {
    id: "ia",
    icon: Brain,
    title: "Intelligence artificielle",
    items: [
      {
        q: "À quoi sert l'Assistant IA ?",
        a: "Il génère du contenu pédagogique (exercices, quiz, corrections), rédige des appréciations et propose des analyses. Disponible dans le menu IA & Analyses.",
      },
      {
        q: "Comment fonctionne la détection d'élèves à risque ?",
        a: "L'algorithme analyse les notes, absences et évolutions pour identifier les élèves en difficulté et vous suggérer des interventions. Rafraîchi quotidiennement.",
      },
    ],
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Notifications et communication",
    items: [
      {
        q: "Comment activer les notifications parents ?",
        a: "Automatiques par défaut : nouveau bulletin, absence, paiement reçu. Personnalisation dans Paramètres → Notifications.",
      },
      {
        q: "Comment contacter le support ?",
        a: "Menu Support → onglet Chat en direct pour parler à notre équipe, ou email support@evalscol.com, ou WhatsApp +225 07 07 04 19 04.",
      },
    ],
  },
  {
    id: "avance",
    icon: SettingsIcon,
    title: "Fonctions avancées",
    items: [
      {
        q: "Comment générer une clé API ?",
        a: "Menu Tableau de bord → API → « Créer une clé ». Réservé aux administrateurs. Voir la documentation API pour l'utilisation.",
      },
      {
        q: "Comment gérer les rôles et permissions ?",
        a: "Menu Utilisateurs. Un administrateur peut promouvoir un enseignant en administrateur mais pas l'inverse via l'interface (protection anti-escalade).",
      },
      {
        q: "Où voir les logs et l'audit ?",
        a: "Command Center → Audit. Réservé aux super-administrateurs. Trace toutes les actions sensibles (suppressions, changements de rôle, paiements).",
      },
    ],
  },
];

export default function UserManual() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Manuel utilisateur | EvalScol Africa"
        description="Manuel utilisateur complet d'EvalScol Africa : compte, école, classes, élèves, notes, bulletins, paiements Mobile Money, IA et notifications."
        path="/user-manual"
      />

      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <Badge variant="outline" className="gap-1">
            <BookOpen className="h-3 w-3" /> Manuel v1.0
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <section className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Manuel utilisateur
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Toutes les fonctionnalités d'EvalScol Africa expliquées simplement, organisées par module.
            Utilisez le sommaire ci-dessous pour aller directement à ce qui vous intéresse.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button asChild className="bg-[#10B981] hover:bg-[#0ea472] text-white">
              <Link to="/getting-started">Guide de démarrage</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/api-docs">Documentation API</Link>
            </Button>
          </div>
        </section>

        {/* Sommaire */}
        <section className="mb-10">
          <Card>
            <CardHeader>
              <CardTitle>Sommaire</CardTitle>
              <CardDescription>Cliquez pour aller directement à une section</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                {sections.map(({ id, icon: Icon, title }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition text-sm"
                  >
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{title}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sections */}
        {sections.map(({ id, icon: Icon, title, items }) => (
          <section key={id} id={id} className="mb-10 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Icon className="h-6 w-6 text-primary" /> {title}
            </h2>
            <Card>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {items.map((item, i) => (
                    <AccordionItem key={i} value={`${id}-${i}`}>
                      <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>
        ))}

        {/* Contact */}
        <section className="mb-12">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">Une question n'est pas couverte ?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Notre équipe francophone vous répond du lundi au vendredi, 8h-18h GMT.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <a href="mailto:support@evalscol.com">support@evalscol.com</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="https://wa.me/2250707041904" target="_blank" rel="noreferrer">WhatsApp</a>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/support">Centre de support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EvalScol Africa · Manuel utilisateur
      </footer>
    </div>
  );
}
