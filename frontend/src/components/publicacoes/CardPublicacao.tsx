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
  const estoqueZerado = item.quantidadeEstoque <= 0;
  const estoqueBaixo = item.alertaEstoqueBaixo;

  return (
    <article
      className={[
        "flex h-full flex-col justify-between rounded-xl border bg-white p-5",
        "shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        estoqueBaixo
          ? "border-red-200 hover:border-red-300"
          : "border-slate-200 hover:border-slate-300",
      ].join(" ")}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">
            {item.codigo}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onEditar(item)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              title="Editar publicação"
              aria-label={`Editar publicação ${item.titulo}`}
            >
              <Pencil size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onExcluir(item)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              title="Excluir publicação"
              aria-label={`Excluir publicação ${item.titulo}`}
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold leading-snug text-slate-900">
            {item.titulo}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {rotuloFormato(item.formato)}
            </span>
            <BadgeCategoria categoria={item.categoria} />
          </div>
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <Globe size={15} aria-hidden="true" />
            {rotuloIdioma(item.idioma)}
          </p>
        </div>

        <div
          className={[
            "flex items-center justify-between gap-3 rounded-lg border p-4",
            estoqueBaixo
              ? "border-red-100 bg-red-50/60"
              : "border-slate-200 bg-slate-50",
          ].join(" ")}
        >
          <div>
            <p className="text-xs font-medium text-slate-500">
              Quantidade disponível
            </p>
            <p
              className={[
                "mt-1 text-3xl font-bold tabular-nums",
                estoqueZerado
                  ? "text-red-700"
                  : estoqueBaixo
                    ? "text-amber-700"
                    : "text-emerald-700",
              ].join(" ")}
            >
              {item.quantidadeEstoque}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">Estoque mínimo</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {item.estoqueMinimo} un.
            </p>
          </div>
        </div>

        {estoqueBaixo && (
          <div
            className="flex items-start gap-2 text-sm font-medium text-red-700"
            role="status"
          >
            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <span>
              {estoqueZerado
                ? "Estoque zerado"
                : "Estoque abaixo do mínimo"}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onMovimentar(item, "SAIDA")}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <ArrowUpRight size={16} aria-hidden="true" />
          Saída / entrega
        </button>

        <button
          type="button"
          onClick={() => onMovimentar(item, "ENTRADA")}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <ArrowDownLeft size={16} aria-hidden="true" />
          Entrada / caixa
        </button>
      </div>
    </article>
  );
};
