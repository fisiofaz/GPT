import { FileSpreadsheet, Printer, X } from "lucide-react";

import type { HistoricoTerritorio } from "../../types/territorio";

import { Pagination } from "../ui/Pagination";
import { Button } from "../ui/Button";

interface ModalRelatorioS13Props {
  aberto: boolean;
  carregando: boolean;
  relatorio: HistoricoTerritorio[];
  congregacaoNome?: string;

  paginaAtual: number;
  totalPaginas: number;
  totalElementos: number;
  tamanhoPagina: number;
  onPaginaAnterior: () => void;
  onProximaPagina: () => void;
  onTamanhoPaginaChange: (tamanho: number) => void;

  onFechar: () => void;
}

export function ModalRelatorioS13({
  aberto,
  carregando,
  relatorio,
  congregacaoNome,

  paginaAtual,
  totalPaginas,
  totalElementos,
  tamanhoPagina,

  onPaginaAnterior,
  onProximaPagina,
  onTamanhoPaginaChange,

  onFechar,
}: ModalRelatorioS13Props) {
  if (!aberto) {
    return null;
  }

  const formatarData = (dataIso?: string) => {
    if (!dataIso) {
      return "-";
    }

    const apenasData = dataIso.split("T")[0];
    const [ano, mes, dia] = apenasData.split("-");

    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-2 sm:p-6 print:static print:bg-white"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !carregando) {
          onFechar();
        }
      }}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="relatorio-s13-title"
      >
        {/* Cabeçalho da interface */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 print:hidden">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <FileSpreadsheet size={18} aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h2
                id="relatorio-s13-title"
                className="text-base font-semibold text-slate-900"
              >
                Relatório geral (S-13)
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Registro completo de designações
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              disabled={carregando}
            >
              <Printer size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Imprimir / Salvar PDF</span>
              <span className="sm:hidden">Imprimir</span>
            </Button>

            <button
              type="button"
              onClick={onFechar}
              disabled={carregando}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Fechar relatório"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Cabeçalho específico para impressão */}
        <div className="hidden border-b-2 border-black pb-3 print:mb-6 print:block">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tight">
                Registro de Designação de Territórios
              </h1>

              <p className="mt-0.5 text-xs text-gray-600">
                {congregacaoNome
                  ? `Congregação: ${congregacaoNome}`
                  : "Congregação"}
              </p>
            </div>

            <div className="text-right text-xs text-gray-500">
              Data de emissão: {new Date().toLocaleDateString("pt-BR")}
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 print:overflow-visible print:px-0 print:py-0">
          {carregando ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-slate-500 print:hidden">
              <div
                className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600"
                aria-hidden="true"
              />

              <p className="text-sm">Gerando relatório...</p>
            </div>
          ) : relatorio.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500 print:border-none print:bg-white print:text-black">
              Nenhuma designação registrada no histórico da congregação.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-slate-200 print:overflow-visible print:rounded-none print:border-black">
                <table className="w-full min-w-190 text-left text-sm text-slate-600 print:min-w-0 print:text-black">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 print:border-black print:bg-gray-100 print:text-black">
                    <tr>
                      <th className="w-16 border-r border-slate-200 px-3 py-3 text-center print:border-gray-300 print:px-2 print:py-2">
                        Nº
                      </th>

                      <th className="border-r border-slate-200 px-3 py-3 print:border-gray-300 print:px-2 print:py-2">
                        Território
                      </th>

                      <th className="border-r border-slate-200 px-3 py-3 print:border-gray-300 print:px-2 print:py-2">
                        Publicador
                      </th>

                      <th className="w-28 border-r border-slate-200 px-3 py-3 text-center print:border-gray-300 print:px-2 print:py-2">
                        Designado
                      </th>

                      <th className="w-28 border-r border-slate-200 px-3 py-3 text-center print:border-gray-300 print:px-2 print:py-2">
                        Devolvido
                      </th>

                      <th className="px-3 py-3 print:px-2 print:py-2">
                        Observações
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 print:divide-gray-300">
                    {relatorio.map((item) => (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-slate-50 print:hover:bg-transparent"
                      >
                        <td className="border-r border-slate-100 px-3 py-3 text-center font-semibold text-slate-700 print:border-gray-300 print:px-2 print:py-2 print:text-black">
                          {item.territorioNumero || "-"}
                        </td>

                        <td className="whitespace-nowrap border-r border-slate-100 px-3 py-3 font-medium text-slate-900 print:border-gray-300 print:px-2 print:py-2">
                          {item.territorioNome || "-"}
                        </td>

                        <td className="whitespace-nowrap border-r border-slate-100 px-3 py-3 text-slate-700 print:border-gray-300 print:px-2 print:py-2 print:text-black">
                          {item.publicadorNome}
                        </td>

                        <td className="whitespace-nowrap border-r border-slate-100 px-3 py-3 text-center print:border-gray-300 print:px-2 print:py-2">
                          {formatarData(item.dataRetirada)}
                        </td>

                        <td className="whitespace-nowrap border-r border-slate-100 px-3 py-3 text-center print:border-gray-300 print:px-2 print:py-2">
                          {item.dataDevolucao ? (
                            <span className="font-medium text-slate-700 print:text-black">
                              {formatarData(item.dataDevolucao)}
                            </span>
                          ) : (
                            <span className="inline-flex rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 print:bg-transparent print:text-gray-600">
                              Em andamento
                            </span>
                          )}
                        </td>

                        <td className="max-w-xs px-3 py-3 text-slate-500 print:max-w-none print:px-2 print:py-2 print:whitespace-normal print:text-black">
                          {item.observacoes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Paginação */}{" "}
              <div className="mt-4 print:hidden">
                {" "}
                <Pagination
                  paginaAtual={paginaAtual}
                  totalPaginas={totalPaginas}
                  totalElementos={totalElementos}
                  tamanhoPagina={tamanhoPagina}
                  onPaginaAnterior={onPaginaAnterior}
                  onProximaPagina={onProximaPagina}
                  onTamanhoPaginaChange={onTamanhoPaginaChange}
                  desabilitado={carregando}
                />
              </div>
            </>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 print:hidden">
          <span className="text-sm text-slate-500">
            Total de registros:{" "}
            <strong className="font-semibold text-slate-900">
              {relatorio.length}
            </strong>
          </span>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onFechar}
            disabled={carregando}
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
