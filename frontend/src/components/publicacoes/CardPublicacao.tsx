import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Globe,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Publicacao } from "../../types/publicacao";
import { BadgeCategoria } from "./BadgeCategoria";

interface CardPublicacaoProps {
  item: Publicacao;
  onMovimentar: (item: Publicacao, tipo: "SAIDA" | "ENTRADA") => void;
  onEditar: (item: Publicacao) => void;
  onExcluir: (item: Publicacao) => void;
  rotuloFormato: (formato?: string) => string;
  rotuloIdioma: (idioma?: string) => string;
}

export const CardPublicacao: React.FC<CardPublicacaoProps> = ({
  item,
  onMovimentar,
  onEditar,
  onExcluir,
  rotuloFormato,
  rotuloIdioma,
}) => {
  return (
    <div
      className={`bg-slate-900/80 border rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg ${
        item.alertaEstoqueBaixo
          ? "border-rose-500/30 hover:border-rose-500/50"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-indigo-300">
            {item.codigo}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {rotuloFormato(item.formato)}
            </span>
            <BadgeCategoria categoria={item.categoria} />
            <button
              onClick={() => onEditar(item)}
              className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-all ml-1 cursor-pointer"
              title="Editar publicação"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onExcluir(item)}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              title="Excluir do estoque"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-white leading-snug">
            {item.titulo}
          </h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{rotuloIdioma(item.idioma)}</span>
          </p>
        </div>

        {/* Indicador de Estoque */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Disponível
            </span>
            <span
              className={`text-2xl font-black ${
                item.quantidadeEstoque <= 0
                  ? "text-rose-500"
                  : item.alertaEstoqueBaixo
                    ? "text-amber-400"
                    : "text-emerald-400"
              }`}
            >
              {item.quantidadeEstoque}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              Estoque Mínimo
            </span>
            <span className="text-sm font-bold text-slate-300">
              {item.estoqueMinimo} un.
            </span>
          </div>
        </div>

        {item.alertaEstoqueBaixo && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Estoque crítico ou zerado!</span>
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="pt-4 border-t border-slate-800/80 mt-4 flex gap-2">
        <button
          onClick={() => onMovimentar(item, "SAIDA")}
          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Saída / Entrega</span>
        </button>

        <button
          onClick={() => onMovimentar(item, "ENTRADA")}
          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Entrada / Caixa</span>
        </button>
      </div>
    </div>
  );
};
