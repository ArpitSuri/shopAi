import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-bold tracking-tight text-brand-700">
          Shopfront
        </Link>

        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          {user ? (
            <>
              <Link to="/orders" className="px-2 py-1 text-slate-600 hover:text-slate-900">
                My orders
              </Link>
              <Link to="/cart" className="relative px-2 py-1 text-slate-600 hover:text-slate-900">
                Cart
                {cart.totalItems > 0 && (
                  <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-700 px-1.5 text-xs font-semibold text-white">
                    {cart.totalItems}
                  </span>
                )}
              </Link>
              <span className="hidden text-slate-400 sm:inline">|</span>
              <span className="hidden text-slate-600 sm:inline">{user.name}</span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-2 py-1 text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
