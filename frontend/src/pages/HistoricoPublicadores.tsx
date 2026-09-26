import { useEffect, useMemo, useState } from "react";
import { History, RefreshCw } from "lucide-react";
import { useAuth } from "../context/useAuth";

import { publicadorService } from "../services/publicadorService";
import type {
  EventoHistoricoPublicador,
  HistoricoPublicador,
} from "../types/publicador";

import { PageHeader } from "../components/ui/PageHeader";
import { SearchInput } from "../components/ui/SearchInput";
import { FilterBar } from "../components/ui/FilterBar";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Pagination } from "../components/ui/Pagination";
import { LoadingState } from "../components/ui/LoadingState";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";


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

export default function HistoricoPublicadores() {
    const { usuario } = useAuth();

    const [historico, setHistorico] = useState<HistoricoPublicador[]>([]);
    const [carregando, setCarregando] = useState(true);

    const [paginaAtual, setPaginaAtual] = useState(0);
    const [tamanhoPagina, setTamanhoPagina] = useState(10);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [totalElementos, setTotalElementos] = useState(0);

    const [atualizacao, setAtualizacao] = useState(0);

    const [erro, setErro] = useState<string | null>(null);

    const [busca, setBusca] = useState("");
    const [evento, setEvento] = useState<EventoHistoricoPublicador | "TODOS">(
        "TODOS",
    );

  const congregacaoId = usuario?.congregacaoId ?? null;

   useEffect(() => {
    let ativo = true;

    const buscarDados = async () => {
      if (!congregacaoId) {
        if (ativo) {
          setHistorico([]);
          setErro("Não foi possível identificar a congregação.");
          setCarregando(false);
        }

        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const dados = await publicadorService.listarHistoricoPorCongregacao(
          congregacaoId,
          paginaAtual,
          tamanhoPagina,
        );

        if (ativo) {
          setHistorico(dados.content);
          setTotalPaginas(dados.totalPages);
          setTotalElementos(dados.totalElements);
        }
      } catch {
        if (ativo) {
          setHistorico([]);
          setTotalPaginas(0);
          setTotalElementos(0);
          setErro("Não foi possível carregar o histórico de publicadores.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    void buscarDados();

    return () => {
      ativo = false;
    };
  }, [congregacaoId, paginaAtual, tamanhoPagina, atualizacao]);

  const historicoFiltrado = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return historico.filter((registro) => {
      const correspondeBusca =
        !termo || registro.nomePublicador.toLowerCase().includes(termo);

      const correspondeEvento =
        evento === "TODOS" || registro.evento === evento;

      return correspondeBusca && correspondeEvento;
    });
  }, [historico, busca, evento]);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Histórico de Publicadores"
        subtitulo="Consulte os eventos registrados dos publicadores da congregação."
        icon={History}
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={() => setAtualizacao((valor) => valor + 1)}
            disabled={carregando}
          >
            <RefreshCw
              size={16}
              className={carregando ? "animate-spin" : undefined}
            />
            Atualizar
          </Button>
        }
      />

      <FilterBar>
        <SearchInput
          value={busca}
          onChange={(event) => {
            setBusca(event.target.value);
            setPaginaAtual(0);
          }}
          placeholder="Buscar por nome do publicador..."
        />

        <Select
          value={evento}
          onChange={(event) => {
            setEvento(
              event.target.value as EventoHistoricoPublicador | "TODOS",
            );
            setPaginaAtual(0);
          }}
        >
          <option value="TODOS">Todos os eventos</option>
          <option value="CRIADO">Criado</option>
          <option value="INATIVADO">Inativado</option>
          <option value="REATIVADO">Reativado</option>
          <option value="EXCLUIDO_DEFINITIVAMENTE">
            Excluído definitivamente
          </option>
        </Select>
      </FilterBar>

      {carregando && <LoadingState />}

      {!carregando && erro && <ErrorState message={erro} />}

      {!carregando && !erro && historicoFiltrado.length === 0 && (
        <EmptyState
          title={
            historico.length === 0
              ? "Nenhum histórico encontrado"
              : "Nenhum registro corresponde aos filtros"
          }
          description={
            historico.length === 0
              ? "Ainda não existem eventos registrados para os publicadores desta congregação."
              : "Tente ajustar a busca ou o filtro de evento."
          }
        />
      )}

      {!carregando && !erro && historicoFiltrado.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Publicador
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Evento
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Data
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Usuário responsável
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Observações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {historicoFiltrado.map((registro) => (
                  <tr
                    key={registro.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                      {registro.nomePublicador}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge variant={eventoVariant[registro.evento]}>
                        {eventoLabel[registro.evento]}
                      </Badge>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatarData(registro.dataEvento)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {registro.usuarioResponsavelId ?? "—"}
                    </td>

                    <td className="max-w-sm px-4 py-3 text-slate-600">
                      {registro.observacoes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            {historicoFiltrado.length}{" "}
            {historicoFiltrado.length === 1
              ? "registro encontrado"
              : "registros encontrados"}
          </div>

          <Pagination
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            totalElementos={totalElementos}
            tamanhoPagina={tamanhoPagina}
            onPaginaAnterior={() =>
              setPaginaAtual((pagina) => Math.max(0, pagina - 1))
            }
            onProximaPagina={() =>
              setPaginaAtual((pagina) => Math.min(totalPaginas - 1, pagina + 1))
            }
            onTamanhoPaginaChange={(tamanho) => {
              setTamanhoPagina(tamanho);
              setPaginaAtual(0);
            }}
            desabilitado={carregando}
          />
        </div>
      )}
    </div>
  );
}
