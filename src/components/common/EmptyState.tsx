import type { ReactNode } from "react";

interface EmptyStateProps {
  children: ReactNode;
}

export function EmptyState({ children }: EmptyStateProps) {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">
      {children}
    </div>
  );
}
