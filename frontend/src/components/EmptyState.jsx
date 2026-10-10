export default function EmptyState({ title, text, children }) {
  return (
    <div className="card px-6 py-14 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      {text && <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
