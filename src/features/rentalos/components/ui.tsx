import type { ReactNode } from 'react';

// Shared style tokens for the dense, brand-aligned RentalOS look.
export const inputClass =
  'w-full bg-white border rounded-md px-2.5 h-9 text-[13px] text-[color:var(--rl-ink)] placeholder:text-[color:var(--rl-faint)] focus:outline-none focus:border-[color:var(--rl-brand)] focus:ring-2 focus:ring-[color:var(--rl-brand)]/20 transition-colors';

export const labelClass = 'block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--rl-muted)] mb-1';

export const primaryButtonClass =
  'rl-btn-primary inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-md text-[13px] disabled:opacity-50 disabled:cursor-not-allowed';

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-md bg-white border text-[color:var(--rl-ink)] text-[13px] font-semibold hover:bg-[color:var(--rl-hover)] transition-colors disabled:opacity-50';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rl-surface rounded-lg ${className}`}>{children}</div>;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--rl-border)' }}>
        <div>
          <h3 className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--rl-ink)' }}>{title}</h3>
          {description && <p className="text-[12px] mt-0.5" style={{ color: 'var(--rl-muted)' }}>{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

export function EmptyState({ icon, message }: { icon?: ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4 border border-dashed rounded-md" style={{ borderColor: 'var(--rl-border-strong)', color: 'var(--rl-muted)' }}>
      {icon && <div className="mb-2" style={{ color: 'var(--rl-faint)' }}>{icon}</div>}
      <p className="text-[13px]">{message}</p>
    </div>
  );
}
