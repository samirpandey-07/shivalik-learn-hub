import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, roles, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user needs to complete onboarding
  // Allow access to onboarding page even if not completed
  // Check if user needs to complete onboarding
  // Allow access to onboarding page even if not completed
  if (!profile?.college_id && window.location.pathname !== '/onboarding') {
    console.warn("[ProtectedRoute] Redirecting to /onboarding. Profile missing college_id:", profile);
    return <Navigate to="/onboarding" replace />;
  } else if (profile?.college_id && window.location.pathname === '/onboarding') {
    console.log("[ProtectedRoute] Already on /onboarding but profile is complete. Should redirect to dashboard in Onboarding.tsx");
  }

  // Check admin requirement
  if (requireAdmin) {
    // Check if user has admin OR superadmin role
    const isAdmin = roles?.includes('admin') || roles?.includes('superadmin');

    if (!isAdmin) {
      console.warn("[ProtectedRoute] Access denied. User missing admin/superadmin role. Roles:", roles);
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}