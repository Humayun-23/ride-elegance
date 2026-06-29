import type { ReactNode } from 'react';

// Shared style tokens for a clean, minimal RentalOS look.
export const inputClass =
  'w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors';

export const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

export const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>{children}</div>
  );
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
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

export function EmptyState({ icon, message }: { icon?: ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 border border-dashed border-gray-300 rounded-lg text-gray-500">
      {icon && <div className="mb-2 text-gray-400">{icon}</div>}
      <p className="text-sm">{message}</p>
    </div>
  );
}
