import { 
  Home, 
  Users, 
  GraduationCap, 
  BookOpen, 
  ClipboardCheck, 
  FileText, 
  Settings, 
  School 
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
  { title: "Classes", url: "/classrooms", icon: School },
  { title: "Matières", url: "/dashboard/subjects", icon: BookOpen },
  { title: "Évaluations", url: "/assessments", icon: ClipboardCheck },
  { title: "Bulletins", url: "/reports", icon: FileText },
  { title: "Paramètres", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const getNavClass = (path: string) =>
    isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold text-primary">
            EvalScol
          </SidebarGroupLabel>
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