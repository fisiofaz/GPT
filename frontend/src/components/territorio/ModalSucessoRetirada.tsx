import { CheckCircle2, MessageCircle, X } from "lucide-react";

import type { Publicador } from "../../types/publicador";
import type { Territorio } from "../../types/territorio";
import { gerarLinkWhatsAppTerritorio } from "../../utils/whatsappTerritorio";
import { Button } from "../ui/Button";

interface ModalSucessoRetiradaProps {
  aberto: boolean;
  territorio: Territorio | null;
  publicador: Publicador | null;
  onFechar: () => void;
}

export function ModalSucessoRetirada({
  aberto,
  territorio,
  publicador,
  onFechar,
}: ModalSucessoRetiradaProps) {
  if (!aberto || !territorio) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onFechar();
        }
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-sucesso-retirada-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} aria-hidden="true" />
            </div>

            <div>
              <h2
                id="modal-sucesso-retirada-title"
                className="text-base font-semibold text-slate-900"
              >
                Território designado
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                A operação foi registrada com sucesso.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar confirmação"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-relaxed text-slate-600">
              O território{" "}
              <strong className="font-semibold text-slate-900">
                {territorio.numero} - {territorio.nome}
              </strong>{" "}
              foi registrado para{" "}
              <strong className="font-semibold text-slate-900">
                {publicador?.nome ?? "-"}
              </strong>
              .
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <a
              href={gerarLinkWhatsAppTerritorio(
                territorio,
                publicador || undefined,
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onFechar}
              className="flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <MessageCircle size={17} aria-hidden="true" />
              Enviar cartão via WhatsApp
            </a>

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onFechar}
              className="w-full"
            >
              Concluir sem enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
