import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, adminData, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !adminData) {
    return <Navigate to="/admin/signin" replace />;
  }

  return <>{children}</>;
}
