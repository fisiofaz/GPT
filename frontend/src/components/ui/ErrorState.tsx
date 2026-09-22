import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Não foi possível carregar os dados",
  message = "Ocorreu um erro ao consultar o sistema.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="flex min-h-48 flex-col items-center justify-center px-4 py-8 text-center"
      role="alert"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle size={20} aria-hidden="true" />
      </div>

      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>

      <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          <RefreshCw size={15} aria-hidden="true" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
