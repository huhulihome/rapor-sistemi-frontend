import { useAuth } from '../contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user role
 * Used for role-based component rendering within pages
 */
export const RoleGuard = ({ children, requireAdmin = false, fallback = null }: RoleGuardProps) => {
  const { isAdmin } = useAuth();

  if (requireAdmin && !isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
