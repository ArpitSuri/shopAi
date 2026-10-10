// Label + input (or textarea / select via `as`) + error message
export default function FormField({ label, error, as: Tag = 'input', className = '', children, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <Tag className={`input ${className}`} {...props}>
        {children}
      </Tag>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
