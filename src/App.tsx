import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { CookieConsent } from "./components/gdpr/CookieConsent";

// Lazy load all pages except Index for better initial load performance
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Students = lazy(() => import("./pages/Students"));
const Teachers = lazy(() => import("./pages/Teachers"));
const Subjects = lazy(() => import("./pages/Subjects"));
const Classrooms = lazy(() => import("./pages/Classrooms"));
const Assessments = lazy(() => import("./pages/Assessments"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const DashboardLayout = lazy(() => import("./components/layout/DashboardLayout").then(m => ({ default: m.DashboardLayout })));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Billing = lazy(() => import("./pages/Billing"));
const ApiManagement = lazy(() => import("./pages/ApiManagement"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Support = lazy(() => import("./pages/Support"));
const Notifications = lazy(() => import("./pages/Notifications"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const DataPrivacy = lazy(() => import("./pages/DataPrivacy"));
const Assignments = lazy(() => import("./pages/Assignments"));
const Schedule = lazy(() => import("./pages/Schedule"));
const PaymentCallback = lazy(() => import("./pages/PaymentCallback"));
const ParentPortal = lazy(() => import("./pages/ParentPortal"));
const ParentGuide = lazy(() => import("./pages/ParentGuide"));
const Terms = lazy(() => import("./pages/Terms"));
const AssessmentTypes = lazy(() => import("./pages/AssessmentTypes"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const PitchDeck = lazy(() => import("./pages/PitchDeck"));
const About = lazy(() => import("./pages/About"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PaystackDiagnostic = lazy(() => import("./pages/PaystackDiagnostic"));
const TuitionPaymentDiagnostic = lazy(() => import("./pages/TuitionPaymentDiagnostic"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CookieConsent />
        <Suspense fallback={<PageLoader />}>
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
              <Route path="tuition-diagnostic" element={<TuitionPaymentDiagnostic />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
