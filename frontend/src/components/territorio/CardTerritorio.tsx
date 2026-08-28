import React from "react";
import {
  Map,
  Edit3,
  MessageCircle,
  UserCheck,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { gerarLinkWhatsAppTerritorio } from "../../utils/whatsappTerritorio";
import type { Territorio, StatusTerritorio } from "../../types/territorio";

interface CardTerritorioProps {
  territorio: Territorio;
  onDesignar: (t: Territorio) => void;
  onDevolver: (t: Territorio) => void;
  onVisualizarCartao: (t: Territorio) => void;
  onDesenharMapa: (t: Territorio) => void;
}

export const CardTerritorio: React.FC<CardTerritorioProps> = ({
  territorio: t,
  onDesignar,
  onDevolver,
  onVisualizarCartao,
  onDesenharMapa,
}) => {
  const statusBadge = (status: StatusTerritorio) => {
    switch (status) {
      case "DISPONIVEL":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Disponível
          </span>
        );
      case "EM_TRABALHO":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Em Uso
          </span>
        );
      case "EM_ATRASO":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Em Atraso
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-indigo-400 border border-slate-700">
            {t.numero}
          </div>
          {statusBadge(t.status)}
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">{t.nome}</h3>
          {t.descricao && (
            <p className="text-xs text-slate-400 mt-1">{t.descricao}</p>
          )}
        </div>

        {/* Ações Geográficas do Cartão e Desenho */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
          <button
            onClick={() => onVisualizarCartao(t)}
            className="flex-1 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Map className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cartão</span>
          </button>

          <button
            onClick={() => onDesenharMapa(t)}
            className="py-1.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Desenhar</span>
          </button>

          {t.status === "EM_TRABALHO" && (
            <a
              href={gerarLinkWhatsAppTerritorio(t)}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition-all"
              title="Enviar no WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 mt-4 flex gap-2">
        {t.status === "DISPONIVEL" ? (
          <button
            onClick={() => onDesignar(t)}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            Designar / Retirar
          </button>
        ) : (
          <button
            onClick={() => onDevolver(t)}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-indigo-400" />
            Registrar Devolução
          </button>
        )}
      </div>
    </div>
  );
};
