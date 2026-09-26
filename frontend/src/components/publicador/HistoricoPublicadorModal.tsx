import { useEffect, useState } from "react";
import { History, X } from "lucide-react";

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
};

const eventoVariant: Record<
  EventoHistoricoPublicador,
  "success" | "warning" | "danger" | "info"
> = {
  CRIADO: "info",
  INATIVADO: "warning",
  REATIVADO: "success",
  EXCLUIDO_DEFINITIVAMENTE: "danger",
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

  if (!aberto) {
    return null;
  }

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

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <Button type="button" variant="secondary" onClick={onFechar}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
