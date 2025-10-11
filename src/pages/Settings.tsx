import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, School, Bell, Shield, Palette, Upload, Image as ImageIcon } from "lucide-react";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Settings state
  const [schoolName, setSchoolName] = useState("École Primaire Example");
  const [schoolAddress, setSchoolAddress] = useState("123 Rue de l'École, Paris");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reportReminders, setReportReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    getCurrentUser();
    loadSchoolData();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadSchoolData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's school from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('user_id', user.id)
        .single();

      if (profile?.school_id) {
        setSchoolId(profile.school_id);

        // Get school data including logo, address, and academic year
        const { data: school } = await supabase
          .from('schools')
          .select('name, logo_url, address, academic_year')
          .eq('id', profile.school_id)
          .single();

        if (school) {
          setSchoolName(school.name || "École Primaire Example");
          setSchoolAddress(school.address || "123 Rue de l'École, Paris");
          setAcademicYear(school.academic_year || "2025-2026");
          
          if (school.logo_url) {
            if (school.logo_url.startsWith("http")) {
              setLogoUrl(school.logo_url);
            } else {
              const { data } = supabase.storage
                .from('school-logos')
                .getPublicUrl(school.logo_url);
              setLogoUrl(data.publicUrl);
            }
          }
        }
      }

      // Load user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (preferences) {
        setEmailNotifications(preferences.email_notifications ?? true);
        setReportReminders(preferences.report_reminders ?? true);
        setDarkMode(preferences.dark_mode ?? false);
      }
    } catch (error) {
      console.error('Error loading school data:', error);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;
      if (!schoolId) {
        toast({
          title: "Profil en cours de chargement",
          description: "Veuillez réessayer dans quelques secondes.",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Type de fichier invalide",
          description: "Seuls les formats JPG, PNG et WebP sont acceptés",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2097152) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale est de 2MB",
          variant: "destructive",
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${schoolId}/logo.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('school-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update school record
      const { error: updateError } = await supabase
        .from('schools')
        .update({ logo_url: filePath })
        .eq('id', schoolId);

      if (updateError) throw updateError;

      // Get public URL
      const { data } = supabase.storage
        .from('school-logos')
        .getPublicUrl(filePath);

      setLogoUrl(data.publicUrl);

      toast({
        title: "Logo mis à jour",
        description: "Le logo de votre établissement a été mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      if (!schoolId || !user) {
        throw new Error("Données manquantes");
      }

      // Save school information
      const { error: schoolError } = await supabase
        .from('schools')
        .update({
          name: schoolName,
          address: schoolAddress,
          academic_year: academicYear,
        })
        .eq('id', schoolId);

      if (schoolError) throw schoolError;

      // Save user preferences
      const { error: prefsError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          email_notifications: emailNotifications,
          report_reminders: reportReminders,
          dark_mode: darkMode,
        }, {
          onConflict: 'user_id'
        });

      if (prefsError) throw prefsError;

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos paramètres ont été mis à jour avec succès",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Configurez les paramètres de votre établissement
        </p>
      </div>

      <div className="grid gap-6">
        {/* École */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Informations de l'établissement
            </CardTitle>
            <CardDescription>
              Gérez les informations générales de votre école
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="school-logo">Logo de l'établissement</Label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative w-32 h-32 border-2 border-border rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={logoUrl}
                      alt="Logo de l'établissement"
                      loading="lazy"
                      onError={() => setLogoUrl(null)}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Téléchargement..." : "Télécharger un logo"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG ou WebP. Max 2MB.
                  </p>
                </div>
              </div>
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="school-name">Nom de l'établissement</Label>
              <Input
                id="school-name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="school-address">Adresse</Label>
              <Textarea
                id="school-address"
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="academic-year">Année scolaire</Label>
              <Input
                id="academic-year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configurez vos préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications par email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications importantes par email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rappels de bulletins</Label>
                <p className="text-sm text-muted-foreground">
                  Rappels automatiques pour la génération des bulletins
                </p>
              </div>
              <Switch
                checked={reportReminders}
                onCheckedChange={setReportReminders}
              />
            </div>
          </CardContent>
        </Card>

        {/* Apparence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Apparence
            </CardTitle>
            <CardDescription>
              Personnalisez l'apparence de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mode sombre</Label>
                <p className="text-sm text-muted-foreground">
                  Activer le thème sombre de l'interface
                </p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Profil utilisateur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Profil utilisateur
            </CardTitle>
            <CardDescription>
              Informations de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Rôle</Label>
              <Input value="Administrateur" disabled />
            </div>
            <div className="grid gap-2">
              <Label>Dernière connexion</Label>
              <Input value={new Date().toLocaleDateString("fr-FR")} disabled />
            </div>
          </CardContent>
        </Card>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? (
              "Sauvegarde..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder les paramètres
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}