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
import { logError } from "@/lib/logger";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Save, School, Bell, Shield, Palette, Upload, Image as ImageIcon, Globe, Database, Zap, CreditCard, Calendar, ClipboardList, Copy, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Settings state
  const [schoolName, setSchoolName] = useState("École Primaire Example");
  const [schoolAddress, setSchoolAddress] = useState("123 Rue de l'École, Paris");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [geographicalLocation, setGeographicalLocation] = useState("");
  const [email, setEmail] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone2, setPhone2] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reportReminders, setReportReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // SaaS settings
  const [timezone, setTimezone] = useState("Europe/Paris");
  const [language, setLanguage] = useState("fr");
  const [currency, setCurrency] = useState("EUR");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [autoBackup, setAutoBackup] = useState(true);
  const [dataRetention, setDataRetention] = useState("365");
  const [schoolJoinCode, setSchoolJoinCode] = useState("");

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
          .select('name, logo_url, address, academic_year, city, phone, municipality, neighborhood, geographical_location, email, postal_code, phone_2, join_code')
          .eq('id', profile.school_id)
          .single();

        if (school) {
          setSchoolName(school.name || "École Primaire Example");
          setSchoolAddress(school.address || "123 Rue de l'École, Paris");
          setAcademicYear(school.academic_year || "2025-2026");
          setCity((school as any).city || "");
          setPhone((school as any).phone || "");
          setMunicipality((school as any).municipality || "");
          setNeighborhood((school as any).neighborhood || "");
          setGeographicalLocation((school as any).geographical_location || "");
          setEmail((school as any).email || "");
          setPostalCode((school as any).postal_code || "");
          setPhone2((school as any).phone_2 || "");
          setSchoolJoinCode((school as any).join_code || "");
          
          if (school.logo_url) {
            const raw = school.logo_url.trim();
            if (/^https?:\/\//.test(raw)) {
              setLogoUrl(raw);
            } else {
              const key = raw
                .replace(/^\/+/, '')
                .replace(/^school-logos\/+/, '');
              const { data } = supabase.storage
                .from('school-logos')
                .getPublicUrl(key);
              setLogoUrl(data.publicUrl || null);
            }
          }
        }
      }

      // Load user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('email_notifications, report_reminders, dark_mode, timezone, language, currency, date_format, auto_backup, data_retention')
        .eq('user_id', user.id)
        .single();

      if (preferences) {
        setEmailNotifications(preferences.email_notifications ?? true);
        setReportReminders(preferences.report_reminders ?? true);
        setDarkMode(preferences.dark_mode ?? false);
        setTimezone((preferences as any).timezone ?? "Europe/Paris");
        setLanguage((preferences as any).language ?? "fr");
        setCurrency((preferences as any).currency ?? "EUR");
        setDateFormat((preferences as any).date_format ?? "DD/MM/YYYY");
        setAutoBackup((preferences as any).auto_backup ?? true);
        setDataRetention((preferences as any).data_retention ?? "365");
      }
    } catch (error) {
      logError('School data loading failed', error, {
        component: 'Settings',
        action: 'load_school_data'
      });
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
      logError('Logo upload failed', error, {
        component: 'Settings',
        action: 'upload_logo'
      });
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
          city: city,
          phone: phone,
          municipality: municipality,
          neighborhood: neighborhood,
          geographical_location: geographicalLocation,
          email: email,
          postal_code: postalCode,
          phone_2: phone2,
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
          timezone,
          language,
          currency,
          date_format: dateFormat,
          auto_backup: autoBackup,
          data_retention: dataRetention,
        }, {
          onConflict: 'user_id'
        });

      if (prefsError) throw prefsError;

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos paramètres ont été mis à jour avec succès",
      });
    } catch (error) {
      logError('Settings save failed', error, {
        component: 'Settings',
        action: 'save_settings'
      });
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
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Paramètres</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Configurez les paramètres de votre établissement
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* École */}
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <School className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Informations de l'établissement</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Gérez les informations générales de votre école
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid gap-2">
              <Label htmlFor="school-logo" className="text-sm">Logo de l'établissement</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {logoUrl ? (
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 border-2 border-border rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={logoUrl}
                      alt="Logo de l'établissement"
                      loading="lazy"
                      onError={() => setLogoUrl(null)}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted flex-shrink-0">
                    <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleLogoUpload}
                    disabled={!schoolId || uploading}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !schoolId}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Upload className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {uploading
                        ? "Téléchargement..."
                        : (!schoolId ? "Chargement..." : "Télécharger un logo")}
                    </span>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {!schoolId ? "Veuillez patienter, chargement du profil..." : "JPG, PNG ou WebP. Max 2MB."}
                  </p>
                </div>
              </div>
            </div>
            <Separator />
            
            {/* Bouton Transactions */}
            <div className="grid gap-2">
              <Label>Gestion des paiements</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/billing')}
                className="w-full justify-start"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Voir toutes les transactions et abonnements
              </Button>
              <p className="text-xs text-muted-foreground">
                Gérez les abonnements, consultez l'historique des paiements et les factures
              </p>
            </div>
            
            <Separator />

            {/* Boutons Configuration Évaluations */}
            <div className="grid gap-4">
              <Label>Configuration des évaluations</Label>
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard/assessment-types')}
                  className="w-full justify-start"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Types d'évaluation
                </Button>
                <p className="text-xs text-muted-foreground">
                  Gérez les types d'évaluations (Devoir, Contrôle, Examen, etc.)
                </p>
              </div>
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard/terms')}
                  className="w-full justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Trimestres / Périodes
                </Button>
                <p className="text-xs text-muted-foreground">
                  Gérez les trimestres et périodes scolaires
                </p>
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

            {/* Join Code */}
            {schoolJoinCode && (
              <div className="grid gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Label className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Code d'invitation de l'école
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={schoolJoinCode}
                    readOnly
                    className="font-mono tracking-widest text-lg font-bold uppercase bg-background"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(schoolJoinCode);
                      toast({
                        title: "Copié !",
                        description: "Le code d'invitation a été copié dans le presse-papier.",
                      });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Partagez ce code avec les enseignants et le personnel pour qu'ils puissent rejoindre votre école lors de leur inscription.
                </p>
              </div>
            )}
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
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Exemple: Paris"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Exemple: +33 1 23 45 67 89"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone2">Téléphone 2</Label>
              <Input
                id="phone2"
                type="tel"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                placeholder="Exemple: +33 1 98 76 54 32"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Exemple: contact@ecole.fr"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="postal-code">Code postal</Label>
              <Input
                id="postal-code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Exemple: 75015"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="municipality">Commune</Label>
              <Input
                id="municipality"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                placeholder="Exemple: 15e arrondissement"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="neighborhood">Quartier</Label>
              <Input
                id="neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Exemple: Grenelle"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="geographical-location">Situation géographique</Label>
              <Textarea
                id="geographical-location"
                value={geographicalLocation}
                onChange={(e) => setGeographicalLocation(e.target.value)}
                placeholder="Description de la situation géographique de l'établissement"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              Notifications
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Configurez vos préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <Label className="text-sm">Notifications par email</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Recevoir des notifications importantes par email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                className="flex-shrink-0"
              />
            </div>
            <Separator />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <Label className="text-sm">Rappels de bulletins</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Rappels automatiques pour la génération des bulletins
                </p>
              </div>
              <Switch
                checked={reportReminders}
                onCheckedChange={setReportReminders}
                className="flex-shrink-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Paramètres SaaS */}
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              Paramètres du SaaS
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Configuration régionale et système
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid gap-2">
              <Label htmlFor="timezone" className="text-sm">Fuseau horaire</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                  <SelectItem value="Africa/Abidjan">Africa/Abidjan (UTC+0)</SelectItem>
                  <SelectItem value="Africa/Dakar">Africa/Dakar (UTC+0)</SelectItem>
                  <SelectItem value="Africa/Lagos">Africa/Lagos (UTC+1)</SelectItem>
                  <SelectItem value="Africa/Kinshasa">Africa/Kinshasa (UTC+1)</SelectItem>
                  <SelectItem value="America/New_York">America/New York (UTC-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="language" className="text-sm">Langue</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="currency" className="text-sm">Devise</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="XOF">Franc CFA (XOF)</SelectItem>
                  <SelectItem value="USD">Dollar US (USD)</SelectItem>
                  <SelectItem value="GBP">Livre Sterling (GBP)</SelectItem>
                  <SelectItem value="MAD">Dirham Marocain (MAD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="date-format" className="text-sm">Format de date</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="date-format" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">JJ/MM/AAAA</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/JJ/AAAA</SelectItem>
                  <SelectItem value="YYYY-MM-DD">AAAA-MM-JJ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sauvegarde et données */}
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Database className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              Sauvegarde et données
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Gestion des données et archivage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <Label className="text-sm">Sauvegarde automatique</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Sauvegarde quotidienne de toutes les données
                </p>
              </div>
              <Switch
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
                className="flex-shrink-0"
              />
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="data-retention" className="text-sm">Rétention des données (jours)</Label>
              <Select value={dataRetention} onValueChange={setDataRetention}>
                <SelectTrigger id="data-retention" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90 jours</SelectItem>
                  <SelectItem value="180">180 jours</SelectItem>
                  <SelectItem value="365">1 an</SelectItem>
                  <SelectItem value="730">2 ans</SelectItem>
                  <SelectItem value="1825">5 ans</SelectItem>
                  <SelectItem value="-1">Illimité</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Apparence */}
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Palette className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              Apparence
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Personnalisez l'apparence de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <Label className="text-sm">Mode sombre</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Activer le thème sombre de l'interface
                </p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="flex-shrink-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Profil utilisateur */}
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              Profil utilisateur
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Informations de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid gap-2">
              <Label className="text-sm">Email</Label>
              <Input value={user?.email || ""} disabled className="text-sm" />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm">Rôle</Label>
              <Input value="Administrateur" disabled className="text-sm" />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm">Dernière connexion</Label>
              <Input value={new Date().toLocaleDateString("fr-FR")} disabled className="text-sm" />
            </div>
          </CardContent>
        </Card>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end pb-4">
          <Button onClick={handleSaveSettings} disabled={loading} className="w-full sm:w-auto">
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