import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';
import Navbar from '../components/Navbar';

// Storefront shell. Admins never see the storefront: they are sent to /admin.
export default function UserLayout() {
  const { user } = useAuth();
  if (user?.role === ROLES.ADMIN) return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
