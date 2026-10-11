import { AlertTriangle} from "lucide-react";
import type { Publicacao } from "../../types/publicacao";

import { Button } from "../ui/Button";

interface ModalConfirmacaoExclusaoProps {
  publicacao: Publicacao | null;
  processando?: boolean;
  onFechar: () => void;
  onConfirmar: () => void | Promise<void>;
}

export function ModalConfirmacaoExclusao({
  publicacao, 
  processando = false, 
  onFechar, 
  onConfirmar,
}: ModalConfirmacaoExclusaoProps) {
  if (!publicacao) { 
    return null;
  }

  const handleFechar = () => { 
    if (!processando) { 
      onFechar(); 
    } 
  };

  const handleConfirmar = async () => { if (processando) return; await onConfirmar(); };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleFechar();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmacao-exclusao-titulo"
        aria-describedby="confirmacao-exclusao-descricao"
        className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle size={21} aria-hidden="true" />{" "}
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="confirmacao-exclusao-titulo"
              className="text-base font-semibold text-slate-900"
            >
              Confirmar exclusão
            </h2>
            <p
              id="confirmacao-exclusao-descricao"
              className="mt-2 text-sm leading-relaxed text-slate-600"
            >
              Deseja realmente remover a publicação{" "}
              <strong className="font-semibold text-slate-900">
                [{publicacao.codigo}] {publicacao.titulo}
              </strong>{" "}
              do estoque ativo da congregação?
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              O histórico de movimentações anteriores será preservado.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <Button type="button" onClick={handleFechar} disabled={processando}>
            Cancelar
          </Button>

          <Button type="button" onClick={handleConfirmar} disabled={processando}>
            {processando ? "Removendo..." : "Confirmar remoção"}
          </Button>
        </div>
      </section>
    </div>
  );
};

  
