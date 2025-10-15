import { 
  Home, 
  Users, 
  GraduationCap, 
  BookOpen, 
  ClipboardCheck, 
  FileText, 
  Settings, 
  School,
  Shield,
  BarChart3,
  CreditCard,
  Code,
  HelpCircle,
  Bell,
  UserCog,
  Calendar,
  
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Tableau de bord", url: "/dashboard", icon: Home },
  { title: "Élèves", url: "/dashboard/students", icon: Users },
  { title: "Enseignants", url: "/dashboard/teachers", icon: GraduationCap },
  { title: "Classes", url: "/dashboard/classrooms", icon: School },
  { title: "Matières", url: "/dashboard/subjects", icon: BookOpen },
  { title: "Emploi du Temps", url: "/dashboard/schedule", icon: Calendar },
  { title: "Évaluations", url: "/dashboard/assessments", icon: ClipboardCheck },
  
  { title: "Bulletins", url: "/dashboard/reports", icon: FileText },
  { title: "Affectations", url: "/dashboard/assignments", icon: UserCog },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Facturation", url: "/dashboard/billing", icon: CreditCard },
  { title: "API", url: "/dashboard/api", icon: Code },
  { title: "Support", url: "/dashboard/support", icon: HelpCircle },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
  { title: "Utilisateurs", url: "/dashboard/users", icon: Shield },
  { title: "Paramètres", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string>("EvalScol");

  useEffect(() => {
    loadSchoolLogo();
  }, []);

  const loadSchoolLogo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('user_id', user.id)
        .single();

      if (profile?.school_id) {
        const { data: school } = await supabase
          .from('schools')
          .select('name, logo_url')
          .eq('id', profile.school_id)
          .single();

        if (school) {
          if (school.name) setSchoolName(school.name);
          if (school.logo_url) {
            const raw = school.logo_url.trim();
            if (/^https?:\/\//.test(raw)) {
              setSchoolLogo(raw);
            } else {
              const key = raw
                .replace(/^\/+/, '')
                .replace(/^school-logos\/+/, '');
              const { data } = supabase.storage
                .from('school-logos')
                .getPublicUrl(key);
              setSchoolLogo(data.publicUrl || null);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading school logo:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const getNavClass = (path: string) =>
    isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-start gap-3">
              {schoolLogo ? (
                <img 
                  src={schoolLogo}
                  alt={schoolName}
                  loading="lazy"
                  onError={() => setSchoolLogo(null)}
                  className="w-10 h-10 object-contain rounded flex-shrink-0"
                />
              ) : (
                <School className="w-10 h-10 text-primary flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <SidebarGroupLabel className="text-lg font-semibold text-primary break-words whitespace-normal leading-tight">
                  {schoolName}
                </SidebarGroupLabel>
              </div>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClass(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}