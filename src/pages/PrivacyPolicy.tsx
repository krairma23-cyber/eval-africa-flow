import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Lock, Eye, Download, Trash2 } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            Politique de Confidentialité RGPD
          </h1>
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                1. Responsable du traitement des données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                EvalScol est responsable du traitement de vos données personnelles conformément au 
                Règlement Général sur la Protection des Données (RGPD - UE 2016/679).
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold">Contact DPO (Délégué à la Protection des Données) :</p>
                <p>Email : evalscolafrica@siteteck.com</p>
                <p>Adresse : Abidjan, Côte d'Ivoire</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                2. Données collectées et finalités
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Données des élèves :</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Identité (nom, prénom, date de naissance)</li>
                  <li>Coordonnées des parents/tuteurs légaux</li>
                  <li>Résultats scolaires et évaluations</li>
                  <li>Finalité : Gestion scolaire, suivi pédagogique, communication avec les familles</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Données des enseignants :</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Identité et coordonnées professionnelles</li>
                  <li>Affectations et classes</li>
                  <li>Finalité : Gestion du personnel, organisation pédagogique</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Cookies et données de connexion :</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Cookies essentiels (authentification)</li>
                  <li>Cookies analytiques (amélioration du service)</li>
                  <li>Logs de connexion (sécurité)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Base légale du traitement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• <strong>Mission d'intérêt public</strong> : Gestion des établissements scolaires (Article 6(1)(e) RGPD)</p>
              <p>• <strong>Consentement</strong> : Pour les cookies analytiques et communications non-obligatoires</p>
              <p>• <strong>Contrat</strong> : Inscription et scolarisation des élèves</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Durée de conservation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• <strong>Données élèves actifs</strong> : Durée de scolarité + 1 an</p>
              <p>• <strong>Résultats scolaires</strong> : Conformément aux obligations légales (archivage)</p>
              <p>• <strong>Données enseignants</strong> : Durée du contrat + obligations légales</p>
              <p>• <strong>Logs de sécurité</strong> : 12 mois maximum</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                5. Vos droits RGPD
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Eye className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Droit d'accès</p>
                    <p className="text-sm text-muted-foreground">Obtenir une copie de vos données personnelles</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Download className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Droit à la portabilité</p>
                    <p className="text-sm text-muted-foreground">Recevoir vos données dans un format structuré</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Trash2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Droit à l'effacement</p>
                    <p className="text-sm text-muted-foreground">Demander la suppression de vos données (sous conditions)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Lock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Droit à la rectification</p>
                    <p className="text-sm text-muted-foreground">Corriger des données inexactes ou incomplètes</p>
                  </div>
                </div>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg mt-4">
                <p className="font-semibold mb-2">Exercer vos droits :</p>
                <p className="text-sm mb-3">Connectez-vous à votre compte et accédez aux paramètres de confidentialité</p>
                <Button asChild>
                  <Link to="/dashboard/settings">
                    Gérer mes données personnelles
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Sécurité des données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Chiffrement des données sensibles (AES-256)</li>
                <li>Authentification sécurisée et gestion des sessions</li>
                <li>Logs d'audit pour tracer les accès aux données</li>
                <li>Hébergement en Europe (conformité RGPD)</li>
                <li>Sauvegardes régulières et plan de continuité</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Transferts de données</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>Vos données sont hébergées au sein de l'Union Européenne et ne font l'objet d'aucun transfert 
              vers des pays tiers, sauf consentement explicite et garanties appropriées (clauses contractuelles types).</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Réclamation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="mb-2">
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation 
                auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>CNIL</strong></p>
                <p>3 Place de Fontenoy - TSA 80715</p>
                <p>75334 PARIS CEDEX 07</p>
                <p>Tél : 01 53 73 22 22</p>
                <p>Site : <a href="https://www.cnil.fr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a></p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Modifications</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>
                Cette politique de confidentialité peut être mise à jour. Vous serez informé de tout 
                changement significatif par email ou notification sur le site.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <Link to="/">
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
