import React from "react";
import { AlertTriangle, X } from "lucide-react";
import type { Publicacao } from "../../types/publicacao";

interface ModalConfirmacaoExclusaoProps {
  publicacao: Publicacao | null;
  onFechar: () => void;
  onConfirmar: () => void;
}

export const ModalConfirmacaoExclusao: React.FC<
  ModalConfirmacaoExclusaoProps
> = ({ publicacao, onFechar, onConfirmar }) => {
  if (!publicacao) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">
              Confirmar Exclusão
            </h3>
          </div>
          <button
            onClick={onFechar}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Tem certeza que deseja remover{" "}
          <strong className="text-white font-mono">
            [{publicacao.codigo}] {publicacao.titulo}
          </strong>{" "}
          do estoque ativo da congregação? O histórico de movimentações
          anteriores será preservado.
        </p>

        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={onFechar}
            className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmar();
              onFechar();
            }}
            className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            Confirmar Remoção
          </button>
        </div>
      </div>
    </div>
  );
};
