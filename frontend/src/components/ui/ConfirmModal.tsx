import { AlertTriangle, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

interface ConfirmModalProps {
  aberto: boolean;
  titulo: string;
  mensagem: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmModal({
  aberto,
  titulo,
  mensagem,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  loading = false,
  onConfirmar,
  onCancelar,
}: ConfirmModalProps) {
  if (!aberto) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-950/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancelar();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <AlertTriangle size={19} aria-hidden="true" />
            </div>

            <div>
              <h2
                id="confirm-modal-title"
                className="text-base font-semibold text-slate-900"
              >
                {titulo}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancelar}
            disabled={loading}
            className="
              flex h-8 w-8 shrink-0 items-center justify-center
              rounded-md text-slate-400
              hover:bg-slate-100 hover:text-slate-600
              disabled:cursor-not-allowed
            "
            aria-label="Fechar"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="text-sm leading-6 text-slate-600">{mensagem}</div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancelar} disabled={loading}>
            {cancelLabel}
          </Button>

          <Button variant={variant} onClick={onConfirmar} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
