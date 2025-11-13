import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Subjects from "./pages/Subjects";
import Classrooms from "./pages/Classrooms";
import Assessments from "./pages/Assessments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";
import Billing from "./pages/Billing";
import ApiManagement from "./pages/ApiManagement";
import Analytics from "./pages/Analytics";
import Support from "./pages/Support";
import Notifications from "./pages/Notifications";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataPrivacy from "./pages/DataPrivacy";
import Assignments from "./pages/Assignments";
import Schedule from "./pages/Schedule";
import PaymentCallback from "./pages/PaymentCallback";
import ParentPortal from "./pages/ParentPortal";
import ParentGuide from "./pages/ParentGuide";
import Terms from "./pages/Terms";
import AssessmentTypes from "./pages/AssessmentTypes";
import Onboarding from "./pages/Onboarding";
import PitchDeck from "./pages/PitchDeck";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import PaystackDiagnostic from "./pages/PaystackDiagnostic";

import { CookieConsent } from "./components/gdpr/CookieConsent";
import { TestModeBanner } from "./components/layout/TestModeBanner";

const queryClient = new QueryClient();

const App = () => {
  // Nettoyer les anciennes données de thème au chargement
  useEffect(() => {
    localStorage.removeItem('color_theme');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TestModeBanner />
        <CookieConsent />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/pitch-deck" element={<PitchDeck />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />
          <Route path="/parent-portal" element={<ParentPortal />} />
          <Route path="/parent-guide" element={<ParentGuide />} />
          
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="classrooms" element={<Classrooms />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="terms" element={<Terms />} />
          <Route path="assessment-types" element={<AssessmentTypes />} />
          <Route path="reports" element={<Reports />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="settings" element={<Settings />} />
          <Route path="billing" element={<Billing />} />
          <Route path="api" element={<ApiManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="support" element={<Support />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="privacy" element={<DataPrivacy />} />
          <Route path="paystack-diagnostic" element={<PaystackDiagnostic />} />
        </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
