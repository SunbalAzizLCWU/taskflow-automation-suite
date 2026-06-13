// Minimal shadcn-style primitives implemented with Tailwind, no external UI dep.
export function Button({ className = '', variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    outline: 'border border-border bg-card hover:bg-muted',
    ghost: 'hover:bg-muted',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 ${className}`}
      {...props}
    />
  );
}

export function Card({ className = '', ...props }) {
  return <div className={`rounded-lg border border-border bg-card p-4 shadow-sm ${className}`} {...props} />;
}

export function Badge({ children, color = 'muted' }) {
  const colors = {
    muted: 'bg-muted text-muted-foreground',
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-emerald-100 text-emerald-700',
  };
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${colors[color] || colors.muted}`}>{children}</span>;
}
