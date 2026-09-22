import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { SelectionProvider } from './contexts/SelectionContext';
import { SavedResourcesProvider } from './contexts/SavedResourcesContext';
import { AdminRealtimeProvider } from './contexts/AdminRealtimeContext';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/theme-provider';
import { useGamification } from './hooks/useGamification';
import { useAuth } from './contexts/useAuth';

// Eagerly loaded core public / entry pages
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';

// Lazy loaded public pages for optimal code-splitting and fast LCP
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const FeaturesPage = lazy(() => import('./pages/public/FeaturesPage'));
const HowItWorksPage = lazy(() => import('./pages/public/HowItWorksPage'));
const FAQPage = lazy(() => import('./pages/public/FAQPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

// Lazy loaded app and protected pages
const Auth = lazy(() => import('./pages/Auth'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ResourcePage = lazy(() => import('./pages/ResourcePage'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const AskQuestionPage = lazy(() => import('./pages/AskQuestionPage'));
const QuestionDetailPage = lazy(() => import('./pages/QuestionDetailPage'));
const StudyPage = lazy(() => import('./pages/StudyPage'));
const FlashcardDeckPage = lazy(() => import('./pages/FlashcardDeckPage'));
const StudyRoomLobby = lazy(() => import('./pages/StudyRoomLobby'));
const StudyRoom = lazy(() => import('./pages/StudyRoom'));
const CommunityLobby = lazy(() => import('./pages/CommunityLobby'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const DoubtSolverPage = lazy(() => import('./pages/DoubtSolverPage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminDataRepair = lazy(() => import('./pages/AdminDataRepair'));
const CareersPage = lazy(() => import('./pages/CareersPage'));

// Layout & helper components
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/common/DashboardLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CookieConsent } from './components/common/CookieConsent';
import { OnboardingWizard } from './components/personalization/OnboardingWizard';

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground font-medium">Loading Campus Flow...</span>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  useGamification();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <OnboardingWizard />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public marketing and informational routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Legal routes (clean canonical URLs + legacy aliases) */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />

          {/* Auth routes */}
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Public browse catalog */}
          <Route path="/browse" element={
            <DashboardLayout>
              <ErrorBoundary componentName="Browse Page">
                <BrowsePage />
              </ErrorBoundary>
            </DashboardLayout>
          } />

          {/* Onboarding route */}
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/upload" element={
            <ProtectedRoute>
              <DashboardLayout>
                <UploadPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <DashboardLayout>
                <AdminPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/repair" element={
            <ProtectedRoute requireAdmin>
              <DashboardLayout>
                <AdminDataRepair />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/careers" element={
            <ProtectedRoute>
              <DashboardLayout>
                <CareersPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/saved" element={
            <ProtectedRoute>
              <DashboardLayout>
                <BookmarksPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/recent" element={
            <ProtectedRoute>
              <DashboardLayout>
                <HistoryPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/resource/:id" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ResourcePage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/forum" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ForumPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/forum/new" element={
            <ProtectedRoute>
              <DashboardLayout>
                <AskQuestionPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/forum/:id" element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuestionDetailPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/study" element={
            <ProtectedRoute>
              <DashboardLayout>
                <StudyPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/study/decks/:id" element={
            <ProtectedRoute>
              <DashboardLayout>
                <FlashcardDeckPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/study/rooms" element={
            <ProtectedRoute>
              <DashboardLayout>
                <StudyRoomLobby />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/study/rooms/:id" element={
            <ProtectedRoute>
              <StudyRoom />
            </ProtectedRoute>
          } />

          <Route path="/communities" element={
            <ProtectedRoute>
              <DashboardLayout>
                <CommunityLobby />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/communities/:id" element={
            <ProtectedRoute>
              <DashboardLayout>
                <CommunityPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/doubt-solver" element={
            <ProtectedRoute>
              <DashboardLayout>
                <DoubtSolverPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Dedicated 404 Route for unmatched URLs (prevents soft-404) */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="studyhub-theme">
      <Router>
        <AuthProvider>
          <SelectionProvider>
            <SavedResourcesProvider>
              <AdminRealtimeProvider>
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))',
                    },
                  }}
                />
                <ErrorBoundary componentName="App Root">
                  <AppContent />
                  <CookieConsent />
                </ErrorBoundary>
              </AdminRealtimeProvider>
            </SavedResourcesProvider>
          </SelectionProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
