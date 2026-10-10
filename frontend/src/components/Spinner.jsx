export default function Spinner({ className = 'py-20' }) {
  return (
    <div className={`flex justify-center ${className}`} role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-700" />
    </div>
  );
}
