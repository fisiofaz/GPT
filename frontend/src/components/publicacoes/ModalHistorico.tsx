import { History, Printer, X, Loader2 } from "lucide-react";

import type { MovimentacaoResponse } from "../../types/publicacao";
import { Button } from "../ui/Button";

interface ModalHistoricoProps {
  aberto: boolean;
  carregando: boolean;
  historico: MovimentacaoResponse[];
  onFechar: () => void;
}

const formatarData = (dataIso?: string) => {
  if (!dataIso) return "-";

  const data = new Date(dataIso);

  if (Number.isNaN(data.getTime())) return "-";

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const classeTipoMovimentacao = (tipo: string) => {
  switch (tipo) {
    case "ENTRADA":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "SAIDA":
      return "bg-rose-50 text-rose-700 ring-rose-600/20";
    default:
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
  }
};

export const ModalHistorico = ({
  aberto,
  carregando,
  historico,
  onFechar,
}: ModalHistoricoProps) => {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm print:static print:bg-white print:p-0"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onFechar();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-historico-titulo"
        className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:border-none print:shadow-none"
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <History className="h-5 w-5" aria-hidden="true" />
            </div>

            <div>
              <h2
                id="modal-historico-titulo"
                className="text-base font-semibold text-slate-900"
              >
                Histórico de movimentações
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Consulte as entradas, saídas e ajustes de publicações.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.print()}
              disabled={carregando || historico.length === 0}
            >
              <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
              Imprimir
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={onFechar}
              aria-label="Fechar histórico"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto print:overflow-visible">
          {carregando ? (
            <div
              className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500"
              role="status"
              aria-live="polite"
            >
              <Loader2
                className="h-8 w-8 animate-spin text-indigo-600"
                aria-hidden="true"
              />
              <p className="text-sm">Carregando movimentações...</p>
            </div>
          ) : historico.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <History className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="font-medium text-slate-800">
                Nenhuma movimentação registrada
              </p>
              <p className="mt-1 text-sm text-slate-500">
                As movimentações realizadas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm print:min-w-0">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 print:static print:bg-slate-100 print:text-slate-900">
                  <tr className="border-b border-slate-200">
                    <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                      Data
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Publicação
                    </th>
                    <th scope="col" className="px-4 py-3 text-center font-semibold">
                      Tipo
                    </th>
                    <th scope="col" className="px-4 py-3 text-center font-semibold">
                      Quantidade
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Destino / Publicador
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Responsável
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Observação
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {historico.map((mov) => (
                    <tr
                      key={mov.id}
                      className="transition-colors hover:bg-slate-50 print:hover:bg-white"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                        {formatarData(mov.dataMovimentacao)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-semibold text-indigo-700">
                          [{mov.publicacaoCodigo}]
                        </div>
                        <div className="mt-1 font-medium text-slate-800">
                          {mov.publicacaoTitulo}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${classeTipoMovimentacao(mov.tipo)}`}
                        >
                          {mov.tipo}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-center font-semibold tabular-nums text-slate-800">
                        <span
                          className={
                            mov.tipo === "SAIDA"
                              ? "text-rose-700"
                              : mov.tipo === "ENTRADA"
                                ? "text-emerald-700"
                                : "text-amber-700"
                          }
                        >
                          {mov.tipo === "SAIDA" ? "-" : "+"}
                          {mov.quantidade}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {mov.publicadorNome || "Balcão / Avulso"}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {mov.responsavelNome || "-"}
                      </td>

                      <td className="max-w-xs px-4 py-3 text-slate-500">
                        <span className="whitespace-pre-wrap break-words">
                          {mov.observacoes || "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 print:hidden">
          <span className="text-sm text-slate-500">
            Total de registros:{" "}
            <strong className="font-semibold text-slate-800">
              {historico.length}
            </strong>
          </span>

          <Button type="button" onClick={onFechar}>
            Fechar
          </Button>
        </footer>
      </section>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          [role="dialog"],
          [role="dialog"] * {
            visibility: visible;
          }

          [role="dialog"] {
            position: absolute;
            inset: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};