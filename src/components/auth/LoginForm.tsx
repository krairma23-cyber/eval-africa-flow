import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { GraduationCap, User, Building2, Users, KeyRound, Eye, EyeOff } from "lucide-react";

// Secure validation schemas
const loginSchema = z.object({
  email: z.string()
    .trim()
    .min(5, "Email trop court")
    .max(254, "Email trop long")
    .email("Format d'email invalide"),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(72, "Mot de passe trop long"),
});

const signupSchema = loginSchema.extend({
  firstName: z.string()
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Prénom trop long"),
  lastName: z.string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Nom trop long"),
  role: z.enum(["user", "teacher"]),
  isCreatingSchool: z.boolean().optional(),
  schoolName: z.string().max(100, "Nom d'école trop long").optional(),
});

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"user" | "teacher">("user");
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [acceptPrivacyPolicy, setAcceptPrivacyPolicy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input before API call
    try {
      loginSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('common.error'),
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast({
          title: t('common.error'),
          description: t('login.emailOrPasswordIncorrect'),
          variant: "destructive",
        });
      } else {
        toast({
          title: t('common.success'),
          description: t('login.welcomeEvalscol'),
        });
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 100);
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('login.errorOccurred'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate school name if creating school
    if (isCreatingSchool && (!schoolName.trim() || schoolName.trim().length < 3)) {
      toast({
        title: t('common.error'),
        description: t('login.schoolNameMin'),
        variant: "destructive",
      });
      return;
    }

    // Validate join code if joining school
    if (!isCreatingSchool && (!joinCode.trim() || joinCode.trim().length < 4)) {
      toast({
        title: t('common.error'),
        description: t('login.invalidJoinCode'),
        variant: "destructive",
      });
      return;
    }
    
    try {
      signupSchema.parse({ 
        email, 
        password, 
        firstName, 
        lastName,
        role: selectedRole,
        isCreatingSchool,
        schoolName
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('common.error'),
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }
    
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // Build metadata based on whether creating school or joining
      const metadata: Record<string, string> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        requested_role: selectedRole,
      };
      
      // If creating a new school, add school info
      if (isCreatingSchool) {
        metadata.school_name = schoolName.trim();
      } else {
        // If joining, add the join code
        metadata.join_code = joinCode.trim().toUpperCase();
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata,
        },
      });

      if (error) {
        const message = error.message.includes("already registered") 
          ? t('login.emailAlreadyUsed')
          : t('login.cannotCreateAccount');
        
        toast({
          title: t('common.error'),
          description: message,
          variant: "destructive",
        });
      } else if (data.user) {
        const successMessage = isCreatingSchool 
          ? t('login.accountCreatedAdmin')
          : t('login.checkEmailConfirmation');
        
        toast({
          title: t('common.success'),
          description: successMessage,
          duration: 10000,
        });
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setSelectedRole("user");
        setIsCreatingSchool(false);
        setSchoolName("");
        setJoinCode("");
        setAcceptPrivacyPolicy(false);
        setActiveTab("signin");
        setAcceptPrivacyPolicy(false);
        setActiveTab("signin");
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: t('login.errorOccurred'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        toast({
          title: t('common.error'),
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('login.errorOccurred'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast({
          title: t('common.error'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('common.success'),
          description: t('login.checkMailReset'),
        });
        setEmail("");
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('login.errorOccurred'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="EvalScol Logo" 
              className="h-28 w-auto object-contain"
            />
          </div>
          <CardDescription>
            {t('login.title')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin" className="text-xs sm:text-sm">{t('login.signin')}</TabsTrigger>
              <TabsTrigger value="signup" className="text-xs sm:text-sm">{t('login.signup')}</TabsTrigger>
              <TabsTrigger value="reset" className="text-xs sm:text-sm whitespace-normal leading-tight py-2">
                <span className="hidden sm:inline">{t('login.forgot')}</span>
                <span className="sm:hidden">{t('login.password')}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('login.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('login.password')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('login.loading.signin') : t('login.submit.signin')}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">{t('login.or')}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <GoogleIcon />
                  {t('login.google')}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <GoogleIcon />
                  {t('login.googleSignup')}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">{t('login.orWithEmail')}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>{t('login.registrationType')}</Label>
                  <RadioGroup 
                    value={isCreatingSchool ? "create" : "join"} 
                    onValueChange={(value) => setIsCreatingSchool(value === "create")}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className={`relative flex flex-col items-center justify-center text-center rounded-lg border-2 p-3 cursor-pointer transition-colors ${!isCreatingSchool ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <RadioGroupItem value="join" id="type-join" className="sr-only" />
                      <label htmlFor="type-join" className="flex flex-col items-center gap-1 cursor-pointer w-full">
                        <Users className="h-5 w-5 text-primary" />
                        <span className="font-medium text-sm">{t('login.join')}</span>
                        <span className="text-xs text-muted-foreground">{t('login.joinDesc')}</span>
                      </label>
                    </div>
                    <div className={`relative flex flex-col items-center justify-center text-center rounded-lg border-2 p-3 cursor-pointer transition-colors ${isCreatingSchool ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <RadioGroupItem value="create" id="type-create" className="sr-only" />
                      <label htmlFor="type-create" className="flex flex-col items-center gap-1 cursor-pointer w-full">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span className="font-medium text-sm">{t('login.create')}</span>
                        <span className="text-xs text-muted-foreground">{t('login.createDesc')}</span>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                {isCreatingSchool && (
                  <div className="space-y-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <Label htmlFor="schoolName" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {t('login.schoolName')} *
                    </Label>
                    <Input
                      id="schoolName"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder={t('login.schoolNamePlaceholder')}
                      required={isCreatingSchool}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('login.becomeAdmin')}
                    </p>
                  </div>
                )}

                {!isCreatingSchool && (
                  <>
                    <div className="space-y-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
                      <Label htmlFor="joinCode" className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        {t('login.joinCode')} *
                      </Label>
                      <Input
                        id="joinCode"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder={t('login.joinCodePlaceholder')}
                        required={!isCreatingSchool}
                        maxLength={12}
                        className="uppercase tracking-widest font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('login.joinCodeHelp')}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label>{t('login.iAm')}</Label>
                      <RadioGroup 
                        value={selectedRole} 
                        onValueChange={(value) => setSelectedRole(value as "user" | "teacher")}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div className={`relative flex flex-col items-center justify-center text-center rounded-lg border-2 p-3 cursor-pointer transition-colors ${selectedRole === "user" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                          <RadioGroupItem value="user" id="role-user" className="sr-only" />
                          <label htmlFor="role-user" className="flex flex-col items-center gap-1 cursor-pointer w-full">
                            <User className="h-5 w-5 text-primary" />
                            <span className="font-medium text-sm">{t('login.user')}</span>
                          </label>
                        </div>
                        <div className={`relative flex flex-col items-center justify-center text-center rounded-lg border-2 p-3 cursor-pointer transition-colors ${selectedRole === "teacher" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                          <RadioGroupItem value="teacher" id="role-teacher" className="sr-only" />
                          <label htmlFor="role-teacher" className="flex flex-col items-center gap-1 cursor-pointer w-full">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            <span className="font-medium text-sm">{t('login.teacher')}</span>
                          </label>
                        </div>
                      </RadioGroup>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('login.firstName')}</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('login.lastName')}</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupEmail">{t('login.email')}</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">{t('login.passwordMin')}</Label>
                  <div className="relative">
                    <Input
                      id="signupPassword"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="privacy" 
                    checked={acceptPrivacyPolicy}
                    onCheckedChange={(checked) => setAcceptPrivacyPolicy(checked as boolean)}
                  />
                  <Label 
                    htmlFor="privacy" 
                    className="text-sm font-normal leading-tight cursor-pointer"
                  >
                    {t('login.privacy')}
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('login.afterConfirm')}
                </p>
                <Button type="submit" className="w-full" disabled={loading || !acceptPrivacyPolicy}>
                  {loading ? t('login.loading.signup') : t('login.submit.signup')}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="reset">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">{t('login.email')}</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('login.resetInstructions')}
                </p>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('login.loading.reset') : t('login.submit.reset')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
