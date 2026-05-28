import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Home, Users, GraduationCap, School, BookOpen, Calendar,
  ClipboardCheck, FileText, UserCog, BarChart3, CreditCard, Code,
  HelpCircle, Bell, Shield, Settings, ChevronDown, ChevronRight,
  Smartphone, Monitor, Search, Download, Sparkles, CheckCircle2,
  LogIn, UserPlus, Eye, Printer, Brain, Globe, Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";

interface GuideSection {
  id: string;
  icon: React.ElementType;
  title: string;
  badge?: string;
  description: string;
  steps: { title: string; detail: string }[];
  tips?: string[];
}

const guideSections: GuideSection[] = [
  {
    id: "auth",
    icon: LogIn,
    title: "Inscription & Connexion",
    description: "Comment créer un compte et se connecter à la plateforme.",
    steps: [
      { title: "Allez sur la page de connexion", detail: "Cliquez sur le bouton 'Connexion' sur la page d'accueil ou rendez-vous sur /auth." },
      { title: "Créez un compte", detail: "Sélectionnez l'onglet 'Inscription', remplissez votre nom, email, mot de passe et choisissez votre rôle (Admin, Enseignant)." },
      { title: "Code d'invitation (optionnel)", detail: "Si vous rejoignez une école existante, saisissez le code d'invitation fourni par votre administrateur." },
      { title: "Connectez-vous", detail: "Saisissez votre email et mot de passe puis cliquez 'Se connecter'. Vous serez redirigé vers le tableau de bord." },
    ],
    tips: ["Utilisez un mot de passe fort d'au moins 8 caractères.", "Si vous oubliez votre mot de passe, contactez votre administrateur."],
  },
  {
    id: "dashboard",
    icon: Home,
    title: "Tableau de Bord",
    description: "Vue d'ensemble de votre école en un coup d'œil.",
    steps: [
      { title: "Accédez au tableau de bord", detail: "Après connexion, vous arrivez automatiquement sur le tableau de bord principal." },
      { title: "Consultez les statistiques", detail: "Voyez en temps réel le nombre d'élèves, enseignants, classes et évaluations." },
      { title: "Graphiques interactifs", detail: "Explorez les graphiques de performance, taux de réussite et tendances." },
      { title: "Actions rapides", detail: "Utilisez les raccourcis pour ajouter rapidement un élève, une classe ou une évaluation." },
    ],
  },
  {
    id: "students",
    icon: Users,
    title: "Gestion des Élèves",
    description: "Ajoutez, modifiez et suivez vos élèves.",
    steps: [
      { title: "Accédez au menu 'Élèves'", detail: "Dans la barre latérale, cliquez sur 'Élèves' pour voir la liste de tous les élèves." },
      { title: "Ajouter un élève", detail: "Cliquez sur 'Ajouter un élève', remplissez le formulaire (nom, prénom, date de naissance, contact parents)." },
      { title: "Inscrire dans une classe", detail: "Sélectionnez un élève, puis cliquez 'Inscrire' pour l'affecter à une classe." },
      { title: "Gérer les paiements", detail: "Consultez le statut financier de chaque élève et gérez les frais de scolarité." },
      { title: "Rechercher un élève", detail: "Utilisez la barre de recherche pour retrouver rapidement un élève par son nom." },
    ],
    tips: ["Vous pouvez importer plusieurs élèves en masse via un fichier Excel.", "Les statuts de paiement sont : Payé, Partiel, Non payé."],
  },
  {
    id: "teachers",
    icon: GraduationCap,
    title: "Gestion des Enseignants",
    description: "Gérez l'équipe pédagogique de votre établissement.",
    steps: [
      { title: "Accédez au menu 'Enseignants'", detail: "Cliquez sur 'Enseignants' dans la barre latérale." },
      { title: "Ajouter un enseignant", detail: "Cliquez 'Ajouter un enseignant' et remplissez ses informations (nom, email, spécialité)." },
      { title: "Voir les classes attribuées", detail: "Cliquez sur un enseignant pour voir ses classes et matières assignées." },
      { title: "Suivi des présences", detail: "Enregistrez les présences/absences des enseignants." },
    ],
  },
  {
    id: "classrooms",
    icon: School,
    title: "Gestion des Classes",
    description: "Organisez vos salles de classe et niveaux.",
    steps: [
      { title: "Accédez au menu 'Classes'", detail: "Cliquez sur 'Classes' dans la barre latérale." },
      { title: "Créer une classe", detail: "Cliquez 'Ajouter une classe', donnez-lui un nom, un niveau et une capacité." },
      { title: "Voir les élèves", detail: "Cliquez sur une classe pour voir la liste de ses élèves inscrits." },
      { title: "Classements", detail: "Consultez les classements de la classe par période." },
    ],
  },
  {
    id: "subjects",
    icon: BookOpen,
    title: "Gestion des Matières",
    description: "Configurez les matières enseignées dans votre école.",
    steps: [
      { title: "Accédez au menu 'Matières'", detail: "Cliquez sur 'Matières' dans la barre latérale." },
      { title: "Ajouter une matière", detail: "Cliquez 'Ajouter une matière', saisissez le code, le nom et le coefficient." },
      { title: "Affecter aux classes", detail: "Assignez chaque matière à une classe avec un enseignant responsable via le menu 'Affectations'." },
    ],
  },
  {
    id: "schedule",
    icon: Calendar,
    title: "Emploi du Temps",
    description: "Planifiez les cours de la semaine.",
    steps: [
      { title: "Accédez au menu 'Emploi du temps'", detail: "Cliquez sur 'Emploi du temps' dans la barre latérale." },
      { title: "Créer un créneau", detail: "Cliquez 'Ajouter un cours', choisissez le jour, l'heure, la matière, l'enseignant et la salle." },
      { title: "Vue hebdomadaire", detail: "Visualisez l'emploi du temps complet de la semaine pour chaque classe." },
    ],
  },
  {
    id: "assessments",
    icon: ClipboardCheck,
    title: "Évaluations & Notes",
    badge: "Important",
    description: "Créez des évaluations et saisissez les notes des élèves.",
    steps: [
      { title: "Accédez au menu 'Évaluations'", detail: "Cliquez sur 'Évaluations' dans la barre latérale." },
      { title: "Créer une évaluation", detail: "Cliquez 'Nouvelle évaluation', choisissez la classe, la matière, le type (interrogation, devoir, examen) et la date." },
      { title: "Saisir les notes", detail: "Cliquez 'Saisir les notes' sur une évaluation, puis entrez la note de chaque élève (sur 20)." },
      { title: "Consulter les résultats", detail: "Les moyennes et classements sont calculés automatiquement après la saisie." },
    ],
    tips: ["Les coefficients sont appliqués automatiquement.", "Vous pouvez marquer un élève comme absent."],
  },
  {
    id: "reports",
    icon: FileText,
    title: "Bulletins & Rapports",
    badge: "Important",
    description: "Générez les bulletins scolaires automatiquement.",
    steps: [
      { title: "Accédez au menu 'Rapports'", detail: "Cliquez sur 'Rapports' dans la barre latérale." },
      { title: "Sélectionner la période", detail: "Choisissez le trimestre et la classe pour lesquels générer les bulletins." },
      { title: "Générer les bulletins", detail: "Cliquez 'Générer les rapports'. Les bulletins PDF sont créés automatiquement avec le logo de l'école." },
      { title: "Télécharger ou imprimer", detail: "Téléchargez les bulletins individuels ou en masse pour toute la classe." },
    ],
    tips: ["Les bulletins incluent automatiquement les moyennes, classements et appréciations.", "Publiez les bulletins pour les rendre accessibles aux parents."],
  },
  {
    id: "assignments",
    icon: UserCog,
    title: "Affectations",
    description: "Assignez les enseignants aux matières et classes.",
    steps: [
      { title: "Accédez au menu 'Affectations'", detail: "Cliquez sur 'Affectations' dans la barre latérale." },
      { title: "Créer une affectation", detail: "Choisissez un enseignant, une matière et une classe pour créer l'affectation." },
      { title: "Modifier les coefficients", detail: "Ajustez le coefficient de chaque matière par classe." },
    ],
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics & Statistiques",
    description: "Analysez les performances de votre école en profondeur.",
    steps: [
      { title: "Accédez au menu 'Analytics'", detail: "Cliquez sur 'Analytics' dans la barre latérale." },
      { title: "Taux de réussite", detail: "Consultez le taux de réussite global et par classe." },
      { title: "Tendances", detail: "Visualisez l'évolution des résultats au fil des trimestres." },
      { title: "IA prédictive", detail: "L'IA identifie automatiquement les élèves à risque nécessitant un suivi." },
    ],
  },
  {
    id: "billing",
    icon: CreditCard,
    title: "Facturation & Paiements",
    description: "Gérez votre abonnement et les paiements.",
    steps: [
      { title: "Accédez au menu 'Facturation'", detail: "Cliquez sur 'Facturation' dans la barre latérale." },
      { title: "Voir votre plan", detail: "Consultez votre plan actuel (Gratuit, Standard, Professional, Enterprise)." },
      { title: "Payer par mobile money", detail: "Utilisez Orange Money, MTN ou Moov Money pour le paiement." },
      { title: "Historique", detail: "Consultez l'historique de vos paiements et factures." },
    ],
  },
  {
    id: "parent-portal",
    icon: Eye,
    title: "Portail Parent",
    description: "Espace dédié pour les parents d'élèves.",
    steps: [
      { title: "Accéder au portail", detail: "Les parents accèdent via le lien /parent-portal avec leurs identifiants fournis par l'école." },
      { title: "Consulter les notes", detail: "Voir les notes et moyennes de votre enfant en temps réel." },
      { title: "Télécharger les bulletins", detail: "Téléchargez les bulletins PDF de chaque trimestre." },
      { title: "Payer les frais de scolarité", detail: "Payez directement via mobile money depuis le portail." },
    ],
  },
  {
    id: "settings",
    icon: Settings,
    title: "Réglages",
    description: "Configurez votre école et personnalisez la plateforme.",
    steps: [
      { title: "Accédez au menu 'Réglages'", detail: "Cliquez sur 'Réglages' dans la barre latérale." },
      { title: "Informations école", detail: "Ajoutez le nom, logo, adresse et contacts de votre école." },
      { title: "Année académique", detail: "Définissez l'année académique en cours et les périodes scolaires (trimestres)." },
      { title: "Personnalisation", detail: "Personnalisez les bulletins avec le logo et les couleurs de votre école." },
    ],
  },
  {
    id: "users",
    icon: Shield,
    title: "Gestion des Utilisateurs",
    description: "Gérez les comptes et les rôles des utilisateurs.",
    steps: [
      { title: "Accédez au menu 'Utilisateurs'", detail: "Cliquez sur 'Utilisateurs' dans la barre latérale (accès Admin uniquement)." },
      { title: "Voir les comptes", detail: "Consultez la liste de tous les utilisateurs avec leurs rôles." },
      { title: "Modifier les rôles", detail: "Changez le rôle d'un utilisateur (Admin, Enseignant, Parent)." },
    ],
    tips: ["Seuls les administrateurs ont accès à cette section.", "Les rôles déterminent les permissions d'accès."],
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Notifications",
    description: "Restez informé des événements importants.",
    steps: [
      { title: "Accédez aux notifications", detail: "Cliquez sur 'Notifications' dans la barre latérale ou l'icône cloche." },
      { title: "Consulter les alertes", detail: "Voyez les nouveaux bulletins publiés, les paiements reçus et les alertes système." },
    ],
  },
  {
    id: "support",
    icon: HelpCircle,
    title: "Support & Aide",
    description: "Obtenez de l'aide quand vous en avez besoin.",
    steps: [
      { title: "Accédez au menu 'Support'", detail: "Cliquez sur 'Support' dans la barre latérale." },
      { title: "Envoyer un ticket", detail: "Décrivez votre problème et soumettez un ticket de support." },
      { title: "Contacter l'équipe", detail: "Email : support@evalscol.com | WhatsApp : +225 07 07 04 19 04" },
    ],
  },
];

