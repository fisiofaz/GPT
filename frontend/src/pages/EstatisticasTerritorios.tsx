import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  CalendarDays,
  MapPin,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

import { useCongregacao } from "../context/useCongregacao";
import { territorioService } from "../services/territorioService";

import type { EstatisticasTerritorio } from "../types/territorio";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";

type IndicadorProps = {
  titulo: string;
  valor: number;
  descricao: string;
  icone: typeof MapPin;
};

function Indicador({ titulo, valor, descricao, icone: Icone }: IndicadorProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{titulo}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {valor.toLocaleString("pt-BR")}
          </p>
          <p className="mt-2 text-xs text-slate-500">{descricao}</p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          <Icone size={21} aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}

function dataLocalISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function obterInicioMes(): string {
  const agora = new Date();
  return dataLocalISO(new Date(agora.getFullYear(), agora.getMonth(), 1));
}

function obterHoje(): string {
  return dataLocalISO(new Date());
}

export function EstatisticasTerritorios() {
  const { congregacaoSelecionadaId, congregacaoSelecionada } = useCongregacao();

  const congregacaoId = congregacaoSelecionadaId;

  const [inicio, setInicio] = useState(obterInicioMes);
  const [fim, setFim] = useState(obterHoje);
  const [estatisticas, setEstatisticas] =
    useState<EstatisticasTerritorio | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizacao, setAtualizacao] = useState(0);

  

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      if (!congregacaoId) {
        setEstatisticas(null);
        setErro(null);
        return;
      }

      if (!inicio || !fim || inicio > fim) {
        setErro("Informe um período válido.");
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const dados = await territorioService.obterEstatisticas(
          congregacaoId,
          inicio,
          fim,
        );

        if (ativo) {
          setEstatisticas(dados);
        }
      } catch (error) {
        console.error("[Estatísticas de territórios] Erro ao carregar:", error);

        if (ativo) {
          setErro("Não foi possível carregar as estatísticas dos territórios.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    void carregar();

    return () => {
      ativo = false;
    };
  }, [congregacaoId, inicio, fim, atualizacao]);

  const nomeCongregacao = congregacaoSelecionada?.nome;

  const limparPeriodo = () => {
    setInicio(obterInicioMes());
    setFim(obterHoje());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Estatísticas de Territórios"
        subtitulo={
          nomeCongregacao
            ? `Indicadores e movimentações de territórios — ${nomeCongregacao}.`
            : "Indicadores e movimentações dos territórios da congregação."
        }
        icon={BarChart3}
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setAtualizacao((valor) => valor + 1)}
            disabled={!congregacaoId || carregando}
          >
            <RefreshCw size={16} />
            Atualizar
          </Button>
        }
      />

      {!congregacaoId ? (
        <ErrorState
          title="Selecione uma congregação"
          message="Selecione uma congregação no cabeçalho para consultar as estatísticas."
        />
      ) : (
        <>
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays size={18} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">
                Período da consulta
              </h2>
            </div>

            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]">
              <div>
                <label
                  htmlFor="estatisticas-inicio"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Data inicial
                </label>
                <input
                  id="estatisticas-inicio"
                  type="date"
                  value={inicio}
                  max={fim || undefined}
                  onChange={(event) => setInicio(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label
                  htmlFor="estatisticas-fim"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Data final
                </label>
                <input
                  id="estatisticas-fim"
                  type="date"
                  value={fim}
                  min={inicio || undefined}
                  max={obterHoje()}
                  onChange={(event) => setFim(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <Button
                type="button"
                onClick={() => setAtualizacao((valor) => valor + 1)}
                disabled={carregando || !inicio || !fim || inicio > fim}
              >
                <Activity size={16} />
                Consultar
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={limparPeriodo}
                disabled={carregando}
              >
                <RotateCcw size={16} />
                Mês atual
              </Button>
            </div>
          </Card>

          {carregando && (
            <div className="py-8">
              <LoadingState message="Carregando estatísticas dos territórios..." />
            </div>
          )}

          {!carregando && erro && (
            <ErrorState
              title="Não foi possível consultar"
              message={erro}
              onRetry={() => setAtualizacao((valor) => valor + 1)}
            />
          )}

          {!carregando && !erro && estatisticas && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Indicador
                  titulo="Total de territórios"
                  valor={estatisticas.totalTerritorios}
                  descricao="Territórios cadastrados na congregação"
                  icone={MapPin}
                />

                <Indicador
                  titulo="Disponíveis"
                  valor={estatisticas.territoriosDisponiveis}
                  descricao="Prontos para nova designação"
                  icone={ArrowDownToLine}
                />

                <Indicador
                  titulo="Em trabalho"
                  valor={estatisticas.territoriosEmTrabalho}
                  descricao="Atualmente em uso"
                  icone={Activity}
                />

                <Indicador
                  titulo="Novos cadastros"
                  valor={estatisticas.territoriosCadastradosNoPeriodo}
                  descricao="Cadastrados no período selecionado"
                  icone={BarChart3}
                />
              </div>

              <div>
                <h2 className="mb-3 text-base font-semibold text-slate-900">
                  Movimentações no período
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Indicador
                    titulo="Retiradas"
                    valor={estatisticas.retiradasNoPeriodo}
                    descricao="Retiradas registradas no histórico"
                    icone={ArrowUpFromLine}
                  />

                  <Indicador
                    titulo="Devoluções"
                    valor={estatisticas.devolucoesNoPeriodo}
                    descricao="Devoluções registradas no histórico"
                    icone={ArrowDownToLine}
                  />
                </div>
              </div>

              <Card className="p-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Resumo do período
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Entre{" "}
                  <strong>
                    {new Date(`${inicio}T12:00:00`).toLocaleDateString("pt-BR")}
                  </strong>{" "}
                  e{" "}
                  <strong>
                    {new Date(`${fim}T12:00:00`).toLocaleDateString("pt-BR")}
                  </strong>
                  , foram registradas{" "}
                  <strong>{estatisticas.retiradasNoPeriodo}</strong> retiradas e{" "}
                  <strong>{estatisticas.devolucoesNoPeriodo}</strong> devoluções
                  de territórios.
                </p>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default EstatisticasTerritorios;
