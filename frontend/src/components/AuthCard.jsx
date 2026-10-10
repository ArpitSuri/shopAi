import { Link } from 'react-router-dom';

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="mb-6 text-xl font-bold tracking-tight text-brand-700">
        Shopfront
      </Link>
      <div className="card w-full max-w-sm p-6 shadow-sm">
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
      {footer && <p className="mt-5 text-sm text-slate-600">{footer}</p>}
    </div>
  );
}
