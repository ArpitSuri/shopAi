import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold tracking-tight">404</h1>
      <p className="mt-2 text-slate-500">This page doesn’t exist.</p>
      <Link to="/" className="btn btn-primary mt-6">
        Go home
      </Link>
    </div>
  );
}
