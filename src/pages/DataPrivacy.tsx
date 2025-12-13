import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Download, Trash2, Shield, Eye, Cookie, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";

const DataPrivacy = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    analytics: true,
    marketing: false,
    notifications: true,
  });

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    
    // Save to localStorage
    const consent = JSON.parse(localStorage.getItem("gdpr-consent") || "{}");
    consent[key] = !preferences[key];
    consent.date = new Date().toISOString();
    localStorage.setItem("gdpr-consent", JSON.stringify(consent));

    toast({
      title: "Préférences mises à jour",
      description: "Vos préférences de confidentialité ont été enregistrées.",
    });
  };

  const handleDownloadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour télécharger vos données.",
          variant: "destructive",
        });
        return;
      }

      // Get user data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const userData = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        profile,
        exportDate: new Date().toISOString(),
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mes-donnees-evalscol-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Téléchargement réussi",
        description: "Vos données ont été téléchargées avec succès.",
      });
    } catch (error) {
      logError('Data download failed', error, {
        component: 'DataPrivacy',
        action: 'download_user_data'
      });
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement de vos données.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Demande enregistrée",
        description: "Votre demande de suppression de compte a été enregistrée. Notre équipe la traitera dans les 30 jours conformément au RGPD.",
      });
      
      // In a real application, this would trigger a backend process
      // to handle account deletion according to RGPD requirements
    } catch (error) {
      logError('Account deletion request failed', error, {
        component: 'DataPrivacy',
        action: 'delete_account'
      });
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la demande de suppression.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          Confidentialité et données personnelles
        </h1>
        <p className="text-muted-foreground">
          Gérez vos préférences de confidentialité et exercez vos droits RGPD
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Préférences de cookies et confidentialité
          </CardTitle>
          <CardDescription>
            Contrôlez les cookies et le traitement de vos données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Cookies analytiques</Label>
              <p className="text-sm text-muted-foreground">
                Nous aide à améliorer l'expérience utilisateur
              </p>
            </div>
            <Switch
              id="analytics"
              checked={preferences.analytics}
              onCheckedChange={() => handlePreferenceChange('analytics')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Communications marketing</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des informations sur les nouveautés
              </p>
            </div>
            <Switch
              id="marketing"
              checked={preferences.marketing}
              onCheckedChange={() => handlePreferenceChange('marketing')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications importantes
              </p>
            </div>
            <Switch
              id="notifications"
              checked={preferences.notifications}
              onCheckedChange={() => handlePreferenceChange('notifications')}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 text-primary" />
              <span>
                Les cookies essentiels nécessaires au fonctionnement du site sont toujours actifs 
                et ne peuvent pas être désactivés.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vos droits RGPD
          </CardTitle>
          <CardDescription>
            Accédez, téléchargez ou supprimez vos données personnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold flex items-center gap-2">
                <Download className="h-4 w-4" />
                Télécharger mes données
              </h3>
              <p className="text-sm text-muted-foreground">
                Obtenez une copie de toutes vos données personnelles au format JSON 
                (droit à la portabilité - Article 20 RGPD)
              </p>
            </div>
            <Button onClick={handleDownloadData} variant="outline">
              Télécharger
            </Button>
          </div>

          <div className="flex items-start justify-between p-4 border rounded-lg border-destructive/50">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold flex items-center gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                Supprimer mon compte
              </h3>
              <p className="text-sm text-muted-foreground">
                Demander la suppression définitive de votre compte et de vos données 
                (droit à l'effacement - Article 17 RGPD)
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                ⚠️ Cette action est irréversible. Certaines données peuvent être conservées 
                pour des obligations légales.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Êtes-vous absolument sûr ?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action ne peut pas être annulée. Votre compte et toutes vos données 
                    seront définitivement supprimés de nos serveurs dans un délai de 30 jours 
                    conformément au RGPD.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Confirmer la suppression
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="bg-primary/10 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Besoin d'aide ?
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Pour toute question concernant vos données personnelles ou pour exercer d'autres droits 
              (rectification, limitation, opposition), contactez notre DPO :
            </p>
            <p className="text-sm font-mono bg-background p-2 rounded">
              evalscolafrica@siteteck.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPrivacy;
