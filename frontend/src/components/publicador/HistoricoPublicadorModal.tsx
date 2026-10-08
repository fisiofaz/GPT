import { useEffect, useState } from "react";
import { AlertTriangle, History, Trash2, X } from "lucide-react";

import { publicadorService } from "../../services/publicadorService";
import type {
  EventoHistoricoPublicador,
  HistoricoPublicador,
} from "../../types/publicador";

import { Button } from "../ui/Button";
import { LoadingState } from "../ui/LoadingState";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { Badge } from "../ui/Badge";

interface HistoricoPublicadorModalProps {
  aberto: boolean;
  publicadorId: number | null;
  nomePublicador?: string;
  onFechar: () => void;
}

const eventoLabel: Record<EventoHistoricoPublicador, string> = {
  CRIADO: "Criado",
  INATIVADO: "Inativado",
  REATIVADO: "Reativado",
  EXCLUIDO_DEFINITIVAMENTE: "Excluído definitivamente",
  ACESSO_SISTEMA_CONCEDIDO: "Acesso ao sistema concedido",
  ACESSO_SISTEMA_REMOVIDO: "Acesso ao sistema removido",
  TRANSFERIDO: "Transferido",
};

const eventoVariant: Record<
  EventoHistoricoPublicador,
  "success" | "warning" | "danger" | "info"
> = {
  CRIADO: "info",
  INATIVADO: "warning",
  REATIVADO: "success",
  EXCLUIDO_DEFINITIVAMENTE: "danger",
  ACESSO_SISTEMA_CONCEDIDO: "success",
  ACESSO_SISTEMA_REMOVIDO: "warning",
  TRANSFERIDO: "info",
};

function formatarData(data: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
}

export function HistoricoPublicadorModal({
  aberto,
  publicadorId,
  nomePublicador,
  onFechar,
}: HistoricoPublicadorModalProps) {
  const [historico, setHistorico] = useState<HistoricoPublicador[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [processandoExclusao, setProcessandoExclusao] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto || publicadorId === null) {
      return;
    }

    let ativo = true;

    const carregarHistorico = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const dados = await publicadorService.listarHistorico(publicadorId);

        if (ativo) {
          setHistorico(dados);
        }
      } catch {
        if (ativo) {
          setHistorico([]);
          setErro("Não foi possível carregar o histórico do publicador.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    carregarHistorico();

    return () => {
      ativo = false;
    };
  }, [aberto, publicadorId]);

  const abrirConfirmacaoExclusao = () => {
    setErroExclusao(null);
    setConfirmandoExclusao(true);
  };

  const cancelarExclusao = () => {
    if (processandoExclusao) return;

    setConfirmandoExclusao(false);
    setErroExclusao(null);
  };

  const confirmarExclusao = async () => {
    if (publicadorId === null) return;

    setProcessandoExclusao(true);
    setErroExclusao(null);

    try {
      await publicadorService.excluirDefinitivamente(publicadorId);

      setConfirmandoExclusao(false);
      onFechar();
    } catch {
      setErroExclusao(
        "Não foi possível excluir definitivamente o publicador. Verifique se existem vínculos que impedem a exclusão.",
      );
    } finally {
      setProcessandoExclusao(false);
    }
  };
  
  if (!aberto) {
    return null;
  }

  const eventosDeEstado = historico.filter(
    (registro) =>
      registro.evento === "CRIADO" ||
      registro.evento === "INATIVADO" ||
      registro.evento === "REATIVADO",
  );

  const ultimoEventoDeEstado = eventosDeEstado[eventosDeEstado.length - 1];

  const podeExcluirDefinitivamente =
    !carregando && !erro && ultimoEventoDeEstado?.evento === "INATIVADO";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="historico-publicador-titulo"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <History className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <h2
                id="historico-publicador-titulo"
                className="text-lg font-semibold text-slate-900"
              >
                Histórico do publicador
              </h2>

              {nomePublicador && (
                <p className="mt-1 text-sm text-slate-500">{nomePublicador}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Fechar histórico"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {carregando && <LoadingState />}

          {!carregando && erro && <ErrorState message={erro} />}

          {!carregando && !erro && historico.length === 0 && (
            <EmptyState
              title="Nenhum registro encontrado"
              description="Este publicador ainda não possui registros no histórico."
            />
          )}

          {!carregando && !erro && historico.length > 0 && (
            <div className="relative">
              <div className="space-y-6">
                {historico.map((registro, index) => (
                  <div key={registro.id} className="relative flex gap-4">
                    {index < historico.length - 1 && (
                      <div className="absolute left-2.25 top-6 h-[calc(100%+1.5rem)] w-px bg-slate-200" />
                    )}

                    <div className="relative z-10 mt-1 h-5 w-5 shrink-0 rounded-full border-4 border-white bg-slate-300 ring-1 ring-slate-200" />

                    <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant={eventoVariant[registro.evento]}>
                          {eventoLabel[registro.evento]}
                        </Badge>

                        <span className="text-xs text-slate-500">
                          {formatarData(registro.dataEvento)}
                        </span>
                      </div>

                      {registro.observacoes && (
                        <p className="mt-3 text-sm text-slate-600">
                          {registro.observacoes}
                        </p>
                      )}

                      {registro.usuarioResponsavelId && (
                        <p className="mt-2 text-xs text-slate-400">
                          Usuário responsável: {registro.usuarioResponsavelId}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
          <div>
            {podeExcluirDefinitivamente && (
              <Button
                type="button"
                variant="danger"
                onClick={abrirConfirmacaoExclusao}
                disabled={processandoExclusao}
              >
                <Trash2 size={16} />
                Excluir definitivamente
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={onFechar}
            disabled={processandoExclusao}
          >
            Fechar
          </Button>
        </div>
      </div>

      {confirmandoExclusao && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-slate-900">
                  Excluir publicador definitivamente?
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  Esta ação é irreversível. O publicador e os dados pessoais
                  vinculados a ele serão removidos definitivamente do sistema.
                </p>

                {erroExclusao && (
                  <p className="mt-3 text-sm text-red-600">{erroExclusao}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={cancelarExclusao}
                disabled={processandoExclusao}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant="danger"
                onClick={() => void confirmarExclusao()}
                disabled={processandoExclusao}
              >
                <Trash2 size={16} />

                {processandoExclusao
                  ? "Excluindo..."
                  : "Sim, excluir definitivamente"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
