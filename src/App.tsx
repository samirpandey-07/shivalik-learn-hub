
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { SelectionProvider } from './contexts/SelectionContext';
import { SavedResourcesProvider } from './contexts/SavedResourcesContext';
import { AdminRealtimeProvider } from './contexts/AdminRealtimeContext';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/theme-provider';
import { useGamification } from './hooks/useGamification';
import { useAuth } from './contexts/useAuth';

// Pages
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import BrowsePage from './pages/BrowsePage';
import UploadPage from './pages/UploadPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import BookmarksPage from './pages/BookmarksPage';
import HistoryPage from './pages/HistoryPage';
import ResourcePage from './pages/ResourcePage';
import ForumPage from './pages/ForumPage';
import AskQuestionPage from './pages/AskQuestionPage';
import { OnboardingWizard } from './components/personalization/OnboardingWizard';
import QuestionDetailPage from './pages/QuestionDetailPage';
import StudyPage from './pages/StudyPage';
import FlashcardDeckPage from './pages/FlashcardDeckPage';
import StudyRoomLobby from './pages/StudyRoomLobby';
import StudyRoom from './pages/StudyRoom';
import CommunityLobby from './pages/CommunityLobby';
import CommunityPage from './pages/CommunityPage';
import DoubtSolverPage from './pages/DoubtSolverPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Layout components
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/common/DashboardLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Inner component to use hooks that require AuthProvider
function AppContent() {
  const { user, isLoading } = useAuth();
  // Initialize Gamification (Daily Login Check)
  useGamification();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <OnboardingWizard />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Onboarding route - special layout */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />

        {/* Protected routes with navigation */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/browse" element={
          <DashboardLayout>
            <ErrorBoundary componentName="Browse Page">
              <BrowsePage />
            </ErrorBoundary>
          </DashboardLayout>
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
          <DashboardLayout>
            <ResourcePage />
          </DashboardLayout>
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

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
