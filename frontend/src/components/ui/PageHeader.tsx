import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  titulo: string;
  subtitulo?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({
  titulo,
  subtitulo,
  icon: Icon,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {titulo}
            </h1>

            {subtitulo && (
              <p className="mt-1 max-w-3xl text-sm text-slate-500">
                {subtitulo}
              </p>
            )}

            {children && <div className="mt-3">{children}</div>}
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
