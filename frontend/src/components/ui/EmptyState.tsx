import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Inbox size={20} aria-hidden="true" />
      </div>

      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>

      {description && (
        <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
