import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeFor } from '../utils/constants';
import Spinner from '../components/Spinner';

// Login / signup pages: logged-in users are sent to their own home
export default function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner className="min-h-screen items-center" />;
  return user ? <Navigate to={homeFor(user.role)} replace /> : <Outlet />;
}
