import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  BookOpen,
  CalendarDays,
  Package,
  RefreshCw,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { useCongregacao } from "../context/useCongregacao";
import { publicacaoService } from "../services/publicacaoService";

import type { EstatisticasPublicacao } from "../types/publicacao";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";

type IndicadorProps = {
  titulo: string;
  valor: number;
  descricao: string;
  icone: typeof BookOpen;
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

function formatarData(data: string): string {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}

export function EstatisticasPublicacoes() {
  const { congregacaoSelecionadaId, congregacaoSelecionada } = useCongregacao();

  const congregacaoId = congregacaoSelecionadaId;

  const [inicio, setInicio] = useState(obterInicioMes);
  const [fim, setFim] = useState(obterHoje);
  const [estatisticas, setEstatisticas] =
    useState<EstatisticasPublicacao | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizacao, setAtualizacao] = useState(0);

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      if (!congregacaoId) {
        setEstatisticas(null);
        setErro(null);
        setCarregando(false);
        return;
      }

      if (!inicio || !fim || inicio > fim) {
        setEstatisticas(null);
        setErro("Informe um período válido.");
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const dados = await publicacaoService.obterEstatisticas(
          congregacaoId,
          inicio,
          fim,
        );

        if (ativo) {
          setEstatisticas(dados);
        }
      } catch (error) {
        console.error("[Estatísticas de publicações] Erro ao carregar:", error);

        if (ativo) {
          setEstatisticas(null);
          setErro("Não foi possível carregar as estatísticas das publicações.");
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

  const consultar = () => {
    setAtualizacao((valor) => valor + 1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Estatísticas de Publicações"
        subtitulo={
          nomeCongregacao
            ? `Indicadores de estoque e movimentações — ${nomeCongregacao}.`
            : "Indicadores de estoque e movimentações de publicações."
        }
        icon={BarChart3}
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={consultar}
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
                  htmlFor="estatisticas-publicacoes-inicio"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Data inicial
                </label>
                <input
                  id="estatisticas-publicacoes-inicio"
                  type="date"
                  value={inicio}
                  max={fim || obterHoje()}
                  onChange={(event) => setInicio(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label
                  htmlFor="estatisticas-publicacoes-fim"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Data final
                </label>
                <input
                  id="estatisticas-publicacoes-fim"
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
                onClick={consultar}
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
              <LoadingState message="Carregando estatísticas das publicações..." />
            </div>
          )}

          {!carregando && erro && (
            <ErrorState
              title="Não foi possível consultar"
              message={erro}
              onRetry={consultar}
            />
          )}

          {!carregando && !erro && estatisticas && (
            <>
              <section aria-labelledby="resumo-estoque">
                <h2
                  id="resumo-estoque"
                  className="mb-3 text-base font-semibold text-slate-900"
                >
                  Resumo do estoque
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <Indicador
                    titulo="Publicações cadastradas"
                    valor={estatisticas.totalPublicacoes}
                    descricao="Registros de estoque da congregação"
                    icone={BookOpen}
                  />

                  <Indicador
                    titulo="Estoques ativos"
                    valor={estatisticas.estoquesAtivos}
                    descricao="Publicações com estoque ativo"
                    icone={Package}
                  />

                  <Indicador
                    titulo="Total de exemplares"
                    valor={estatisticas.totalExemplares}
                    descricao="Exemplares nos estoques ativos"
                    icone={BarChart3}
                  />

                  <Indicador
                    titulo="Estoques baixos"
                    valor={estatisticas.estoquesBaixos}
                    descricao="Quantidade no limite mínimo ou abaixo dele"
                    icone={TrendingDown}
                  />

                  <Indicador
                    titulo="Estoques zerados"
                    valor={estatisticas.estoquesZerados}
                    descricao="Estoques ativos sem exemplares"
                    icone={Package}
                  />
                </div>
              </section>

              <section aria-labelledby="resumo-movimentacoes">
                <h2
                  id="resumo-movimentacoes"
                  className="mb-3 text-base font-semibold text-slate-900"
                >
                  Movimentações no período
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <Indicador
                    titulo="Entradas"
                    valor={estatisticas.entradasNoPeriodo}
                    descricao="Movimentações de entrada registradas"
                    icone={ArrowDownToLine}
                  />

                  <Indicador
                    titulo="Saídas"
                    valor={estatisticas.saidasNoPeriodo}
                    descricao="Movimentações de saída registradas"
                    icone={ArrowUpFromLine}
                  />

                  <Indicador
                    titulo="Ajustes de estoque"
                    valor={estatisticas.ajustesNoPeriodo}
                    descricao="Ajustes registrados no histórico"
                    icone={RotateCcw}
                  />

                  <Indicador
                    titulo="Exemplares recebidos"
                    valor={estatisticas.exemplaresEntradosNoPeriodo}
                    descricao="Soma das quantidades das entradas"
                    icone={TrendingUp}
                  />

                  <Indicador
                    titulo="Exemplares distribuídos"
                    valor={estatisticas.exemplaresSaidosNoPeriodo}
                    descricao="Soma das quantidades das saídas"
                    icone={TrendingDown}
                  />
                </div>
              </section>

              <Card className="p-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Resumo do período
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Entre <strong>{formatarData(inicio)}</strong> e{" "}
                  <strong>{formatarData(fim)}</strong>, foram registradas{" "}
                  <strong>
                    {estatisticas.entradasNoPeriodo.toLocaleString("pt-BR")}
                  </strong>{" "}
                  entradas,{" "}
                  <strong>
                    {estatisticas.saidasNoPeriodo.toLocaleString("pt-BR")}
                  </strong>{" "}
                  saídas e{" "}
                  <strong>
                    {estatisticas.ajustesNoPeriodo.toLocaleString("pt-BR")}
                  </strong>{" "}
                  ajustes de estoque. Nesse período, entraram{" "}
                  <strong>
                    {estatisticas.exemplaresEntradosNoPeriodo.toLocaleString(
                      "pt-BR",
                    )}
                  </strong>{" "}
                  exemplares e saíram{" "}
                  <strong>
                    {estatisticas.exemplaresSaidosNoPeriodo.toLocaleString(
                      "pt-BR",
                    )}
                  </strong>{" "}
                  exemplares.
                </p>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default EstatisticasPublicacoes;
