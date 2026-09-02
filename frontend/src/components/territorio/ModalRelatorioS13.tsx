import React from "react";
import { FileSpreadsheet, Printer, X, Loader2 } from "lucide-react";
import type { HistoricoTerritorio } from "../../types/territorio";

interface ModalRelatorioS13Props {
  aberto: boolean;
  carregando: boolean;
  relatorio: HistoricoTerritorio[];
  congregacaoNome?: string;
  onFechar: () => void;
}

export const ModalRelatorioS13: React.FC<ModalRelatorioS13Props> = ({
  aberto,
  carregando,
  relatorio,
  congregacaoNome,
  onFechar,
}) => {
  if (!aberto) return null;

  const formatarData = (dataIso?: string) => {
    if (!dataIso) return "-";
    const apenasData = dataIso.split("T")[0];
    const [ano, mes, dia] = apenasData.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-5xl w-full shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] flex flex-col print:border-none print:shadow-none print:max-w-none print:max-h-none print:p-0 print:bg-white print:text-black">
        {/* Top Header Ajustado para Mobile */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 print:hidden shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-white truncate">
                Relatório Geral (S-13)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Registro completo de designações
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="py-2 px-2.5 sm:px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onFechar}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cabeçalho de Impressão */}
        <div className="hidden print:block mb-6 border-b-2 border-black pb-3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold tracking-tight uppercase">
                Registro de Designação de Territórios
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">
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

        {/* Corpo com Tabela e Scroll */}
        <div className="flex-1 overflow-y-auto print:overflow-visible">
          {carregando ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 print:hidden">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-xs">Gerando relatório...</p>
            </div>
          ) : relatorio.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs sm:text-sm print:text-black">
              Nenhuma designação registrada no histórico da congregação.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 print:border-black print:rounded-none">
              <table className="w-full text-left text-xs text-slate-300 print:text-black">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider print:bg-gray-100 print:text-black print:border-black">
                  <tr>
                    <th className="py-3 px-3 sm:px-4 print:py-2 print:px-2 border-r border-slate-800 print:border-gray-300 w-12 sm:w-16 text-center">
                      Nº
                    </th>
                    <th className="py-3 px-3 sm:px-4 print:py-2 print:px-2 border-r border-slate-800 print:border-gray-300">
                      Território
                    </th>
                    <th className="py-3 px-3 sm:px-4 print:py-2 print:px-2 border-r border-slate-800 print:border-gray-300">
                      Publicador
                    </th>
                    <th className="py-3 px-3 sm:px-4 print:py-2 print:px-2 border-r border-slate-800 print:border-gray-300 w-24 sm:w-28 text-center">
                      Designado
                    </th>
                    <th className="py-3 px-3 sm:px-4 print:py-2 print:px-2 border-r border-slate-800 print:border-gray-300 w-24 sm:w-28 text-center">
                      Devolvido
                    </th>
                    <th className="py-3 px-3 sm:px-4 print:py-2 print:px-2">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50 print:bg-white print:divide-gray-300">
                  {relatorio.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors print:hover:bg-transparent"
                    >
                      <td className="py-3 px-3 sm:px-4 print:py-2 print:px-2 font-bold text-center text-indigo-400 print:text-black border-r border-slate-800 print:border-gray-300">
                        {item.territorioNumero || "-"}
                      </td>
                      <td className="py-3 px-3 sm:px-4 print:py-2 print:px-2 font-semibold text-white print:text-black border-r border-slate-800 print:border-gray-300 whitespace-nowrap">
                        {item.territorioNome || "-"}
                      </td>
                      <td className="py-3 px-3 sm:px-4 print:py-2 print:px-2 font-medium text-slate-200 print:text-black border-r border-slate-800 print:border-gray-300 whitespace-nowrap">
                        {item.publicadorNome}
                      </td>
                      <td className="py-3 px-3 sm:px-4 print:py-2 print:px-2 text-center text-slate-300 print:text-black border-r border-slate-800 print:border-gray-300 whitespace-nowrap">
                        {formatarData(item.dataRetirada)}
                      </td>
                      <td className="py-3 px-3 sm:px-4 print:py-2 print:px-2 text-center whitespace-nowrap border-r border-slate-800 print:border-gray-300">
                        {item.dataDevolucao ? (
                          <span className="text-emerald-400 print:text-black font-medium">
                            {formatarData(item.dataDevolucao)}
                          </span>
                        ) : (
                          <span className="text-amber-400 print:text-gray-600 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 print:border-none print:bg-transparent text-[10px] sm:text-xs">
                            Em andamento
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 sm:px-4 print:py-2 print:px-2 text-slate-400 print:text-black max-w-37.5 sm:max-w-xs truncate print:max-w-none print:whitespace-normal">
                        {item.observacoes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center print:hidden shrink-0">
          <span className="text-xs text-slate-500">
            Total de registros:{" "}
            <strong className="text-white">{relatorio.length}</strong>
          </span>
          <button
            type="button"
            onClick={onFechar}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
