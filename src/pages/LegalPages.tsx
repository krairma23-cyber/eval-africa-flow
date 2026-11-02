import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { openConsentSettings } from "@/lib/consent";
import { Seo } from "@/components/Seo";

const LAST_UPDATED = "2 novembre 2026";

const Layout = ({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Retour à l'accueil</Link>
      </Button>
      <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-foreground">{title}</h1>
      <p className="text-xs text-muted-foreground mb-8">Dernière mise à jour : {LAST_UPDATED}</p>
      {intro}
      <div className="space-y-6 text-sm text-foreground">{children}</div>
    </div>
  </div>
);

const Section = ({ id, title, children }: { id?: string; title: string; children: ReactNode }) => (
  <Card id={id} className="scroll-mt-6">
    <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
    <CardContent className="space-y-2">{children}</CardContent>
  </Card>
);

const Summary = ({ items }: { items: string[] }) => (
  <div className="rounded-lg border border-border bg-muted/50 p-5 mb-8">
    <div className="flex items-center gap-2 mb-3">
      <FileText className="h-4 w-4 text-primary" />
      <h2 className="text-base font-semibold text-foreground">Ce qu'il faut retenir</h2>
    </div>
    <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  </div>
);

const Toc = ({ links }: { links: { id: string; label: string }[] }) => (
  <nav aria-label="Sommaire" className="rounded-lg border border-border bg-card p-5 mb-8">
    <h2 className="text-base font-semibold text-foreground mb-3">Sommaire</h2>
    <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal pl-5">
      {links.map((l) => (
        <li key={l.id}>
          <a href={`#${l.id}`} className="text-primary underline-offset-2 hover:underline">{l.label}</a>
        </li>
      ))}
    </ol>
  </nav>
);

export const LegalNotice = () => (
  <>
    <Seo
      title="Mentions légales | EvalScol Africa"
      description="Mentions légales d'EvalScol Africa : éditeur, conception par 2KK Technologie, hébergement et propriété intellectuelle."
      path="/mentions-legales"
      type="article"
    />
    <Layout title="Mentions légales">
      <Section title="Éditeur du site">
        <p><strong>EvalScol Africa</strong> — Plateau, Abidjan, Côte d'Ivoire</p>
        <p>Forme juridique, RCCM et capital : [à compléter]</p>
        <p>Directeur de la publication : [à compléter]</p>
        <p>Téléphone : +225 01 01 82 13 29 — Email : support@siteteck.com</p>
      </Section>
      <Section title="Conception et développement">
        <p>La plateforme EvalScol Africa est conçue et développée par <strong>2KK Technologie</strong> (Côte d'Ivoire).</p>
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
  </>
);

const CGU_TOC = [
  { id: "cgu-objet", label: "Objet et acceptation" },
  { id: "cgu-definitions", label: "Définitions" },
  { id: "cgu-service", label: "Description du service" },
  { id: "cgu-offres", label: "Offres, essai et tarifs" },
  { id: "cgu-comptes", label: "Comptes et sécurité" },
  { id: "cgu-obligations", label: "Obligations de l'établissement" },
  { id: "cgu-evalscol", label: "Obligations d'EvalScol" },
  { id: "cgu-eleves", label: "Données des élèves et des parents" },
  { id: "cgu-dp", label: "Données personnelles et cookies" },
  { id: "cgu-ia", label: "Contenus générés par l'IA" },
  { id: "cgu-interdits", label: "Usages interdits" },
  { id: "cgu-pi", label: "Propriété intellectuelle" },
  { id: "cgu-paiement", label: "Paiements et facturation" },
  { id: "cgu-resiliation", label: "Durée et résiliation" },
  { id: "cgu-suspension", label: "Suspension et interruption" },
  { id: "cgu-responsabilite", label: "Garanties et responsabilité" },
  { id: "cgu-force-majeure", label: "Force majeure" },
  { id: "cgu-reclamation", label: "Réclamations et médiation" },
  { id: "cgu-modification", label: "Modification des CGU" },
  { id: "cgu-droit", label: "Droit applicable et litiges" },
  { id: "cgu-contact", label: "Contact" },
];

export const TermsOfUse = () => (
  <>
    <Seo
      title="Conditions générales d'utilisation (CGU) | EvalScol Africa"
      description="Conditions générales d'utilisation d'EvalScol Africa : offres et tarifs, comptes et sécurité, données des élèves, paiement, résiliation et droit applicable."
      path="/cgu"
      type="article"
    />
    <Layout
      title="Conditions générales d'utilisation"
      intro={
        <Summary
          items={[
            "EvalScol Africa est un service en ligne d'abonnement, sans engagement, réservé aux établissements scolaires et à leur personnel.",
            "L'essai Découverte est gratuit pendant 30 jours (jusqu'à 100 élèves) et sans carte bancaire.",
            "Vous restez responsable de toutes les données d'élèves saisies ; EvalScol les traite uniquement pour fournir le service.",
            "Les paiements sont effectués par Paystack (mobile money et cartes). Vous pouvez résilier à tout moment depuis l'espace Facturation.",
            "Le service est fourni avec nos meilleurs efforts de disponibilité ; aucun résultat n'est garanti.",
            "En cas de question, écrivez à support@siteteck.com.",
          ]}
        />
      }
    >
      <Toc links={CGU_TOC} />

      <Section id="cgu-objet" title="1. Objet et acceptation">
        <p>Les présentes conditions générales d'utilisation (« CGU ») régissent l'accès et l'utilisation de la plateforme EvalScol Africa, service en ligne de gestion scolaire destiné aux établissements d'enseignement, à leur personnel et aux parents d'élèves.</p>
        <p>En créant un compte, en confirmant votre inscription ou en utilisant la plateforme, vous reconnaissez avoir lu les présentes CGU et vous les acceptez sans réserve. Si vous agissez au nom d'un établissement, vous déclarez avoir le pouvoir d'engager cet établissement.</p>
        <p>À défaut d'acceptation, l'accès à la plateforme doit être interrompu immédiatement.</p>
      </Section>

      <Section id="cgu-definitions" title="2. Définitions">
        <p><strong>Plateforme</strong> : l'application web EvalScol Africa, ses pages publiques, son tableau de bord, son portail parent et ses interfaces de programmation (API).</p>
        <p><strong>Établissement</strong> : l'école, le collège, le lycée, le groupe scolaire ou le réseau qui souscrit un abonnement et qui saisit les données de ses élèves.</p>
        <p><strong>Utilisateur</strong> : toute personne disposant d'un compte (administrateur, enseignant, parent, personnel).</p>
        <p><strong>Données saisies</strong> : toutes les informations ajoutées par l'Établissement sur la Plateforme (élèves, familles, notes, absences, paiements, documents).</p>
        <p><strong>Sous-traitant</strong> : un prestataire chargé par EvalScol d'une partie du service (hébergement, paiement, envoi d'emails).</p>
      </Section>

      <Section id="cgu-service" title="3. Description du service">
        <p>EvalScol Africa met à disposition, en mode location (SaaS), un ensemble de modules : gestion des élèves et des inscriptions, gestion des enseignants et des matières, saisie et calcul des notes, génération de bulletins, suivi des absences, emploi du temps, facturation et paiements de la scolarité, portail parent, statistiques et assistance par intelligence artificielle.</p>
        <p>La Plateforme est accessible par navigateur internet, sur ordinateur, tablette ou téléphone. Aucune installation locale n'est requise. Les fonctionnalités effectivement disponibles dépendent de l'offre souscrite.</p>
      </Section>

      <Section id="cgu-offres" title="4. Offres, essai et tarifs">
        <p>Les offres et tarifs affichés sur la page Tarifs au moment de la commande s'appliquent. À la date de mise à jour des présentes :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Découverte</strong> — essai gratuit de 30 jours, sans carte bancaire, jusqu'à 100 élèves et 1 portail parent offert.</li>
          <li><strong>Essentiel École</strong> — 50 000 FCFA par an, élèves illimités côté école ; portails parents facturés 2 500 FCFA par parent et par an.</li>
          <li><strong>Pro IA</strong> — 120 000 FCFA par an, incluant l'AI Assistant, les analyses avancées, l'API et les webhooks.</li>
          <li><strong>Secondaire Premium IA</strong> — 120 000 FCFA par an, avec portail parent premium à 3 000 FCFA par parent et par an.</li>
          <li><strong>Groupe Scolaire</strong> — sur devis, à partir de 250 000 FCFA par an, avec engagement de disponibilité renforcé.</li>
        </ul>
        <p>Les tarifs sont indiqués en francs CFA (XOF), hors taxes applicables, et peuvent être révisés. Toute révision est communiquée au moins 30 jours avant son entrée en vigueur et ne s'applique qu'à la période de facturation suivante.</p>
        <p>À l'issue de l'essai gratuit, aucun prélèvement n'est effectué sans souscription volontaire à une offre payante.</p>
      </Section>

      <Section id="cgu-comptes" title="5. Comptes, accès et sécurité">
        <p>L'inscription exige une adresse email valide et un mot de passe sécurisé (8 caractères minimum). L'adresse email doit être vérifiée avant l'accès complet.</p>
        <p>L'utilisateur est seul responsable de la confidentialité de ses identifiants et de toute activité réalisée depuis son compte. Il doit signaler sans délai à EvalScol toute utilisation non autorisée.</p>
        <p>Les administrateurs d'un établissement gèrent les comptes de leur personnel et des parents. Le personnel et les parents d'un établissement rejoignent la plateforme sur invitation nominative de cet établissement : l'accès à un espace scolaire ne peut être obtenu qu'à la suite d'une invitation adressée à la personne concernée.</p>
        <p>EvalScol peut refuser, suspendre ou fermer un compte en cas de non-respect des CGU ou de menace pour la sécurité de la Plateforme.</p>
      </Section>

      <Section id="cgu-obligations" title="6. Obligations de l'établissement">
        <p>L'Établissement s'engage à :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>fournir et maintenir des informations exactes et à jour ;</li>
          <li>ne saisir que des données qu'il a le droit de collecter et de traiter, et en informer les familles ;</li>
          <li>obtenir, lorsque la loi l'exige, le consentement des parents ou des élèves concernés ;</li>
          <li>limiter l'accès de chaque personne aux seules informations dont elle a besoin ;</li>
          <li>ne pas utiliser la Plateforme pour conserver des données devenues inutiles ou excessives.</li>
        </ul>
        <p>L'Établissement est responsable des données qu'il saisit et des conséquences de leur diffusion. Il garantit EvalScol contre toute réclamation d'un tiers liée à ces données.</p>
      </Section>

      <Section id="cgu-evalscol" title="7. Obligations d'EvalScol">
        <p>EvalScol met en œuvre les moyens nécessaires à la fourniture du service : hébergement sécurisé, cloisonnement étanche des données de chaque établissement, sauvegardes automatiques régulières, contrôles d'accès et journalisation des actions sensibles.</p>
        <p>EvalScol est tenu à une obligation de moyens. Les mises à jour, corrections et évolutions sont incluses dans l'abonnement, sans supplément.</p>
      </Section>

      <Section id="cgu-eleves" title="8. Données des élèves et des parents">
        <p>Au sens de la réglementation sur la protection des données, <strong>l'Établissement est responsable du traitement</strong> des données de ses élèves et de leurs familles, et <strong>EvalScol est sous-traitant</strong> : elles sont traitées uniquement sur instruction de l'Établissement et uniquement pour fournir le service.</p>
        <p>Les données d'un établissement ne sont jamais accessibles à un autre établissement. Elles ne sont ni revendues, ni exploitées commercialement, ni utilisées pour de la publicité.</p>
        <p>L'Établissement peut, depuis son espace, exporter l'intégralité de ses données et demander la suppression définitive des données d'un élève. Après résiliation, les données sont conservées puis supprimées selon les durées précisées dans la politique de confidentialité.</p>
      </Section>

      <Section id="cgu-dp" title="9. Données personnelles et cookies">
        <p>Le traitement des données personnelles des utilisateurs est décrit dans la <Link to="/privacy-policy" className="text-primary underline">politique de confidentialité</Link>.</p>
        <p>Les cookies de fonctionnement sont toujours actifs ; les outils de mesure d'audience et de publicité ne sont déposés qu'après consentement exprès et peuvent être retirés à tout moment (voir la <Link to="/cookies" className="text-primary underline">politique cookies</Link> et le bouton « Gérer les cookies »).</p>
        <p>Chaque utilisateur dispose d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité. Ces demandes s'adressent à support@siteteck.com et reçoivent une réponse dans un délai raisonnable.</p>
      </Section>

      <Section id="cgu-ia" title="10. Contenus générés par l'intelligence artificielle">
        <p>Les modules d'aide (génération d'exercices, de sujets, de corrigés, d'analyses et de repérage d'élèves en difficulté) produisent des propositions automatiques, fournies à titre indicatif.</p>
        <p>Ces propositions ne constituent ni une évaluation officielle, ni une décision médicale, ni un conseil pédagogique engageant. Elles doivent être vérifiées et validées par un enseignant ou par l'administration avant toute utilisation ou communication aux familles. La décision finale appartient toujours à l'Établissement.</p>
        <p>Aucune donnée d'un établissement n'est utilisée pour entraîner des modèles destinés à d'autres clients.</p>
      </Section>

      <Section id="cgu-interdits" title="11. Usages interdits">
        <p>Il est notamment interdit de :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>tenter de consulter, de modifier ou de supprimer les données d'un autre établissement, ou de contourner les contrôles d'accès ;</li>
          <li>installer, diffuser ou tenter d'injecter du code malveillant ;</li>
          <li>soumettre la Plateforme à des sollicitations excessives, automatisées ou destinées à la saturer ;</li>
          <li>copier, imiter, vendre ou redistribuer la Plateforme, tout ou partie de ses données ou de ses interfaces ;</li>
          <li>saisir des données à caractère discriminatoire, diffamatoires, ou portant atteinte aux droits des personnes ;</li>
          <li>utiliser la Plateforme à des fins illégales ou pour tromper les familles.</li>
        </ul>
      </Section>

      <Section id="cgu-pi" title="12. Propriété intellectuelle">
        <p>La Plateforme, sa marque, son logo, son interface et sa documentation sont la propriété d'EvalScol Africa ou de ses concédants. L'abonnement ne transfère aucun droit de propriété, seulement un droit d'usage personnel, non exclusif et non cessible pendant la durée du contrat.</p>
        <p>Les données saisies par l'Établissement et les documents qu'il produit (bulletins, reçus, rapports) lui appartiennent. Il en autorise l'usage strictement nécessaire au fonctionnement du service.</p>
        <p>La mention « Conçu par 2KK Technologie » accompagnée du logo du concepteur est conservée dans les espaces prévus à cet effet et ne peut être retirée sans accord écrit.</p>
      </Section>

      <Section id="cgu-paiement" title="13. Paiements et facturation">
        <p>Les abonnements sont facturés à l'avance, annuellement. Les paiements en ligne sont traités par <strong>Paystack</strong> (Mobile Money Orange, MTN, Moov, Wave et cartes bancaires). EvalScol ne conserve pas les coordonnées bancaires ou de mobile money des payeurs.</p>
        <p>Un reçu est généré après chaque paiement. Les frais de scolarité réglés par les parents via le portail concernent l'Établissement et l'élève désignés, et sont rattachés à leur dossier.</p>
        <p>Tout retard de paiement peut entraîner, après relance restée sans effet, la réduction ou la suspension de l'accès aux modules payants, puis la résiliation du contrat.</p>
      </Section>

      <Section id="cgu-resiliation" title="14. Durée et résiliation">
        <p>Le contrat est conclu pour la durée de l'abonnement choisi, <strong>sans engagement de durée</strong>. Il peut être résilié à tout moment depuis l'espace Facturation.</p>
        <p>La résiliation prend effet à la fin de la période déjà réglée : les sommes versées pour la période en cours ne sont pas remboursées, sauf disposition légale impérative contraire. Les modules restent accessibles jusqu'à cette échéance.</p>
        <p>Après la résiliation, l'Établissement peut exporter ses données pendant une durée raisonnable annoncée par email, puis les données sont supprimées ou rendues anonymes, sauf obligation légale de conservation.</p>
        <p>EvalScol peut résilier le contrat en cas de manquement grave et persistant aux CGU, après une mise en demeure restée sans effet pendant 15 jours.</p>
      </Section>

      <Section id="cgu-suspension" title="15. Suspension, maintenance et interruption">
        <p>EvalScol peut interrompre temporairement le service pour maintenance, mise à jour, migration ou pour protéger la sécurité de la Plateforme. Lorsque l'opération est planifiée, elle est annoncée à l'avance.</p>
        <p>En cas de difficulté de sécurité, de non-paiement ou d'usage interdit, l'accès peut être suspendu immédiatement, pour la durée strictement nécessaire.</p>
        <p>Les engagements de disponibilité renforcés (SLA) s'appliquent uniquement aux contrats qui les prévoient expressément.</p>
      </Section>

      <Section id="cgu-responsabilite" title="16. Garanties et responsabilité">
        <p>Le service est fourni « en l'état ». EvalScol ne garantit pas que la Plateforme sera exempte d'interruptions ou d'erreurs, ni que les résultats obtenus (moyennes, classements, repérages d'élèves en difficulté, contenus générés) seront exacts ou conformes à une attente particulière.</p>
        <p>EvalScol ne peut être tenue responsable des données saisies, des décisions prises sur la base de ces données, ni du matériel, de la connexion internet ou des extensions utilisées par l'utilisateur.</p>
        <p>Sauf faute lourde ou dol, la responsabilité d'EvalScol est limitée aux sommes effectivement versées par l'Établissement au titre des 12 derniers mois. Sont exclus les préjudices indirects (perte de chance, perte de données non récupérables alors qu'un export était possible, préjudice commercial).</p>
        <p>Rien dans les présentes ne limite la responsabilité d'EvalScol lorsqu'elle ne peut être légalement limitée.</p>
      </Section>

      <Section id="cgu-force-majeure" title="17. Force majeure">
        <p>EvalScol n'est pas tenue responsable d'un manquement causé par un événement de force majeure : catastrophe naturelle, maladie, conflit, blocage ou panne de télécommunications ou d'énergie, décision d'une autorité, intrusion extérieure grave, indisponibilité d'un fournisseur cloud ou de Paystack, ou tout événement échappant à son contrôle raisonnable.</p>
        <p>Les obligations sont suspendues pendant la durée de l'événement, et la partie concernée en informe l'autre dans la mesure du possible.</p>
      </Section>

      <Section id="cgu-reclamation" title="18. Réclamations et médiation">
        <p>Toute réclamation doit être adressée par écrit à support@siteteck.com en indiquant le compte, l'établissement et les faits. Une réponse motivée est apportée dans un délai raisonnable.</p>
        <p>À défaut de solution amiable, les parties peuvent recourir à un médiateur, avant toute action judiciaire.</p>
      </Section>

      <Section id="cgu-modification" title="19. Modification des CGU">
        <p>Les CGU peuvent être adaptées pour tenir compte de l'évolution du service, de la réglementation ou des pratiques. La version applicable est celle publiée sur cette page à la date de la dernière mise à jour.</p>
        <p>Les changements importants sont signalés par email ou par un message dans l'espace de l'Établissement avant leur entrée en vigueur. La poursuite de l'utilisation vaut acceptation de la nouvelle version ; à défaut, le contrat peut être résilié avant son application.</p>
      </Section>

      <Section id="cgu-droit" title="20. Droit applicable et litiges">
        <p>Les présentes CGU sont soumises au <strong>droit ivoirien</strong>, à l'exclusion des règles de conflit de lois.</p>
        <p>À défaut d'accord amiable, les litiges sont portés devant les juridictions compétentes d'Abidjan, Côte d'Ivoire. La nullité d'une clause n'affecte pas la validité des autres dispositions.</p>
        <p>La version française des CGU prévaut en cas de traduction.</p>
      </Section>

      <Section id="cgu-contact" title="21. Contact">
        <p>Questions sur les CGU, les données ou la résiliation :</p>
        <p><strong>Email</strong> : support@siteteck.com — <strong>Téléphone / WhatsApp</strong> : +225 01 01 82 13 29</p>
        <p><strong>EvalScol Africa</strong> — Plateau, Abidjan, Côte d'Ivoire. Plateforme conçue et développée par 2KK Technologie.</p>
      </Section>
    </Layout>
  </>
);

export const CookiePolicy = () => (
  <>
    <Seo
      title="Politique cookies | EvalScol Africa"
      description="Politique cookies d'EvalScol Africa : cookies essentiels, mesure d'audience et publicité, et gestion de votre consentement."
      path="/cookies"
      type="article"
    />
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
  </>
);
