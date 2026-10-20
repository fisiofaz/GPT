import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Carregando..." }: LoadingStateProps) {
  return (
    <div
      className="flex min-h-40 items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />

        <span>{message}</span>
      </div>
    </div>
  );
}
