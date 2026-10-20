import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  paginaAtual: number;
  totalPaginas: number;
  totalElementos: number;
  tamanhoPagina: number;
  onPaginaAnterior: () => void;
  onProximaPagina: () => void;
  onTamanhoPaginaChange: (tamanho: number) => void;
  desabilitado?: boolean;
}

export function Pagination({
  paginaAtual,
  totalPaginas,
  totalElementos,
  tamanhoPagina,
  onPaginaAnterior,
  onProximaPagina,
  onTamanhoPaginaChange,
  desabilitado = false,
}: PaginationProps) {
  const primeiraPagina = paginaAtual === 0;
  const ultimaPagina = totalPaginas === 0 || paginaAtual >= totalPaginas - 1;

  const inicio = totalElementos === 0 ? 0 : paginaAtual * tamanhoPagina + 1;

  const fim = Math.min((paginaAtual + 1) * tamanhoPagina, totalElementos);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-500">
        {totalElementos === 0
          ? "Nenhum registro"
          : `Mostrando ${inicio}–${fim} de ${totalElementos} registros`}
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="hidden sm:inline">Por página:</span>

          <select
            value={tamanhoPagina}
            onChange={(event) =>
              onTamanhoPaginaChange(Number(event.target.value))
            }
            disabled={desabilitado}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>

        <span className="min-w-20 text-center text-sm text-slate-600">
          {totalPaginas === 0
            ? "0 / 0"
            : `${paginaAtual + 1} / ${totalPaginas}`}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPaginaAnterior}
            disabled={primeiraPagina || desabilitado}
            aria-label="Página anterior"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={onProximaPagina}
            disabled={ultimaPagina || desabilitado}
            aria-label="Próxima página"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
