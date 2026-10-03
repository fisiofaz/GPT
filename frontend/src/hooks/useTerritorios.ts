import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";

import { publicadorService } from "../services/publicadorService";
import { territorioService } from "../services/territorioService";

import type { Publicador } from "../types/publicador";

import type {
  DevolucaoRequest,
  DesignacaoRequest,
  HistoricoTerritorio,
  Territorio,
  TerritorioRequest,
} from "../types/territorio";

interface EstadoDadosTerritorios {
  congregacaoId: number | null;
  territorios: Territorio[];
  publicadores: Publicador[];
  historicoS13: HistoricoTerritorio[];
  totalPaginasTerritorios: number;
  totalTerritorios: number;
  totalPaginasHistorico: number;
  totalHistorico: number;
}

export function useTerritorios(congregacaoId?: number | null) {
  const [estadoDados, setEstadoDados] =
    useState<EstadoDadosTerritorios>({
      congregacaoId: null,
      territorios: [],
      publicadores: [],
      historicoS13: [],
      totalPaginasTerritorios: 0,
      totalTerritorios: 0,
      totalPaginasHistorico: 0,
      totalHistorico: 0,
    });

  const [carregando, setCarregando] = useState(
    Boolean(congregacaoId),
  );

  const [carregandoHistorico, setCarregandoHistorico] =
    useState(false);

  const [paginaTerritorios, setPaginaTerritorios] = useState(0);
  const [tamanhoPaginaTerritorios, setTamanhoPaginaTerritorios] =
    useState(10);

  const [paginaHistorico, setPaginaHistorico] = useState(0);
  const [tamanhoPaginaHistorico, setTamanhoPaginaHistorico] =
    useState(10);

  const dadosDaCongregacaoAtual =
    congregacaoId != null &&
    estadoDados.congregacaoId === congregacaoId
      ? estadoDados
      : null;

  const territorios =
    dadosDaCongregacaoAtual?.territorios ?? [];

  const publicadores =
    dadosDaCongregacaoAtual?.publicadores ?? [];

  const historicoS13 =
    dadosDaCongregacaoAtual?.historicoS13 ?? [];

  const totalPaginasTerritorios =
    dadosDaCongregacaoAtual?.totalPaginasTerritorios ?? 0;

  const totalTerritorios =
    dadosDaCongregacaoAtual?.totalTerritorios ?? 0;

  const totalPaginasHistorico =
    dadosDaCongregacaoAtual?.totalPaginasHistorico ?? 0;

  const totalHistorico =
    dadosDaCongregacaoAtual?.totalHistorico ?? 0;

  const buscarDados = useCallback(async () => {
    if (congregacaoId == null) {
      return null;
    }

    const [terData, pubData] = await Promise.all([
      territorioService.listarPorCongregacao(
        congregacaoId,
        paginaTerritorios,
        tamanhoPaginaTerritorios,
      ),
      publicadorService.listarPorCongregacao(congregacaoId),
    ]);

    return {
      congregacaoId,
      territorios: terData,
      publicadores: pubData,
    };
  }, [
    congregacaoId,
    paginaTerritorios,
    tamanhoPaginaTerritorios,
  ]);

  useEffect(() => {
    if (congregacaoId == null) {
      return;
    }

    let ativo = true;

    const carregarDados = async () => {
      try {
        setCarregando(true);

        const dados = await buscarDados();

        if (!ativo || !dados) {
          return;
        }

        setEstadoDados((estadoAnterior) => ({
          ...estadoAnterior,
          congregacaoId: dados.congregacaoId,
          territorios: dados.territorios.content,
          publicadores: dados.publicadores.content,
          totalPaginasTerritorios:
            dados.territorios.totalPages,
          totalTerritorios:
            dados.territorios.totalElements,
        }));
      } catch {
        if (!ativo) {
          return;
        }

        setEstadoDados((estadoAnterior) => ({
          ...estadoAnterior,
          congregacaoId,
          territorios: [],
          publicadores: [],
          totalPaginasTerritorios: 0,
          totalTerritorios: 0,
        }));

        toast.error(
          "Erro ao carregar dados de territórios.",
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    void carregarDados();

    return () => {
      ativo = false;
    };
  }, [buscarDados, congregacaoId]);

  const recarregar = useCallback(async () => {
    if (congregacaoId == null) {
      return;
    }

    setCarregando(true);

    try {
      const dados = await buscarDados();

      if (!dados) {
        return;
      }

      setEstadoDados((estadoAnterior) => ({
        ...estadoAnterior,
        congregacaoId: dados.congregacaoId,
        territorios: dados.territorios.content,
        publicadores: dados.publicadores.content,
        totalPaginasTerritorios:
          dados.territorios.totalPages,
        totalTerritorios:
          dados.territorios.totalElements,
      }));
    } catch {
      setEstadoDados((estadoAnterior) => ({
        ...estadoAnterior,
        congregacaoId,
        territorios: [],
        publicadores: [],
        totalPaginasTerritorios: 0,
        totalTerritorios: 0,
      }));

      toast.error("Erro ao atualizar territórios.");
    } finally {
      setCarregando(false);
    }
  }, [buscarDados, congregacaoId]);

  const salvarTerritorio = useCallback(
    async (
      dto: TerritorioRequest,
      id?: number,
    ) => {
      try {
        if (id) {
          await territorioService.atualizar(id, dto);

          toast.success(
            "Território atualizado com sucesso.",
          );
        } else {
          await territorioService.criar(dto);

          toast.success(
            "Território criado com sucesso.",
          );
        }

        await recarregar();
      } catch (error) {
        const mensagem =
          error instanceof Error
            ? error.message
            : "Erro ao salvar território.";

        toast.error(mensagem);

        throw error;
      }
    },
    [recarregar],
  );

  const atualizarTerritorio = useCallback(
    async (
      id: number,
      dto: TerritorioRequest,
    ) => {
      try {
        await territorioService.atualizar(id, dto);

        toast.success(
          "Território atualizado com sucesso.",
        );

        await recarregar();
      } catch (error) {
        const mensagem =
          error instanceof Error
            ? error.message
            : "Erro ao atualizar território.";

        toast.error(mensagem);

        throw error;
      }
    },
    [recarregar],
  );

  const excluirTerritorio = useCallback(
    async (
      id: number,
      numero: string,
    ) => {
      try {
        await territorioService.deletar(id);

        toast.success(
          `Território ${numero} excluído com sucesso.`,
        );

        await recarregar();
      } catch (error) {
        const mensagem =
          error instanceof Error
            ? error.message
            : "Erro ao excluir território.";

        toast.error(mensagem);

        throw error;
      }
    },
    [recarregar],
  );

  const designarTerritorio = useCallback(
    async (
      territorioId: number,
      dto: DesignacaoRequest,
    ) => {
      try {
        await territorioService.retirar(
          territorioId,
          dto,
        );

        toast.success(
          "Território designado com sucesso.",
        );

        await recarregar();
      } catch (error) {
        const mensagem =
          error instanceof Error
            ? error.message
            : "Erro ao designar território.";

        toast.error(mensagem);

        throw error;
      }
    },
    [recarregar],
  );

  const devolverTerritorio = useCallback(
    async (
      territorioId: number,
      dto: DevolucaoRequest,
    ) => {
      try {
        await territorioService.devolver(
          territorioId,
          dto,
        );

        toast.success(
          "Território devolvido com sucesso.",
        );

        await recarregar();
      } catch (error) {
        const mensagem =
          error instanceof Error
            ? error.message
            : "Erro ao devolver território.";

        toast.error(mensagem);

        throw error;
      }
    },
    [recarregar],
  );

  const paginaAnteriorTerritorios = useCallback(() => {
    setPaginaTerritorios((paginaAtual) => Math.max(0, paginaAtual - 1));
  }, []);

  const proximaPaginaTerritorios = useCallback(() => {
    setPaginaTerritorios((paginaAtual) =>
      Math.min(Math.max(0, totalPaginasTerritorios - 1), paginaAtual + 1),
    );
  }, [totalPaginasTerritorios]);

  const alterarTamanhoPaginaTerritorios = useCallback((tamanho: number) => {
    setTamanhoPaginaTerritorios(tamanho);
    setPaginaTerritorios(0);
  }, []);

  const carregarRelatorioS13 = useCallback(
    async (
      pagina = paginaHistorico,
      tamanho = tamanhoPaginaHistorico,
    ) => {
      if (congregacaoId == null) {
        return;
      }

      setCarregandoHistorico(true);

      try {
        const dados =
          await territorioService.listarHistoricoGeral(
            congregacaoId,
            pagina,
            tamanho,
          );

        setEstadoDados((estadoAnterior) => ({
          ...estadoAnterior,
          congregacaoId,
          historicoS13: dados.content,
          totalPaginasHistorico:
            dados.totalPages,
          totalHistorico:
            dados.totalElements,
        }));

        setPaginaHistorico(pagina);
        setTamanhoPaginaHistorico(tamanho);
      } catch (error) {
        const mensagem =
          error instanceof Error
            ? error.message
            : "Erro ao carregar relatório S-13.";

        toast.error(mensagem);

        throw error;
      } finally {
        setCarregandoHistorico(false);
      }
    },
    [
      congregacaoId,
      paginaHistorico,
      tamanhoPaginaHistorico,
    ],
  );

  const paginaAnteriorHistorico = useCallback(() => {
    setPaginaHistorico((paginaAtual) => Math.max(0, paginaAtual - 1));

    void carregarRelatorioS13(
      Math.max(0, paginaHistorico - 1),
      tamanhoPaginaHistorico,
    );
  }, [carregarRelatorioS13, paginaHistorico, tamanhoPaginaHistorico]);

  const proximaPaginaHistorico = useCallback(() => {
    const proximaPagina = Math.min(
      Math.max(0, totalPaginasHistorico - 1),
      paginaHistorico + 1,
    );

    setPaginaHistorico(proximaPagina);

    void carregarRelatorioS13(proximaPagina, tamanhoPaginaHistorico);
  }, [
    carregarRelatorioS13,
    paginaHistorico,
    tamanhoPaginaHistorico,
    totalPaginasHistorico,
  ]);

  const alterarTamanhoPaginaHistorico =
    useCallback(
      (tamanho: number) => {
        setTamanhoPaginaHistorico(tamanho);
        setPaginaHistorico(0);

        void carregarRelatorioS13(0, tamanho);
      },
      [carregarRelatorioS13],
    );

  return {
    territorios,
    publicadores,
    historicoS13,

    carregando,
    carregandoHistorico,

    paginaTerritorios,
    tamanhoPaginaTerritorios,
    totalPaginasTerritorios,
    totalTerritorios,

    paginaHistorico,
    tamanhoPaginaHistorico,
    totalPaginasHistorico,
    totalHistorico,

    salvarTerritorio,
    atualizarTerritorio,
    excluirTerritorio,

    designarTerritorio,
    devolverTerritorio,

    recarregar,

    setPaginaTerritorios,
    setTamanhoPaginaTerritorios,

    paginaAnteriorTerritorios,
    proximaPaginaTerritorios,
    alterarTamanhoPaginaTerritorios,

    carregarRelatorioS13,

    setPaginaHistorico,
    setTamanhoPaginaHistorico,

    paginaAnteriorHistorico,
    proximaPaginaHistorico,
    alterarTamanhoPaginaHistorico,
  };
}