import React from "react";
import { History, Printer, X, Loader2 } from "lucide-react";
import type { MovimentacaoResponse } from "../../types/publicacao";

interface ModalHistoricoProps {
  aberto: boolean;
  carregando: boolean;
  historico: MovimentacaoResponse[];
  onFechar: () => void;
}

export const ModalHistorico: React.FC<ModalHistoricoProps> = ({
  aberto,
  carregando,
  historico,
  onFechar,
}) => {
  if (!aberto) return null;

  const formatarData = (dataIso?: string) => {
    if (!dataIso) return "-";
    const data = new Date(dataIso);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-5xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col print:border-none print:shadow-none print:max-w-none print:max-h-none print:p-0 print:bg-white print:text-black">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:hidden">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Movimentação de Publicações
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onFechar}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto print:overflow-visible">
          {carregando ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-xs">Carregando movimentações...</p>
            </div>
          ) : historico.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Nenhuma movimentação registrada até o momento.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300 print:text-black">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider print:bg-gray-100 print:text-black">
                <tr>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3 text-center">Tipo</th>
                  <th className="py-2.5 px-3 text-center">Qtd</th>
                  <th className="py-2.5 px-3">Destino / Publicador</th>
                  <th className="py-2.5 px-3">Responsável</th>
                  <th className="py-2.5 px-3">Observação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 print:bg-white print:divide-gray-300">
                {historico.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 font-mono">
                      {formatarData(mov.dataMovimentacao)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-indigo-400 font-semibold mr-1.5">
                        [{mov.publicacaoCodigo}]
                      </span>
                      <span className="text-white font-medium">
                        {mov.publicacaoTitulo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          mov.tipo === "ENTRADA"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : mov.tipo === "SAIDA"
                              ? "bg-rose-500/10 text-rose-400"
                              : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {mov.tipo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-white">
                      {mov.tipo === "SAIDA"
                        ? `-${mov.quantidade}`
                        : `+${mov.quantidade}`}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {mov.publicadorNome || "Balcão / Avulso"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {mov.responsavelNome}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 italic">
                      {mov.observacoes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-between items-center print:hidden">
          <span className="text-xs text-slate-500">
            Total de registros: {historico.length}
          </span>
          <button
            type="button"
            onClick={onFechar}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
