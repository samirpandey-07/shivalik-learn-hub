
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

// Layout components
import { Navigation } from './components/common/Navigation';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/common/DashboardLayout';

// Inner component to use hooks that require AuthProvider
function AppContent() {
  const { user, isLoading } = useAuth();
  // Initialize Gamification (Daily Login Check)
  useGamification();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />

      {/* Onboarding route - special layout */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />

      {/* Protected routes with navigation */}
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
          <BrowsePage />
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

      {/* Catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="studyhub-theme">
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
                <AppContent />
              </AdminRealtimeProvider>
            </SavedResourcesProvider>
          </SelectionProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