function GuideSectionCard({ section }: { section: GuideSection }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = section.icon;

  return (
    <Card className="overflow-hidden border-border/60 hover:border-primary/30 transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-center gap-4 hover:bg-muted/30 transition-colors"
      >
        <div className="p-3 rounded-xl bg-primary/10 shrink-0">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg text-foreground">{section.title}</h3>
            {section.badge && (
              <Badge variant="secondary" className="text-xs bg-primary/15 text-primary border-0">
                {section.badge}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{section.description}</p>
        </div>
        <div className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border/40 pt-4">
          <ol className="space-y-3">
            {section.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          {section.tips && section.tips.length > 0 && (
            <div className="bg-accent/30 rounded-lg p-4 mt-3">
              <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Conseils
              </p>
              <ul className="space-y-1">
                {section.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function UserGuide() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = guideSections.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-10">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>

          <div className="text-center">
            <img src="/logo.png" alt="EvalScol Logo" className="h-20 w-auto mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Guide d'Utilisation Complet
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Apprenez à utiliser chaque fonctionnalité d'EvalScol Africa étape par étape.
              Cliquez sur une section pour voir les instructions détaillées.
            </p>
          </div>
        </header>

        {/* Quick start */}
        <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Démarrage Rapide
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { step: "1", label: "Créez votre compte", icon: UserPlus },
              { step: "2", label: "Configurez l'école", icon: Settings },
              { step: "3", label: "Ajoutez élèves & enseignants", icon: Users },
              { step: "4", label: "Lancez les évaluations", icon: ClipboardCheck },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/40">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                  {item.step}
                </span>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une fonctionnalité..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Sections */}
        <div className="space-y-3 mb-12">
          {filtered.length > 0 ? (
            filtered.map((section) => <GuideSectionCard key={section.id} section={section} />)
          ) : (
            <p className="text-center text-muted-foreground py-12">Aucun résultat pour « {search} »</p>
          )}
        </div>

        {/* Compatibility */}
        <Card className="p-6 mb-8 border-border/40">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <Globe className="h-5 w-5 text-primary" />
            Compatibilité
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Monitor className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Navigateurs</p>
                <p>Chrome, Firefox, Safari, Edge (versions récentes)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Appareils</p>
                <p>Ordinateur, tablette, smartphone — interface 100% responsive</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Sécurité</p>
                <p>Chiffrement SSL, sauvegardes quotidiennes, conformité RGPD</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Intelligence Artificielle</p>
                <p>Assistant IA intégré pour la génération de contenu pédagogique</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-3 text-foreground">Besoin d'aide supplémentaire ?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Notre équipe est disponible pour vous accompagner à chaque étape.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => navigate("/dashboard/support")}>
                Contacter le Support
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/parent-guide")}>
                Guide Parent
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.open("mailto:support@evalscol.com?subject=Aide EvalScol")}
              >
                Envoyer un Email
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
