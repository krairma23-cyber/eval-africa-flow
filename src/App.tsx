import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { CookieConsent } from "./components/gdpr/CookieConsent";
import DashboardLayout from "./components/layout/DashboardLayout";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { ChunkLoadErrorBoundary } from "@/components/system/ChunkLoadErrorBoundary";

// Lazy load all pages except Index for better initial load performance.
// Wrapped with retry logic to avoid blank screens when a chunk/module fails to load (cache mismatch).
const Auth = lazyWithRetry(() => import("./pages/Auth"), "page:Auth");
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"), "page:Dashboard");
const Students = lazyWithRetry(() => import("./pages/Students"), "page:Students");
const Teachers = lazyWithRetry(() => import("./pages/Teachers"), "page:Teachers");
const Subjects = lazyWithRetry(() => import("./pages/Subjects"), "page:Subjects");
const Classrooms = lazyWithRetry(() => import("./pages/Classrooms"), "page:Classrooms");
const Assessments = lazyWithRetry(() => import("./pages/Assessments"), "page:Assessments");
const Reports = lazyWithRetry(() => import("./pages/Reports"), "page:Reports");
const Settings = lazyWithRetry(() => import("./pages/Settings"), "page:Settings");
const UserManagement = lazyWithRetry(() => import("./pages/UserManagement"), "page:UserManagement");
const NotFound = lazyWithRetry(() => import("./pages/NotFound"), "page:NotFound");
const Billing = lazyWithRetry(() => import("./pages/Billing"), "page:Billing");
const ApiManagement = lazyWithRetry(() => import("./pages/ApiManagement"), "page:ApiManagement");
const Analytics = lazyWithRetry(() => import("./pages/Analytics"), "page:Analytics");
const Support = lazyWithRetry(() => import("./pages/Support"), "page:Support");
const Notifications = lazyWithRetry(() => import("./pages/Notifications"), "page:Notifications");
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy"), "page:PrivacyPolicy");
const DataPrivacy = lazyWithRetry(() => import("./pages/DataPrivacy"), "page:DataPrivacy");
const Assignments = lazyWithRetry(() => import("./pages/Assignments"), "page:Assignments");
const Schedule = lazyWithRetry(() => import("./pages/Schedule"), "page:Schedule");
const PaymentCallback = lazyWithRetry(() => import("./pages/PaymentCallback"), "page:PaymentCallback");
const ParentPortal = lazyWithRetry(() => import("./pages/ParentPortal"), "page:ParentPortal");
const ParentGuide = lazyWithRetry(() => import("./pages/ParentGuide"), "page:ParentGuide");
const Terms = lazyWithRetry(() => import("./pages/Terms"), "page:Terms");
const AssessmentTypes = lazyWithRetry(() => import("./pages/AssessmentTypes"), "page:AssessmentTypes");
const Onboarding = lazyWithRetry(() => import("./pages/Onboarding"), "page:Onboarding");
const PitchDeck = lazyWithRetry(() => import("./pages/PitchDeck"), "page:PitchDeck");
const About = lazyWithRetry(() => import("./pages/About"), "page:About");
const Pricing = lazyWithRetry(() => import("./pages/Pricing"), "page:Pricing");
const UserGuide = lazyWithRetry(() => import("./pages/UserGuide"), "page:UserGuide");
const PaystackDiagnostic = lazyWithRetry(() => import("./pages/PaystackDiagnostic"), "page:PaystackDiagnostic");
const TuitionPaymentDiagnostic = lazyWithRetry(() => import("./pages/TuitionPaymentDiagnostic"), "page:TuitionPaymentDiagnostic");

// Command Center pages
const CommandCenterLayout = lazyWithRetry(() => import("./pages/command-center/CommandCenterLayout"), "page:CommandCenterLayout");
const CCOverview = lazyWithRetry(() => import("./pages/command-center/CCOverview"), "page:CCOverview");
const CCFinancial = lazyWithRetry(() => import("./pages/command-center/CCFinancial"), "page:CCFinancial");
const CCProductUsage = lazyWithRetry(() => import("./pages/command-center/CCProductUsage"), "page:CCProductUsage");
const CCHiddenCosts = lazyWithRetry(() => import("./pages/command-center/CCHiddenCosts"), "page:CCHiddenCosts");
const CCRisks = lazyWithRetry(() => import("./pages/command-center/CCRisks"), "page:CCRisks");
const CCGrowth = lazyWithRetry(() => import("./pages/command-center/CCGrowth"), "page:CCGrowth");
const CCHealthScore = lazyWithRetry(() => import("./pages/command-center/CCHealthScore"), "page:CCHealthScore");


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
        <ChunkLoadErrorBoundary>
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
              <Route path="/guide" element={<UserGuide />} />

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
              {/* Command Center - Super Admin only */}
              <Route path="/command-center" element={<CommandCenterLayout />}>
                <Route index element={<CCOverview />} />
                <Route path="financial" element={<CCFinancial />} />
                <Route path="usage" element={<CCProductUsage />} />
                <Route path="hidden-costs" element={<CCHiddenCosts />} />
                <Route path="risks" element={<CCRisks />} />
                <Route path="growth" element={<CCGrowth />} />
                <Route path="health" element={<CCHealthScore />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ChunkLoadErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
