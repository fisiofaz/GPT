import React from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { gerarLinkWhatsAppTerritorio } from "../../utils/whatsappTerritorio";
import type { Territorio } from "../../types/territorio";
import type { Publicador } from "../../types/publicador";

interface ModalSucessoRetiradaProps {
  aberto: boolean;
  territorio: Territorio | null;
  publicador: Publicador | null;
  onFechar: () => void;
}

export const ModalSucessoRetirada: React.FC<ModalSucessoRetiradaProps> = ({
  aberto,
  territorio,
  publicador,
  onFechar,
}) => {
  if (!aberto || !territorio) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            Território Designado!
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            O território{" "}
            <strong className="text-slate-200">
              {territorio.numero} - {territorio.nome}
            </strong>{" "}
            foi registrado para{" "}
            <strong className="text-slate-200">{publicador?.nome}</strong>.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <a
            href={gerarLinkWhatsAppTerritorio(
              territorio,
              publicador || undefined,
            )}
            target="_blank"
            rel="noreferrer"
            onClick={onFechar}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar Cartão via WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={onFechar}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Concluir sem enviar
          </button>
        </div>
      </div>
    </div>
  );
};
