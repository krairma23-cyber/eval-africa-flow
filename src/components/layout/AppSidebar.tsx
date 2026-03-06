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
  TrendingUp
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
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

export function AppSidebar() {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();
  const location = useLocation();
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string>("EvalScol");
  const { t } = useLanguage();

  const menuItems = [
    { title: t('sidebar.dashboard'), url: "/dashboard", icon: Home },
    { title: t('sidebar.students'), url: "/dashboard/students", icon: Users },
    { title: t('sidebar.teachers'), url: "/dashboard/teachers", icon: GraduationCap },
    { title: t('sidebar.classrooms'), url: "/dashboard/classrooms", icon: School },
    { title: t('sidebar.subjects'), url: "/dashboard/subjects", icon: BookOpen },
    { title: t('sidebar.schedule'), url: "/dashboard/schedule", icon: Calendar },
    { title: t('sidebar.assessments'), url: "/dashboard/assessments", icon: ClipboardCheck },
    { title: t('sidebar.reports'), url: "/dashboard/reports", icon: FileText },
    { title: t('sidebar.assignments'), url: "/dashboard/assignments", icon: UserCog },
    { title: t('sidebar.analytics'), url: "/dashboard/analytics", icon: BarChart3 },
    { title: t('sidebar.billing'), url: "/dashboard/billing", icon: CreditCard },
    { title: t('sidebar.api'), url: "/dashboard/api", icon: Code },
    { title: t('sidebar.support'), url: "/dashboard/support", icon: HelpCircle },
    { title: t('sidebar.notifications'), url: "/dashboard/notifications", icon: Bell },
    { title: t('sidebar.users'), url: "/dashboard/users", icon: Shield },
    { title: "Traction", url: "/dashboard/traction", icon: TrendingUp },
    { title: t('sidebar.settings'), url: "/dashboard/settings", icon: Settings },
  ];

  // Close sidebar automatically after navigation on mobile only
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile]);

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
      // Logo load failed - not critical, will use default
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
              <img 
                src={schoolLogo || "/logo.png"}
                alt={schoolName}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png";
                }}
                className="w-24 h-24 object-contain rounded flex-shrink-0"
              />
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
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClass(item.url)}
                      onClick={() => { if (isMobile) setOpenMobile(false); }}
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
